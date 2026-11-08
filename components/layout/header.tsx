"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useMemo, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/layout/logo";
import { getCartTotals, useCartStore } from "@/stores/cart";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" }
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { data: session } = useSession();
  const accountLabel = session?.user?.name?.trim() || session?.user?.email?.split("@")[0] || "Account";
  const items = useCartStore((state) => state.items);
  const setDrawerOpen = useCartStore((state) => state.setDrawerOpen);
  const { count } = useMemo(() => getCartTotals(items), [items]);

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    const search = query.trim();
    router.push(search ? `/shop?q=${encodeURIComponent(search)}` : "/shop");
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="container flex h-20 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-7 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-semibold text-muted-foreground transition hover:text-foreground",
                pathname === item.href && "text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <form onSubmit={submitSearch} className="hidden min-w-[260px] max-w-sm flex-1 lg:block">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search almonds, cashews, gift boxes"
              className="pl-9"
              aria-label="Search products"
            />
          </label>
        </form>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setDrawerOpen(true)} aria-label="Open cart">
            <ShoppingBag className="h-5 w-5" />
            {count ? (
              <span className="absolute ml-7 mt-[-22px] flex h-5 min-w-5 items-center justify-center rounded-full bg-saffron px-1 text-[11px] font-bold text-cacao">
                {count}
              </span>
            ) : null}
          </Button>
          {session?.user ? (
            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/account" className="flex max-w-40 items-center gap-2 text-sm font-semibold text-cacao hover:text-olive" title={accountLabel}>
                <UserRound className="h-4 w-4 shrink-0" />
                <span className="truncate">{accountLabel}</span>
              </Link>
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                Sign out
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
              <Link href="/login">
                <UserRound className="h-4 w-4" />
                Login
              </Link>
            </Button>
          )}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMenuOpen((value) => !value)}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      {menuOpen ? (
        <div className="border-t bg-background px-4 py-4 md:hidden">
          <form onSubmit={submitSearch} className="mb-4">
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" />
          </form>
          <nav className="grid gap-3">
            {[...nav, { href: "/account", label: "Account" }].map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="py-2 font-semibold">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
