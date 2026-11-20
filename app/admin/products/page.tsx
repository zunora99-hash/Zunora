import { StockEditor } from "@/components/admin/stock-editor";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      category: { select: { name: true } },
      variants: { orderBy: { weightG: "asc" }, select: { id: true, label: true, stock: true } }
    }
  });

  return <div>
    <p className="eyebrow">Catalog inventory</p>
    <h1 className="mt-2 font-serif text-4xl font-bold sm:text-5xl">Products & stock</h1>
    <p className="mt-3 max-w-2xl text-sm text-muted-foreground">Update on-hand stock for each product size. Changes are saved directly to the store inventory.</p>
    <StockEditor products={products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      category: product.category.name,
      variants: product.variants
    }))} />
  </div>;
}
