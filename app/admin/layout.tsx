import Link from "next/link";
import type { ReactNode } from "react";
import { BarChart3, Boxes, Inbox, LayoutDashboard, ShoppingCart, Tags, Users } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { createMetadata } from "@/lib/seo";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/auth";

export const metadata = createMetadata({ title: "Admin", description: "Zunora store administration.", path: "/admin", noIndex: true });

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Boxes },
  { href: "/admin?tab=orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin?tab=customers", label: "Customers", icon: Users },
  { href: "/admin?tab=coupons", label: "Coupons", icon: Tags },
  { href: "/admin?tab=messages", label: "Messages", icon: Inbox },
  { href: "/admin?tab=reports", label: "Reports", icon: BarChart3 }
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminGate>{children}</AdminGate>;
}

async function AdminGate({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user.id || session.user.role !== "ADMIN") redirect("/login");
  return (
    <div className="container grid gap-6 py-8 lg:grid-cols-[250px_1fr]">
      <aside className="h-fit rounded-lg border bg-card p-4 lg:sticky lg:top-24">
        <Logo />
        <nav className="mt-6 grid gap-1">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground">
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div>{children}</div>
    </div>
  );
}
