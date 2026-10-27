import { ActivityIndicator, Pressable, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import type { CatalogProduct } from "@/features/catalog/types";
import { FUFU } from "@/theme/colors";
import { formatRwf, getProductPrice } from "@/utils/catalog";
import { CatalogImage } from "./catalog-image";

type ProductCardProps = {
  added?: boolean;
  compact?: boolean;
  index?: number;
  loading?: boolean;
  onAdd?: (product: CatalogProduct) => void;
  product: CatalogProduct;
};

export function ProductCard({
  added = false,
  compact = false,
  index = 0,
  loading = false,
  onAdd,
  product,
}: ProductCardProps) {
  const soldOut = product.inventory?.stockQuantity === 0;

  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index, 7) * 45)
        .duration(420)
        .springify()
        .damping(17)}
      className={`mb-3.5 min-w-0 flex-1 overflow-hidden rounded-[22px] border border-fufu-line bg-fufu-surface shadow-lg ${compact ? "w-[178px] max-w-[188px]" : ""}`}
    >
      <View className="relative h-[142px] overflow-hidden rounded-t-[22px] bg-fufu-primary-soft">
        <CatalogImage
          accessibilityLabel={product.name}
          className="h-full w-full"
          fallbackKey={product.slug}
          uri={product.imageUrl}
        />
        {product.isFeatured ? (
          <View className="absolute left-2.5 top-2.5 rounded-[9px] bg-[rgba(255,255,255,0.92)] px-2 py-1">
            <Text className="font-outfit-bold text-[11px] text-fufu-primary-deep">
              Popular
            </Text>
          </View>
        ) : null}
      </View>

      <View className="gap-1.5 px-[13px] py-[13px]">
        <Text numberOfLines={1} className="font-outfit-medium text-xs tracking-[0.2px] text-fufu-muted">
          {product.category?.name ?? "Fufu kitchen"}
        </Text>
        <Text numberOfLines={2} className="min-h-10 font-outfit-semibold text-base leading-5 text-fufu-ink">
          {product.name}
        </Text>
        <View className="mt-0.5 flex-row items-center justify-between gap-2">
          <Text className="flex-1 font-outfit-bold text-sm text-fufu-primary-deep">
            {formatRwf(getProductPrice(product))}
          </Text>
          {onAdd ? (
            <Pressable
              accessibilityLabel={
                soldOut ? `${product.name} is sold out` : `Add ${product.name} to cart`
              }
              accessibilityRole="button"
              accessibilityState={{ busy: loading, disabled: soldOut || loading }}
              className={`h-9 w-9 items-center justify-center rounded-xl ${added ? "bg-fufu-success" : soldOut ? "bg-fufu-line" : "bg-fufu-primary"} ${loading ? "opacity-70" : ""} active:scale-95 active:opacity-80`}
              disabled={soldOut || loading}
              onPress={() => onAdd(product)}
            >
              {loading ? (
                <ActivityIndicator color={FUFU.white} size="small" />
              ) : (
                <Text className={`font-outfit-bold text-[23px] leading-[25px] ${added ? "text-[18px] text-fufu-white" : "text-fufu-white"}`}>
                  {soldOut ? "—" : added ? "✓" : "+"}
                </Text>
              )}
            </Pressable>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
}
