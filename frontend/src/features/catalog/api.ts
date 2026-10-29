import { apiRequest } from "@/lib/api-client";
import type {
  CatalogCategory,
  CatalogCombo,
  CatalogProduct,
  ProductList,
} from "./types";

export type ProductQuery = {
  category?: string;
  featured?: boolean;
  limit?: number;
  page?: number;
  search?: string;
};

function toQuery(input: ProductQuery) {
  const params = new URLSearchParams();

  if (input.category) params.set("category", input.category);
  if (input.featured !== undefined) {
    params.set("featured", String(input.featured));
  }
  if (input.limit !== undefined) params.set("limit", String(input.limit));
  if (input.page !== undefined) params.set("page", String(input.page));
  if (input.search) params.set("search", input.search);

  const query = params.toString();
  return query ? `?${query}` : "";
}

export const catalogApi = {
  listCategories: async (signal?: AbortSignal) => {
    const response = await apiRequest<{ data: CatalogCategory[] }>(
      "/categories",
      { signal },
    );
    return response.data;
  },

  listCombos: async (signal?: AbortSignal) => {
    const response = await apiRequest<{ data: CatalogCombo[] }>("/combos", {
      signal,
    });
    return response.data;
  },

  listProducts: (query: ProductQuery = {}, signal?: AbortSignal) =>
    apiRequest<ProductList>(`/products${toQuery(query)}`, { signal }),

  getProduct: async (id: string, signal?: AbortSignal) => {
    const response = await apiRequest<{ data: CatalogProduct }>(
      `/products/${encodeURIComponent(id)}`,
      { signal },
    );
    return response.data;
  },
};
