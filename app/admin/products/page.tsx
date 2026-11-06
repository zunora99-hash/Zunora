import { Plus, Search } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { products } from "@/lib/catalog";
import { formatPrice } from "@/lib/utils";

export default function AdminProductsPage() {
  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="eyebrow">Catalog</p>
          <h1 className="mt-2 font-serif text-5xl font-bold">Products</h1>
        </div>
        <Button><Plus className="h-4 w-4" /> New product</Button>
      </div>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Manage products</CardTitle>
          <label className="relative mt-4 block max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search products" className="pl-9" />
          </label>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-muted-foreground">
              <tr><th className="py-3">Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Featured</th><th>Active</th></tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t">
                  <td className="flex min-w-72 items-center gap-3 py-3">
                    <Image src={product.images[0]} alt={product.name} width={44} height={44} className="h-11 w-11 rounded-md object-cover" />
                    <div>
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-xs text-muted-foreground">/{product.slug}</p>
                    </div>
                  </td>
                  <td>{product.category}</td>
                  <td>{formatPrice(product.variants[0].price)}</td>
                  <td>{product.variants.reduce((sum, variant) => sum + variant.stock, 0)}</td>
                  <td><input type="checkbox" defaultChecked={product.featured} aria-label="Featured" /></td>
                  <td><input type="checkbox" defaultChecked aria-label="Active" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <Card className="mt-6">
        <CardHeader><CardTitle>Product editor</CardTitle></CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2">
            <Input placeholder="Product name" />
            <Input placeholder="Slug" />
            <Input placeholder="Meta title" />
            <Input placeholder="Meta description" />
            <Input placeholder="Category" />
            <Input placeholder="Image URL or Cloudinary upload" />
            <Button type="button" className="md:col-span-2">Save product draft</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
