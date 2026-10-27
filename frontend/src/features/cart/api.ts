import { apiRequest } from "@/lib/api-client";
import type { Cart, CartItem } from "./types";

export type AddCartItemInput = {
  productId: string;
  quantity: number;
  variantId?: string;
};

export type UpdateCartItemInput = {
  quantity: number;
  variantId?: string | null;
};

type CartResponse = { data: Cart };

export const cartApi = {
  get: async (token: string, signal?: AbortSignal) => {
    const response = await apiRequest<CartResponse>("/cart", {
      signal,
      token,
    });
    return response.data;
  },

  addItem: async (token: string, input: AddCartItemInput) => {
    const response = await apiRequest<{ data: CartItem }>("/cart/items", {
      body: input,
      method: "POST",
      token,
    });
    return response.data;
  },

  updateItem: async (
    token: string,
    itemId: string,
    input: UpdateCartItemInput,
  ) => {
    const response = await apiRequest<{ data: CartItem }>(
      `/cart/items/${encodeURIComponent(itemId)}`,
      {
        body: input,
        method: "PATCH",
        token,
      },
    );
    return response.data;
  },

  removeItem: (token: string, itemId: string) =>
    apiRequest<void>(`/cart/items/${encodeURIComponent(itemId)}`, {
      method: "DELETE",
      token,
    }),

  clear: (token: string) =>
    apiRequest<void>("/cart", {
      method: "DELETE",
      token,
    }),
};
