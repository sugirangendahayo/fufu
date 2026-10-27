import type {
  CatalogProduct,
  DecimalValue,
  ProductVariant,
} from "@/features/catalog/types";

export function formatRwf(value: DecimalValue) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) return "—";

  return `${new Intl.NumberFormat("en-RW", {
    maximumFractionDigits: 0,
  }).format(amount)} RWF`;
}

export function getActiveVariant(product: CatalogProduct): ProductVariant | null {
  return (
    product.variants.find((variant) => variant.isActive && variant.isDefault) ??
    product.variants.find((variant) => variant.isActive) ??
    null
  );
}

export function getProductPrice(product: CatalogProduct) {
  return getActiveVariant(product)?.price ?? product.basePrice;
}

export function isUsableImageUrl(value?: string | null) {
  if (!value || !/^https?:\/\//i.test(value)) return false;
  return !/images\.example\.com|example\.com/i.test(value);
}

export function initials(firstName?: string | null, lastName?: string | null) {
  const first = firstName?.trim().charAt(0) ?? "";
  const last = lastName?.trim().charAt(0) ?? "";
  return `${first}${last}`.toUpperCase() || "F";
}
