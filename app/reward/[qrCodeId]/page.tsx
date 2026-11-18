import { notFound, redirect } from "next/navigation";
import { loyaltyQrCodeId } from "@/lib/loyalty";

export default function LoyaltyRegistrationPage({ params }: { params: { qrCodeId: string } }) {
  if (params.qrCodeId !== loyaltyQrCodeId) notFound();
  redirect("/newuser");
}
