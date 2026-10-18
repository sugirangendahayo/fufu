import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "../generated/prisma/client";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
const catalog = [
  ["Burgers", "burgers", ["Classic Burger", "Double Cheeseburger", "Spicy Chicken Burger"]],
  ["Pizza", "pizza", ["Margherita Pizza", "Pepperoni Pizza", "BBQ Chicken Pizza"]],
  ["Chicken", "chicken", ["Crispy Fried Chicken", "Hot Chicken Wings", "Chicken Tenders"]],
  ["Wraps", "wraps", ["Grilled Chicken Wrap", "Beef Wrap", "Spicy Veggie Wrap"]],
  ["Snacks & Sides", "snacks-sides", ["Seasoned Fries", "Onion Rings", "Fresh Coleslaw"]],
  ["Drinks", "drinks", ["Bottled Water", "Cola", "Fresh Lemonade"]],
  ["Desserts", "desserts", ["Chocolate Brownie", "New York Cheesecake", "Vanilla Ice Cream"]],
] as const;
const slugify = (name: string) => name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

async function main() {
  const products: Record<string, string> = {};
  for (const [index, [name, slug, names]] of catalog.entries()) {
    const category = await prisma.category.upsert({ where: { slug }, update: { name, sortOrder: index, isActive: true }, create: { name, slug, sortOrder: index, imageUrl: `https://images.example.com/categories/${slug}.jpg` } });
    for (const [productIndex, productName] of names.entries()) {
      const productSlug = slugify(productName); const price = 1800 + index * 350 + productIndex * 450;
      const product = await prisma.product.upsert({ where: { slug: productSlug }, update: { categoryId: category.id, name: productName, basePrice: new Prisma.Decimal(price), status: "AVAILABLE" }, create: { categoryId: category.id, name: productName, slug: productSlug, description: `Freshly prepared ${productName.toLowerCase()}.`, imageUrl: `https://images.example.com/products/${productSlug}.jpg`, basePrice: new Prisma.Decimal(price), isFeatured: productIndex === 0 } });
      products[productSlug] = product.id;
      await prisma.inventory.upsert({ where: { productId: product.id }, update: { stockQuantity: 50 }, create: { productId: product.id, stockQuantity: 50, lowStockThreshold: 8 } });
      if (index < 4) for (const [variant, multiplier] of [["Regular", 1], ["Large", 1.35]] as const) await prisma.productVariant.upsert({ where: { productId_name: { productId: product.id, name: variant } }, update: { price: new Prisma.Decimal(Math.round(price * multiplier)), isActive: true }, create: { productId: product.id, name: variant, price: new Prisma.Decimal(Math.round(price * multiplier)), isDefault: variant === "Regular" } });
    }
  }
  const combo = await prisma.combo.upsert({ where: { slug: "classic-meal" }, update: { isActive: true, price: new Prisma.Decimal(5500) }, create: { name: "Classic Meal", slug: "classic-meal", description: "Classic burger, seasoned fries, and a cola.", price: new Prisma.Decimal(5500), imageUrl: "https://images.example.com/combos/classic-meal.jpg" } });
  for (const slug of ["classic-burger", "seasoned-fries", "cola"]) await prisma.comboItem.upsert({ where: { comboId_productId: { comboId: combo.id, productId: products[slug]! } }, update: {}, create: { comboId: combo.id, productId: products[slug]! } });
  await prisma.promotion.upsert({ where: { code: "WELCOME10" }, update: { isActive: true }, create: { name: "Welcome 10%", code: "WELCOME10", type: "PERCENTAGE", value: new Prisma.Decimal(10), maximumDiscount: new Prisma.Decimal(1500), minimumOrderValue: new Prisma.Decimal(5000) } });
}
main().then(() => prisma.$disconnect()).catch(async error => { console.error(error); await prisma.$disconnect(); process.exit(1); });
