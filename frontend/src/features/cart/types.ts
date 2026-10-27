import type {
  DecimalValue,
  ProductInventory,
  ProductVariant,
} from "@/features/catalog/types";

export type CartProduct = {
  basePrice: DecimalValue;
  categoryId: string;
  description?: string | null;
  id: string;
  imageUrl?: string | null;
  inventory?: ProductInventory | null;
  isFeatured: boolean;
  name: string;
  slug: string;
  status: string;
};

export type CartItem = {
  cartId: string;
  createdAt: string;
  id: string;
  lineTotal: DecimalValue;
  product: CartProduct;
  productId: string;
  quantity: number;
  unitPrice: DecimalValue;
  updatedAt: string;
  variant: ProductVariant | null;
  variantId?: string | null;
};

export type Cart = {
  createdAt: string;
  id: string;
  items: CartItem[];
  subtotal: DecimalValue;
  totalQuantity: number;
  updatedAt: string;
  userId: string;
};
