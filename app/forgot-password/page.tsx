import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({ title: "Reset password", description: "Reset your Zunora account password.", path: "/forgot-password", noIndex: true });

export default function ForgotPasswordPage({ searchParams }: { searchParams: { sent?: string } }) {
  return (
    <div className="container grid min-h-[70vh] place-items-center py-10">
      <Card className="w-full max-w-md">
        <CardHeader><CardTitle>Reset password</CardTitle></CardHeader>
        <CardContent>
          {searchParams.sent === "1" ? <p role="status" className="mb-4 text-sm text-muted-foreground">If an account can reset its password with this email, a reset link will be sent shortly.</p> : null}
          <form className="grid gap-4" action="/api/forgot-password" method="post">
            <Input name="email" type="email" placeholder="Email" required />
            <Button type="submit">Send reset link</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
