import { slugify } from "@/lib/utils";

export type CatalogVariant = {
  id: string;
  label: "15g" | "25g" | "250g" | "500g" | "1kg";
  weightG: number;
  price: number;
  mrp: number;
  stock: number;
};

export type CatalogProduct = {
  id: string;
  name: string;
  slug: string;
  category: string;
  categorySlug: string;
  description: string;
  shortDescription: string;
  images: string[];
  video?: string;
  rating: number;
  reviewCount: number;
  featured: boolean;
  availableForSale: boolean;
  eligibleForFreeGift?: boolean;
  freeGiftOnly?: boolean;
  tags: string[];
  nutrition: Record<string, string>;
  ingredients: string;
  origin: string;
  variants: CatalogVariant[];
};

type StoreCategory = {
  name: string;
  slug: string;
  description: string;
  image: string;
  storefront: boolean;
  comingSoon?: boolean;
};

export const categories: StoreCategory[] = [
  {
    name: "Almonds",
    slug: "almonds",
    description: "Zunora almonds are coming soon.",
    image: "",
    storefront: true,
    comingSoon: true
  },
  {
    name: "Cashews",
    slug: "cashews",
    description: "Shop Zunora 25 g cashew snack packs.",
    image: "/products/zunora-salted-cashew-25g.png",
    storefront: true
  },
  {
    name: "Pistachios",
    slug: "pistachios",
    description: "Roasted and natural pistachios with bold flavor and vibrant color.",
    image: "https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?auto=format&fit=crop&w=900&q=80",
    storefront: false
  },
  {
    name: "Dates & Figs",
    slug: "dates-figs",
    description: "Naturally sweet dates and figs for desserts, energy, and festive boxes.",
    image: "https://images.unsplash.com/photo-1596363505729-4190a9506133?auto=format&fit=crop&w=900&q=80",
    storefront: false
  },
  {
    name: "Walnuts & Seeds",
    slug: "walnuts-seeds",
    description: "Omega-rich walnuts and seed mixes for breakfast bowls and trail blends.",
    image: "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=900&q=80",
    storefront: false
  },
  {
    name: "Gift Boxes",
    slug: "gift-boxes",
    description: "Curated dry fruits gift boxes for celebrations and corporate gifting.",
    image: "https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=900&q=80",
    storefront: false
  }
];

export const storefrontCategories = categories.filter((category) => category.storefront);

const productNames = [
  ["Premium California Almonds", "Almonds", "almonds", 299, "https://images.unsplash.com/photo-1608797178974-15b35a64ede9?auto=format&fit=crop&w=900&q=80"],
  ["Mamra Almond Reserve", "Almonds", "almonds", 449, "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=900&q=80"],
  ["Whole W320 Cashews", "Cashews", "cashews", 329, "https://images.unsplash.com/photo-1608797178974-15b35a64ede9?auto=format&fit=crop&w=900&q=80"],
  ["Saffron Roasted Cashews", "Cashews", "cashews", 389, "https://images.unsplash.com/photo-1608797178974-15b35a64ede9?auto=format&fit=crop&w=900&q=80"],
  ["Iranian Pistachios Salted", "Pistachios", "pistachios", 379, "https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?auto=format&fit=crop&w=900&q=80"],
  ["Natural Pistachio Kernels", "Pistachios", "pistachios", 499, "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&w=900&q=80"],
  ["Kashmiri Walnut Kernels", "Walnuts & Seeds", "walnuts-seeds", 349, "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=900&q=80"],
  ["Seed Power Breakfast Mix", "Walnuts & Seeds", "walnuts-seeds", 249, "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=900&q=80"],
  ["Medjool Dates Jumbo", "Dates & Figs", "dates-figs", 399, "https://images.unsplash.com/photo-1596363505729-4190a9506133?auto=format&fit=crop&w=900&q=80"],
  ["Afghan Dried Figs", "Dates & Figs", "dates-figs", 359, "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80"],
  ["Golden Raisins Select", "Dates & Figs", "dates-figs", 189, "https://images.unsplash.com/photo-1596363505729-4190a9506133?auto=format&fit=crop&w=900&q=80"],
  ["Trail Mix Daily Energy", "Walnuts & Seeds", "walnuts-seeds", 279, "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=900&q=80"],
  ["Royal Dry Fruits Gift Box", "Gift Boxes", "gift-boxes", 999, "https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=900&q=80"],
  ["Festive Premium Assortment", "Gift Boxes", "gift-boxes", 1299, "https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=900&q=80"],
  ["Corporate Wellness Hamper", "Gift Boxes", "gift-boxes", 1599, "https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=900&q=80"]
] as const;

const legacyProducts: CatalogProduct[] = productNames.map(([name, category, categorySlug, basePrice, image], index) => {
  const slug = slugify(name);
  return {
    id: `prod_${index + 1}`,
    name,
    slug,
    category,
    categorySlug,
    description:
      `${name} are hand-selected, batch-packed, and sealed for crunch and natural flavor. Ideal for healthy snacking, festive gifting, breakfast bowls, and anyone looking to buy dry fruits online from a premium source.`,
    shortDescription: "Batch-packed premium dry fruits with rich flavor and reliable freshness.",
    images: [image, "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=900&q=80"],
    rating: Number((4.4 + (index % 5) * 0.1).toFixed(1)),
    reviewCount: 18 + index * 7,
    featured: index < 8 || categorySlug === "gift-boxes",
    availableForSale: false,
    tags: ["premium", categorySlug, index % 2 === 0 ? "best-seller" : "new"],
    nutrition: {
      protein: `${8 + (index % 5)}g`,
      fiber: `${4 + (index % 4)}g`,
      energy: `${150 + index * 8} kcal`,
      fats: `${10 + (index % 6)}g`
    },
    ingredients: "100% natural dry fruits. No artificial colors or preservatives.",
    origin: index % 2 === 0 ? "India packed, imported origin" : "Premium Indian farms",
    variants: [
      { id: `${slug}-250g`, label: "250g", weightG: 250, price: basePrice, mrp: basePrice + 60, stock: 28 + index },
      { id: `${slug}-500g`, label: "500g", weightG: 500, price: Math.round(basePrice * 1.88), mrp: Math.round(basePrice * 2.1), stock: 18 + index },
      { id: `${slug}-1kg`, label: "1kg", weightG: 1000, price: Math.round(basePrice * 3.55), mrp: Math.round(basePrice * 4.1), stock: 8 + index }
    ]
  };
});

const launchProducts: CatalogProduct[] = [
  {
    id: "prod_zunora_salted_cashew_25g",
    name: "Zunora Salted Cashew Pack (25 g)",
    slug: "zunora-salted-cashew-25g",
    category: "Cashews",
    categorySlug: "cashews",
    description: "A 25 g pack of Zunora Salted Cashew. The supplied pack design describes these cashews as dry roasted, not fried. Check the package for ingredient, allergen, and nutrition details.",
    shortDescription: "Salted, dry-roasted cashew snack in a handy 25 g pack.",
    images: ["/products/zunora-salted-cashew-25g.png"],
    video: "/products/zunora-salted-cashew-25g.mp4",
    rating: 0,
    reviewCount: 0,
    featured: true,
    availableForSale: true,
    eligibleForFreeGift: true,
    tags: ["cashews", "salted", "25g"],
    nutrition: {},
    ingredients: "Refer to the product packaging.",
    origin: "Refer to the product packaging.",
    variants: [{ id: "zunora-salted-cashew-25g-pack", label: "25g", weightG: 25, price: 40, mrp: 40, stock: 50 }]
  },
  {
    id: "prod_zunora_peri_peri_cashew_25g",
    name: "Zunora Peri Peri Masala Cashew (25 g)",
    slug: "zunora-peri-peri-masala-cashew-25g",
    category: "Cashews",
    categorySlug: "cashews",
    description: "A 25 g pack of Zunora Peri Peri Masala Cashew. The supplied pack design describes these cashews as dry roasted, not fried. Check the package for ingredient, allergen, and nutrition details.",
    shortDescription: "A bold peri peri masala cashew snack in a 25 g pack.",
    images: ["/products/zunora-peri-peri-cashew-25g.png"],
    video: "/products/zunora-peri-peri-cashew-25g.mp4",
    rating: 0,
    reviewCount: 0,
    featured: true,
    availableForSale: true,
    eligibleForFreeGift: true,
    tags: ["cashews", "peri-peri", "25g"],
    nutrition: {},
    ingredients: "Refer to the product packaging.",
    origin: "Refer to the product packaging.",
    variants: [{ id: "zunora-peri-peri-cashew-25g-pack", label: "25g", weightG: 25, price: 40, mrp: 40, stock: 50 }]
  },
  {
    id: "prod_zunora_raw_cashew_25g",
    name: "Zunora Raw & Natural Cashew (25 g)",
    slug: "zunora-raw-natural-cashew-25g",
    category: "Cashews",
    categorySlug: "cashews",
    description: "A 25 g pack of Zunora Raw & Natural Cashew. Check the package for ingredient, allergen, and nutrition details.",
    shortDescription: "Raw and natural cashews in a handy 25 g pack.",
    images: ["/products/zunora-raw-cashew-25g.png"],
    video: "/products/zunora-raw-cashew-25g.mp4",
    rating: 0,
    reviewCount: 0,
    featured: true,
    availableForSale: true,
    eligibleForFreeGift: true,
    tags: ["cashews", "raw", "25g"],
    nutrition: {},
    ingredients: "Refer to the product packaging.",
    origin: "Refer to the product packaging.",
    variants: [{ id: "zunora-raw-cashew-25g-pack", label: "25g", weightG: 25, price: 40, mrp: 40, stock: 50 }]
  },
  {
    id: "prod_zunora_pista_cashew_mix_15g_gift",
    name: "Zunora Pista & Cashew Mix (15 g)",
    slug: "zunora-pista-cashew-mix-15g-gift",
    category: "Cashews",
    categorySlug: "cashews",
    description: "A 15 g Pista & Cashew Mix included free with each eligible Zunora 25 g cashew pack during this limited-time offer. Not sold separately as part of this offer.",
    shortDescription: "Free 15 g mix gift with each eligible 25 g cashew pack during the offer.",
    images: ["/products/zunora-pista-cashew-mix-15g.png"],
    video: "/products/zunora-pista-cashew-mix-15g.mp4",
    rating: 0,
    reviewCount: 0,
    featured: false,
    availableForSale: false,
    freeGiftOnly: true,
    tags: ["free-gift", "pistachio", "cashew", "15g"],
    nutrition: {},
    ingredients: "Refer to the product packaging.",
    origin: "Refer to the product packaging.",
    variants: [{ id: "zunora-pista-cashew-mix-15g-gift-pack", label: "15g", weightG: 15, price: 0, mrp: 0, stock: 50 }]
  }
];

export const products: CatalogProduct[] = [...legacyProducts, ...launchProducts];
export const storefrontProducts = products.filter((product) => product.availableForSale);
export const freeGiftProduct = products.find((product) => product.freeGiftOnly);

export function getFreeGiftQuantity(items: Array<{ productId: string; quantity: number }>) {
  return items.reduce((total, item) => {
    const product = storefrontProducts.find((entry) => entry.id === item.productId);
    return total + (product?.eligibleForFreeGift ? item.quantity : 0);
  }, 0);
}

export function getProductBySlug(slug: string) {
  return storefrontProducts.find((product) => product.slug === slug);
}

export function getRelatedProducts(product: CatalogProduct) {
  return storefrontProducts.filter((item) => item.categorySlug === product.categorySlug && item.id !== product.id).slice(0, 4);
}

export function filterProducts(params: {
  q?: string;
  category?: string;
  min?: number;
  max?: number;
  sort?: string;
}) {
  let result = [...storefrontProducts];
  if (params.q) {
    const query = params.q.toLowerCase();
    result = result.filter((product) => `${product.name} ${product.description}`.toLowerCase().includes(query));
  }
  if (params.category) result = result.filter((product) => product.categorySlug === params.category);
  if (params.min) result = result.filter((product) => product.variants[0].price >= Number(params.min));
  if (params.max) result = result.filter((product) => product.variants[0].price <= Number(params.max));

  if (params.sort === "price-asc") result.sort((a, b) => a.variants[0].price - b.variants[0].price);
  if (params.sort === "price-desc") result.sort((a, b) => b.variants[0].price - a.variants[0].price);
  if (params.sort === "rating") result.sort((a, b) => b.rating - a.rating);
  if (params.sort === "newest") result.reverse();

  return result;
}
