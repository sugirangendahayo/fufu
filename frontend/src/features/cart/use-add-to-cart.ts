import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/features/auth/auth-store";
import { ApiClientError } from "@/lib/api-client";
import type { CatalogProduct } from "@/features/catalog/types";
import { cartApi } from "./api";

export function useAddToCart() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const addingRef = useRef<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  const addToCart = useCallback(
    async (product: CatalogProduct) => {
      if (addingRef.current) return;

      setError(null);
      if (!accessToken) {
        setError("Sign in to add items to your cart.");
        return;
      }

      const variant =
        product.variants.find((item) => item.isActive && item.isDefault) ??
        product.variants.find((item) => item.isActive);

      addingRef.current = product.id;
      setAddingId(product.id);

      try {
        await cartApi.addItem(accessToken, {
          productId: product.id,
          quantity: 1,
          ...(variant ? { variantId: variant.id } : {}),
        });
        setAddedId(product.id);
        void Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        ).catch(() => undefined);
        if (resetTimer.current) clearTimeout(resetTimer.current);
        resetTimer.current = setTimeout(() => setAddedId(null), 1800);
      } catch (reason) {
        setError(
          reason instanceof ApiClientError
            ? reason.message
            : "We couldn't add that item. Please try again.",
        );
      } finally {
        addingRef.current = null;
        setAddingId(null);
      }
    },
    [accessToken],
  );

  return {
    addToCart,
    addedId,
    addingId,
    error,
  };
}
