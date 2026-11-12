"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LocationPickerMap, type Coordinates } from "@/components/checkout/location-picker-map";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { checkoutSchema } from "@/lib/validations";
import { calculateTotals } from "@/lib/pricing";
import { freeGiftProduct, getFreeGiftQuantity } from "@/lib/catalog";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/stores/cart";

const checkoutFormSchema = checkoutSchema.omit({ items: true });
type FormValues = z.infer<typeof checkoutFormSchema>;

function collectErrorMessages(value: unknown): string[] {
  if (!value || typeof value !== "object") return [];
  if ("message" in value && typeof value.message === "string") return [value.message];
  return Object.values(value).flatMap(collectErrorMessages);
}

function getLocationProperties(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || !("features" in value) || !Array.isArray(value.features)) return null;
  const firstFeature: unknown = value.features[0];
  if (!firstFeature || typeof firstFeature !== "object" || !("properties" in firstFeature)) return null;
  const properties: unknown = firstFeature.properties;
  return properties && typeof properties === "object" ? properties as Record<string, unknown> : null;
}

function getLocationText(properties: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = properties[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

type RazorpayResult = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; email: string; contact: string };
  handler: (result: RazorpayResult) => void;
  modal: { ondismiss: () => void };
};

type RazorpayWidget = { open: () => void };
type RazorpayConstructor = new (options: RazorpayOptions) => RazorpayWidget;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

function loadRazorpayCheckout() {
  return new Promise<void>((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => window.Razorpay ? resolve() : reject(new Error("Razorpay checkout did not load."));
    script.onerror = () => reject(new Error("Could not load Razorpay checkout."));
    document.body.appendChild(script);
  });
}

export function CheckoutForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const items = useCartStore((state) => state.items);
  const clear = useCartStore((state) => state.clear);
  const [coupon, setCoupon] = useState("");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [pinPosition, setPinPosition] = useState<Coordinates | null>(null);
  const locationRequestId = useRef(0);
  const totals = useMemo(() => {
    const discount = coupon.toUpperCase() === "FRESH10" ? Math.round(items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 0.1) : 0;
    return calculateTotals(items.map((item) => ({ price: item.price, quantity: item.quantity })), discount);
  }, [coupon, items]);
  const freeGiftQuantity = getFreeGiftQuantity(items);

  const form = useForm<FormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      email: "",
      paymentMethod: "COD",
      couponCode: "",
      address: { country: "India", name: "", phone: "", line1: "", line2: "", city: "", state: "", postalCode: "" }
    }
  });

  useEffect(() => {
    if (session?.user.email) {
      form.setValue("email", session.user.email, { shouldValidate: true });
    }
  }, [form, session?.user.email]);

  async function applyCoordinates(coordinates: Coordinates) {
    const requestId = ++locationRequestId.current;
    setPinPosition(coordinates);
    form.setValue("address.latitude", coordinates.latitude, { shouldValidate: true });
    form.setValue("address.longitude", coordinates.longitude, { shouldValidate: true });
    for (const field of ["line1", "line2", "city", "state", "postalCode"] as const) {
      form.setValue(`address.${field}`, "", { shouldValidate: false });
    }

    try {
      const query = new URLSearchParams({ lat: String(coordinates.latitude), lon: String(coordinates.longitude) });
      const response = await fetch(`https://photon.komoot.io/reverse?${query}`, { signal: AbortSignal.timeout(10_000) });
      if (!response.ok) throw new Error("Address lookup is unavailable. Your pin is saved; enter the address fields manually.");
      const properties = getLocationProperties(await response.json());
      if (!properties) throw new Error("No address was found for this pin. Your pin is saved; enter the address fields manually.");
      if (requestId !== locationRequestId.current) return;

      const address = {
        line1: [getLocationText(properties, "housenumber"), getLocationText(properties, "street")].filter(Boolean).join(" ") || getLocationText(properties, "name"),
        line2: getLocationText(properties, "district", "suburb", "neighbourhood"),
        city: getLocationText(properties, "city", "town", "village", "municipality", "locality"),
        state: getLocationText(properties, "state"),
        postalCode: getLocationText(properties, "postcode"),
        country: getLocationText(properties, "country")
      };
      for (const [field, value] of Object.entries(address)) {
        if (value) form.setValue(`address.${field}` as `address.${keyof FormValues["address"]}`, value, { shouldValidate: true });
      }
      toast({ title: "Map pin selected", description: "Review the filled address and adjust the pin if needed." });
    } catch (error) {
      if (requestId !== locationRequestId.current) return;
      toast({
        title: "Pin saved; address needs review",
        description: error instanceof Error ? error.message : "Enter your address manually to continue."
      });
    }
  }

  async function fillAddressFromLocation() {
    if (!navigator.geolocation) {
      toast({ title: "Location unavailable", description: "Your browser does not support location access. Please enter your address manually." });
      return;
    }

    setLocating(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 20_000,
          maximumAge: 0
        });
      });
      await applyCoordinates({ latitude: position.coords.latitude, longitude: position.coords.longitude });
    } catch (error) {
      const description = error instanceof GeolocationPositionError
        ? error.code === error.PERMISSION_DENIED
          ? "Allow location access in your browser, or enter your address manually."
          : "Could not get your location. Check your device settings and try again."
        : error instanceof Error
          ? error.message
          : "Could not find your address. Please enter it manually.";
      toast({ title: "Could not set location", description });
    } finally {
      setLocating(false);
    }
  }

  async function onSubmit(values: FormValues) {
    if (!items.length) {
      toast({ title: "Cart is empty", description: "Add a product before checkout." });
      return;
    }
    const payload = {
      ...values,
      couponCode: coupon,
      items: items.map((item) => ({ productId: item.productId, variantId: item.variantId, quantity: item.quantity }))
    };
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      let data: {
        error?: string;
        redirect?: string;
        orderNumber?: string;
        razorpay?: { keyId: string; orderId: string; amount: number; currency: string };
      };
      try {
        data = await response.json();
      } catch {
        data = { error: "The server could not complete checkout. Please check the server logs and try again." };
      }
      if (!response.ok) {
        toast({ title: "Checkout failed", description: data.error ?? "Please check your details and try again." });
        return;
      }

      if (values.paymentMethod === "COD") {
        if (!data.redirect) throw new Error("The order was created without a confirmation page.");
        clear();
        router.push(data.redirect);
        return;
      }

      if (!data.razorpay || !data.orderNumber) throw new Error("The online payment order could not be prepared.");
      await loadRazorpayCheckout();
      if (!window.Razorpay) throw new Error("Razorpay checkout did not load.");

      const widget = new window.Razorpay({
        key: data.razorpay.keyId,
        amount: data.razorpay.amount,
        currency: data.razorpay.currency,
        name: "Zunora",
        description: "Premium dry fruits order",
        order_id: data.razorpay.orderId,
        prefill: {
          name: values.address.name,
          email: session?.user.email ?? values.email,
          contact: values.address.phone
        },
        handler: async (result) => {
          try {
            const verification = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderNumber: data.orderNumber, ...result })
            });
            const verifiedData = await verification.json() as { error?: string; redirect?: string };
            if (!verification.ok || !verifiedData.redirect) {
              setPaymentOpen(false);
              toast({ title: "Payment verification pending", description: verifiedData.error ?? "Your payment could not be verified. Please contact support before trying again." });
              return;
            }
            clear();
            router.push(verifiedData.redirect);
          } catch {
            setPaymentOpen(false);
            toast({ title: "Payment verification pending", description: "Your payment may have completed. Please contact support before trying again." });
          }
        },
        modal: {
          ondismiss: () => {
            setPaymentOpen(false);
            toast({ title: "Payment not completed", description: "Your order remains pending until payment is successful." });
          }
        }
      });
      widget.open();
      setPaymentOpen(true);
    } catch (error) {
      toast({
        title: "Checkout could not continue",
        description: error instanceof Error ? error.message : "Please try again or choose Cash on Delivery."
      });
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-8 lg:grid-cols-[1fr_390px]">
      {form.formState.isSubmitted && Object.keys(form.formState.errors).length ? (
        <div role="alert" className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive lg:col-span-2">
          <p className="font-semibold">Please check your checkout details:</p>
          <ul className="mt-2 list-inside list-disc">
            {collectErrorMessages(form.formState.errors).map((message, index) => <li key={`${message}-${index}`}>{message}</li>)}
          </ul>
        </div>
      ) : null}
      <div className="grid gap-5">
        <section className="rounded-lg border bg-card p-5">
          <h2 className="font-serif text-2xl font-semibold">Contact</h2>
          <Input
            className="mt-4"
            type="email"
            placeholder="Email"
            readOnly={Boolean(session?.user.email)}
            {...form.register("email")}
          />
          <p className="mt-2 text-sm text-muted-foreground">
            {session?.user.email
              ? "Your order confirmation will be sent to your account email."
              : "We will send your order confirmation to this email address."}
          </p>
        </section>
        <section className="rounded-lg border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-serif text-2xl font-semibold">Shipping address</h2>
            <Button type="button" variant="outline" onClick={fillAddressFromLocation} disabled={locating}>
              <MapPin className="h-4 w-4" />
              {locating ? "Finding location..." : "Use my location"}
            </Button>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Allow location access to find your address, or search and pin it on the map. Review the address before ordering. Street tiles use OpenStreetMap, satellite imagery uses Esri, and address search uses Photon. Your selected pin is saved with your delivery address.</p>
          <div className="mt-4">
            <LocationPickerMap position={pinPosition} onSelect={applyCoordinates} />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Input placeholder="Full name" {...form.register("address.name")} />
            <Input placeholder="Phone" {...form.register("address.phone")} />
            <Input className="md:col-span-2" placeholder="Address line 1" {...form.register("address.line1")} />
            <Input className="md:col-span-2" placeholder="Address line 2" {...form.register("address.line2")} />
            <Input placeholder="City" {...form.register("address.city")} />
            <Input placeholder="State" {...form.register("address.state")} />
            <Input placeholder="Postal code" {...form.register("address.postalCode")} />
            <Input placeholder="Country" {...form.register("address.country")} />
          </div>
        </section>
        <section className="rounded-lg border bg-card p-5">
          <h2 className="font-serif text-2xl font-semibold">Payment</h2>
          <div className="mt-4 grid gap-3">
            <label className="flex items-center gap-3 rounded-md border p-4">
              <input type="radio" value="COD" {...form.register("paymentMethod")} />
              Cash on Delivery
            </label>
            <label className="flex items-center gap-3 rounded-md border p-4">
              <input type="radio" value="RAZORPAY" {...form.register("paymentMethod")} />
              Razorpay prepaid
            </label>
          </div>
          <Textarea className="mt-4" placeholder="Delivery notes (optional)" />
        </section>
      </div>
      <aside className="h-fit rounded-lg border bg-card p-5">
        <h2 className="font-serif text-2xl font-semibold">Order summary</h2>
        <div className="mt-4 grid gap-4">
          {items.map((item) => (
            <div key={item.variantId} className="grid grid-cols-[56px_1fr_auto] gap-3">
              <Image src={item.image} alt={item.name} width={56} height={56} className="h-14 w-14 rounded-md object-cover" />
              <div>
                <p className="text-sm font-semibold">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.variant} x {item.quantity}</p>
              </div>
              <p className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</p>
            </div>
          ))}
          {freeGiftProduct && freeGiftQuantity > 0 ? (
            <div className="grid grid-cols-[56px_1fr_auto] items-center gap-3 rounded-md border border-olive/30 bg-olive/5 p-2">
              <Image src={freeGiftProduct.images[0]} alt={freeGiftProduct.name} width={56} height={56} className="h-14 w-14 rounded-md object-cover" />
              <div>
                <p className="text-sm font-semibold">{freeGiftProduct.name}</p>
                <p className="text-xs text-muted-foreground">Free gift · {freeGiftQuantity} pack{freeGiftQuantity === 1 ? "" : "s"}</p>
              </div>
              <p className="text-sm font-semibold text-olive">FREE</p>
            </div>
          ) : null}
        </div>
        <div className="mt-5 flex gap-2">
          <Input value={coupon} onChange={(event) => setCoupon(event.target.value)} placeholder="Coupon code" />
          <Button type="button" variant="outline" onClick={() => setCoupon(coupon.trim().toUpperCase())}>Apply</Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Orders of ₹100 or more get free delivery. Orders below ₹100 have a ₹25 delivery charge.</p>
        <div className="mt-5 grid gap-2 border-t pt-5 text-sm">
          <SummaryLine label="Subtotal" value={totals.subtotal} />
          <SummaryLine label="Discount" value={-totals.discount} />
          <SummaryLine label="Shipping" value={totals.shipping} />
          <SummaryLine label="GST" value={totals.gst} />
          <div className="mt-2 flex items-center justify-between text-lg font-bold">
            <span>Total</span>
            <span>{formatPrice(totals.total)}</span>
          </div>
        </div>
        <Button className="mt-5 w-full" size="lg" disabled={form.formState.isSubmitting || paymentOpen || !items.length}>
          {paymentOpen ? "Complete payment..." : form.formState.isSubmitting ? "Placing order..." : form.watch("paymentMethod") === "RAZORPAY" ? "Continue to payment" : "Place order"}
        </Button>
      </aside>
    </form>
  );
}

function SummaryLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span>{formatPrice(value)}</span>
    </div>
  );
}
