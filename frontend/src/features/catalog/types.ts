export type DecimalValue = number | string;

export type CatalogCategory = {
  id: string;
  imageUrl?: string | null;
  isActive: boolean;
  name: string;
  slug: string;
  sortOrder: number;
};

export type ProductVariant = {
  id: string;
  isActive: boolean;
  isDefault: boolean;
  name: string;
  price: DecimalValue;
  productId: string;
};

export type ProductInventory = {
  id: string;
  lowStockThreshold: number;
  productId: string;
  stockQuantity: number;
};

export type CatalogProduct = {
  basePrice: DecimalValue;
  category?: CatalogCategory | null;
  categoryId: string;
  description?: string | null;
  id: string;
  imageUrl?: string | null;
  inventory?: ProductInventory | null;
  isFeatured: boolean;
  name: string;
  slug: string;
  status: "ARCHIVED" | "AVAILABLE" | "UNAVAILABLE" | string;
  variants: ProductVariant[];
};

export type CatalogComboItem = {
  id: string;
  product: CatalogProduct;
  productId: string;
  quantity: number;
};

export type CatalogCombo = {
  description?: string | null;
  id: string;
  imageUrl?: string | null;
  items: CatalogComboItem[];
  name: string;
  price: DecimalValue;
  slug: string;
};

export type ProductList = {
  data: CatalogProduct[];
  meta: {
    limit: number;
    page: number;
    pages: number;
    total: number;
  };
};
