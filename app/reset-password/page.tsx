import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordResetForm } from "@/components/auth/password-reset-form";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({ title: "Set new password", description: "Choose a new password for your Zunora account.", path: "/reset-password", noIndex: true });

export default function ResetPasswordPage({ searchParams }: { searchParams: { reset?: string } }) {
  return (
    <div className="container grid min-h-[70vh] place-items-center py-10">
      <Card className="w-full max-w-md">
        <CardHeader><CardTitle>Set new password</CardTitle></CardHeader>
        <CardContent>
          {searchParams.reset === "success" ? <p role="status" className="mb-4 text-sm text-muted-foreground">Password updated. You can now sign in with your new password.</p> : null}
          {searchParams.reset === "invalid" ? <p role="alert" className="mb-4 text-sm text-destructive">This reset link is invalid or expired. Request a new link.</p> : null}
          <PasswordResetForm />
        </CardContent>
      </Card>
    </div>
  );
}
