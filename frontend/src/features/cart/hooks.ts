import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useAuthStore } from "@/features/auth/auth-store";
import { ApiClientError } from "@/lib/api-client";
import { cartApi, type UpdateCartItemInput } from "./api";

export const cartKeys = {
  detail: ["cart"] as const,
};

export function useCart() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    enabled: Boolean(accessToken),
    queryFn: ({ signal }) =>
      accessToken
        ? cartApi.get(accessToken, signal)
        : Promise.reject(new Error("You need to sign in to view your cart.")),
    queryKey: cartKeys.detail,
    staleTime: 30 * 1000,
  });
}

type CartAction =
  | { kind: "clear" }
  | { input: UpdateCartItemInput; itemId: string; kind: "update" }
  | { itemId: string; kind: "remove" };

function actionError(reason: unknown) {
  return reason instanceof ApiClientError
    ? reason.message
    : "We couldn't update your cart. Please try again.";
}

export function useCartActions() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (action: CartAction) => {
      if (!accessToken) {
        throw new Error("Sign in to manage your cart.");
      }

      if (action.kind === "clear") return cartApi.clear(accessToken);
      if (action.kind === "remove") {
        return cartApi.removeItem(accessToken, action.itemId);
      }
      return cartApi.updateItem(accessToken, action.itemId, action.input);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: cartKeys.detail }),
  });

  const run = useCallback(
    async (action: CartAction) => {
      setError(null);
      try {
        await mutation.mutateAsync(action);
      } catch (reason) {
        setError(actionError(reason));
      }
    },
    [mutation],
  );

  const updateQuantity = useCallback(
    (itemId: string, quantity: number) =>
      run({ input: { quantity }, itemId, kind: "update" }),
    [run],
  );
  const removeItem = useCallback(
    (itemId: string) => run({ itemId, kind: "remove" }),
    [run],
  );
  const clearCart = useCallback(() => run({ kind: "clear" }), [run]);

  const variables = mutation.variables;

  return {
    clearCart,
    error,
    isClearing: mutation.isPending && variables?.kind === "clear",
    isPending: mutation.isPending,
    pendingItemId:
      mutation.isPending && variables?.kind !== "clear"
        ? variables?.itemId ?? null
        : null,
    removeItem,
    updateQuantity,
  };
}
