import { useQuery } from "@tanstack/react-query";
import { catalogApi, type ProductQuery } from "./api";

export const catalogKeys = {
  categories: ["catalog", "categories"] as const,
  combos: ["catalog", "combos"] as const,
  products: (query: ProductQuery) => ["catalog", "products", query] as const,
  product: (id: string) => ["catalog", "product", id] as const,
};

export function useCategories() {
  return useQuery({
    queryFn: ({ signal }) => catalogApi.listCategories(signal),
    queryKey: catalogKeys.categories,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCombos() {
  return useQuery({
    queryFn: ({ signal }) => catalogApi.listCombos(signal),
    queryKey: catalogKeys.combos,
    staleTime: 5 * 60 * 1000,
  });
}

export function useProducts(query: ProductQuery = {}) {
  return useQuery({
    queryFn: ({ signal }) => catalogApi.listProducts(query, signal),
    queryKey: catalogKeys.products(query),
    staleTime: 2 * 60 * 1000,
  });
}

export function useProduct(id?: string) {
  return useQuery({
    enabled: Boolean(id),
    queryFn: ({ signal }) => catalogApi.getProduct(id as string, signal),
    queryKey: catalogKeys.product(id ?? ""),
    staleTime: 2 * 60 * 1000,
  });
}
