import Link from "next/link";
import type { ReactNode } from "react";
import { BadgePercent, BarChart3, Boxes, Inbox, LayoutDashboard, ShoppingCart, Tags, Users } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { createMetadata } from "@/lib/seo";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/auth";

export const metadata = createMetadata({ title: "Admin", description: "Zunora store administration.", path: "/admin", noIndex: true });

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Boxes },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin?tab=customers", label: "Customers", icon: Users },
  { href: "/admin/loyalty", label: "Loyalty rewards", icon: BadgePercent },
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
    <div className="container grid min-w-0 gap-4 py-4 sm:gap-6 sm:py-8 lg:grid-cols-[250px_minmax(0,1fr)]">
      <aside className="min-w-0 rounded-lg border bg-card p-3 sm:p-4 lg:sticky lg:top-24 lg:h-fit">
        <div className="hidden lg:block"><Logo /></div>
        <nav aria-label="Admin navigation" className="flex gap-1 overflow-x-auto lg:mt-6 lg:grid lg:overflow-visible">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground lg:gap-3">
                <Icon className="h-4 w-4" />
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
