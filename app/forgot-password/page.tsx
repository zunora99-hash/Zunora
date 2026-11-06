import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  return (
    <div className="container grid min-h-[70vh] place-items-center py-10">
      <Card className="w-full max-w-md">
        <CardHeader><CardTitle>Reset password</CardTitle></CardHeader>
        <CardContent>
          <form className="grid gap-4" action="/api/forgot-password" method="post">
            <Input name="email" type="email" placeholder="Email" required />
            <Button type="submit">Send reset link</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
