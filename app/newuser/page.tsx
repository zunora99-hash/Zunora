import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoyaltyRegistrationForm } from "@/components/loyalty/loyalty-registration-form";
import { loyaltyQrCodeId } from "@/lib/loyalty";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({ title: "Your Zunora Scratch Reward", description: "Register and scratch to reveal your unique 5% reward code.", path: "/newuser", noIndex: true });

export default function NewUserRewardPage() {
  return (
    <div className="container max-w-xl py-12">
      <p className="eyebrow">A little thank you</p>
      <h1 className="mt-2 font-serif text-4xl font-bold">Register and reveal 5% off</h1>
      <p className="mt-3 text-muted-foreground">Enter your name and mobile number to receive a unique scratch card code for your next order.</p>
      <Card className="mt-8">
        <CardHeader><CardTitle>Customer details</CardTitle></CardHeader>
        <CardContent><LoyaltyRegistrationForm qrCodeId={loyaltyQrCodeId} /></CardContent>
      </Card>
    </div>
  );
}
