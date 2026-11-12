import { Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { siteConfig } from "@/config/site";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({ title: "Contact Zunora in Belagavi | Dry Fruits Support", description: "Contact Zunora in Belagavi, Karnataka for dry fruits orders, product questions, and customer support.", path: "/contact" });

export default function ContactPage({ searchParams }: { searchParams: { sent?: string } }) {
  return (
    <div className="container grid gap-10 py-12 lg:grid-cols-[0.8fr_1.2fr]">
      <div>
        <p className="eyebrow">Contact</p>
        <h1 className="mt-3 font-serif text-5xl font-bold">We would love to help.</h1>
        <div className="mt-8 grid gap-4 text-sm">
          <p className="flex gap-3"><Phone className="h-5 w-5 text-olive" /> {siteConfig.contact.phone}</p>
          <p className="flex gap-3"><Mail className="h-5 w-5 text-olive" /> {siteConfig.contact.email}</p>
          <p className="flex gap-3"><MapPin className="h-5 w-5 text-olive" /> {siteConfig.contact.address}</p>
        </div>
      </div>
      <form action="/api/contact" method="post" className="rounded-lg border bg-card p-5">
        {searchParams.sent ? <p className="mb-4 rounded-md bg-olive/10 p-3 text-sm font-semibold text-olive">Message sent. We will get back soon.</p> : null}
        <div className="grid gap-4 md:grid-cols-2">
          <Input name="name" placeholder="Name" required />
          <Input name="email" type="email" placeholder="Email" required />
          <Input name="phone" placeholder="Phone" />
          <Input name="subject" placeholder="Subject" required />
          <Textarea name="message" placeholder="Message" required className="md:col-span-2" />
        </div>
        <Button className="mt-5">Send message</Button>
      </form>
    </div>
  );
}
