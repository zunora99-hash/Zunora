import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({ title: "Set new password", description: "Choose a new password for your Zunora account.", path: "/reset-password", noIndex: true });

export default function ResetPasswordPage() {
  return (
    <div className="container grid min-h-[70vh] place-items-center py-10">
      <Card className="w-full max-w-md">
        <CardHeader><CardTitle>Set new password</CardTitle></CardHeader>
        <CardContent>
          <form className="grid gap-4">
            <Input type="password" placeholder="New password" required />
            <Input type="password" placeholder="Confirm password" required />
            <Button type="submit">Update password</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
