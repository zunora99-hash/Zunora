import { NextResponse } from "next/server";
import { filterProducts } from "@/lib/catalog";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const products = filterProducts({
    q: url.searchParams.get("q") ?? undefined,
    category: url.searchParams.get("category") ?? undefined,
    min: url.searchParams.get("min") ? Number(url.searchParams.get("min")) : undefined,
    max: url.searchParams.get("max") ? Number(url.searchParams.get("max")) : undefined,
    sort: url.searchParams.get("sort") ?? undefined
  });

  return NextResponse.json({ products });
}
