import { apiRequest } from "@/lib/api-client";

export type AddCartItemInput = {
  productId: string;
  quantity: number;
  variantId?: string;
};

export const cartApi = {
  addItem: (token: string, input: AddCartItemInput) =>
    apiRequest<{ data: { id: string } }>("/cart/items", {
      body: input,
      method: "POST",
      token,
    }),
};
