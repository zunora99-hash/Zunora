import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({ title: "Privacy Policy", description: "Zunora privacy policy for customers.", path: "/privacy" });

export default function PrivacyPage() {
  return <Policy title="Privacy Policy" paragraphs={["We collect only the information needed to process orders, provide support, prevent fraud, and improve the store experience.", "Payment details are handled by payment providers such as Razorpay and are not stored on Zunora servers.", "You can request correction or deletion of account data by contacting support. Some order records may be retained for tax and compliance requirements."]} />;
}

function Policy({ title, paragraphs }: { title: string; paragraphs: string[] }) {
  return (
    <div className="container max-w-3xl py-12">
      <h1 className="font-serif text-5xl font-bold">{title}</h1>
      <div className="mt-6 grid gap-4 text-muted-foreground">
        {paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </div>
    </div>
  );
}
