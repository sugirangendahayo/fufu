import { router, useLocalSearchParams, type Href } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CatalogError, CatalogLoading, NoticeBanner } from "@/components/catalog/catalog-state";
import { CatalogImage } from "@/components/catalog/catalog-image";
import { useTabBarInset } from "@/components/navigation/floating-tab-bar";
import { useAddToCart } from "@/features/cart/use-add-to-cart";
import { useProduct } from "@/features/catalog/hooks";
import { getActiveVariant, formatRwf } from "@/utils/catalog";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const productQuery = useProduct(typeof id === "string" ? id : undefined);
  const { addToCart, addedId, addingId, error } = useAddToCart();
  const tabBarInset = useTabBarInset();
  const [selectedVariantId, setSelectedVariantId] = useState<string>();
  const product = productQuery.data;
  const selectedVariant = product
    ? product.variants.find((variant) => variant.id === selectedVariantId) ??
      getActiveVariant(product)
    : null;
  const isAdding = Boolean(product && addingId === product.id);
  const isAdded = Boolean(product && addedId === product.id);

  const openMenu = useCallback(() => {
    router.navigate("/(customer)/(tabs)/menu" as Href);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-fufu-bg" edges={["top"]}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: tabBarInset }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center gap-3 px-5 pb-3 pt-3">
          <Pressable
            accessibilityLabel="Go back"
            accessibilityRole="button"
            className="h-10 w-10 items-center justify-center rounded-full border border-fufu-line bg-fufu-surface active:scale-95 active:opacity-70"
            hitSlop={8}
            onPress={() => router.back()}
          >
            <Text className="font-outfit-medium text-[22px] text-fufu-ink">‹</Text>
          </Pressable>
          <Text className="font-outfit-semibold text-[15px] text-fufu-ink">Product details</Text>
        </View>

        {productQuery.isPending ? (
          <View className="px-5 pt-5">
            <CatalogLoading label="Loading this meal…" />
          </View>
        ) : productQuery.isError || !product ? (
          <View className="px-5 pt-5">
            <CatalogError
              message="This meal couldn't be loaded. Please try again."
              onRetry={() => void productQuery.refetch()}
            />
          </View>
        ) : (
          <View className="gap-6 px-5 pt-2">
            <View className="h-[300px] overflow-hidden rounded-[30px] bg-fufu-primary-soft">
              <CatalogImage
                accessibilityLabel={product.name}
                className="h-full w-full"
                fallbackKey={product.slug}
                uri={product.imageUrl}
              />
            </View>

            <View className="gap-2">
              <Text className="font-outfit-bold text-[28px] leading-8 tracking-[-0.5px] text-fufu-ink">
                {product.name}
              </Text>
              <Text className="font-outfit-bold text-[20px] text-fufu-primary-deep">
                {formatRwf(selectedVariant?.price ?? product.basePrice)}
              </Text>
              {product.description ? (
                <Text className="mt-1 font-outfit text-[15px] leading-[23px] text-fufu-muted">
                  {product.description}
                </Text>
              ) : null}
            </View>

            {product.variants.length > 0 ? (
              <View className="gap-3">
                <Text className="font-outfit-semibold text-base text-fufu-ink">Choose a size</Text>
                <View className="flex-row flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ selected: selectedVariant?.id === variant.id }}
                      className={`rounded-full border px-4 py-2.5 ${selectedVariant?.id === variant.id ? "border-fufu-ink bg-fufu-ink" : "border-fufu-line bg-fufu-surface"} active:opacity-80`}
                      key={variant.id}
                      onPress={() => setSelectedVariantId(variant.id)}
                    >
                      <Text className={`font-outfit-semibold text-[13px] ${selectedVariant?.id === variant.id ? "text-fufu-white" : "text-fufu-ink-soft"}`}>
                        {variant.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : null}

            <NoticeBanner message={error} />

            <View className="gap-3">
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ busy: isAdding, disabled: isAdding || product.inventory?.stockQuantity === 0 }}
                className={`min-h-14 items-center justify-center rounded-2xl ${isAdded ? "bg-fufu-success" : "bg-fufu-primary"} ${product.inventory?.stockQuantity === 0 || isAdding ? "opacity-55" : ""} active:scale-[0.98] active:opacity-80`}
                disabled={isAdding || product.inventory?.stockQuantity === 0}
                onPress={() => void addToCart(product, selectedVariant?.id)}
              >
                <Text className="font-outfit-bold text-base text-fufu-white">
                  {product.inventory?.stockQuantity === 0
                    ? "Sold out"
                    : isAdded
                      ? "Added to cart"
                      : isAdding
                        ? "Adding…"
                        : "Add to cart"}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                className="items-center py-2 active:opacity-60"
                onPress={openMenu}
              >
                <Text className="font-outfit-semibold text-[13px] text-fufu-ink-soft">Back to the menu</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
