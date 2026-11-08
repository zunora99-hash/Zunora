import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { categories, products } from "../lib/catalog";

const prisma = new PrismaClient();

async function main() {
  if (process.argv.includes("--demo-admin")) {
    const passwordHash = await bcrypt.hash("ChangeMe123!", 12);
    await prisma.user.upsert({
      where: { email: "admin@zunora.example" },
      update: { passwordHash, role: "ADMIN" },
      create: {
        name: "Zunora Admin",
        email: "admin@zunora.example",
        passwordHash,
        role: "ADMIN"
      }
    });
    console.info("Demo admin account created or updated.");
    return;
  }

  for (const category of categories) {
    const categoryData = {
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image
    };
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: categoryData,
      create: categoryData
    });
  }

  for (const product of products) {
    const category = await prisma.category.findUniqueOrThrow({ where: { slug: product.categorySlug } });
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        shortDescription: product.shortDescription,
        images: product.images,
        rating: product.rating,
        reviewCount: product.reviewCount,
        nutrition: product.nutrition,
        ingredients: product.ingredients,
        origin: product.origin,
        featured: product.featured,
        categoryId: category.id,
        metaTitle: `${product.name} Online`,
        metaDescription: product.shortDescription
      },
      create: {
        name: product.name,
        id: product.id,
        slug: product.slug,
        description: product.description,
        shortDescription: product.shortDescription,
        images: product.images,
        rating: product.rating,
        reviewCount: product.reviewCount,
        nutrition: product.nutrition,
        ingredients: product.ingredients,
        origin: product.origin,
        featured: product.featured,
        categoryId: category.id,
        metaTitle: `${product.name} Online`,
        metaDescription: product.shortDescription
      }
    });

    for (const variant of product.variants) {
      await prisma.variant.upsert({
        where: { id: variant.id },
        update: {
          label: variant.label,
          weightG: variant.weightG,
          price: variant.price,
          mrp: variant.mrp
        },
        create: {
          id: variant.id,
          productId: product.id,
          label: variant.label,
          weightG: variant.weightG,
          price: variant.price,
          mrp: variant.mrp,
          stock: variant.stock,
          sku: variant.id.toUpperCase()
        }
      });
    }
  }

  await prisma.coupon.upsert({
    where: { code: "FRESH10" },
    update: {},
    create: {
      code: "FRESH10",
      description: "10% off on first order above Rs. 999",
      discountPct: 10,
      minAmount: 999,
      active: true
    }
  });

  await prisma.banner.createMany({
    data: [
      {
        title: "Festive dry fruits gift boxes",
        subtitle: "Curated assortments with premium almonds, cashews, pistachios, dates, and figs.",
        href: "/shop?category=gift-boxes",
        active: true
      }
    ],
    skipDuplicates: true
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
