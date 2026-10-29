import { useEffect } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { CheckGlyph, PlusGlyph } from "@/components/ui/glyphs";
import { TIMING } from "@/components/ui/motion";
import type { CatalogProduct } from "@/features/catalog/types";
import { FUFU } from "@/theme/colors";
import { formatRwf, getProductPrice } from "@/utils/catalog";
import { CatalogImage } from "./catalog-image";

type ProductCardProps = {
  added?: boolean;
  /** Fixed-width variant for a horizontal rail. */
  compact?: boolean;
  /** @deprecated The staggered entrance animation is gone; kept so callers still compile. */
  index?: number;
  loading?: boolean;
  onAdd?: (product: CatalogProduct) => void;
  onPress?: (product: CatalogProduct) => void;
  product: CatalogProduct;
};

/**
 * Flat on purpose: a tinted square for the food, then the name and the price
 * on the page itself. The old card stacked a border, a shadow, a badge, a
 * category line and a coloured price to say the same thing. The add button
 * lives inside the image corner, so there's no extra row.
 *
 * Layout contract kept from before, so the Menu grid is unaffected: in a grid
 * the card is `flex-1 min-w-0`; `compact` is a fixed width; the card owns its
 * bottom margin.
 */
export function ProductCard({
  added = false,
  compact = false,
  loading = false,
  onAdd,
  onPress,
  product,
}: ProductCardProps) {
  const soldOut = product.inventory?.stockQuantity === 0;

  return (
    <View className={`mb-5 ${compact ? "w-[168px]" : "min-w-0 flex-1"}`}>
      <View className="aspect-square overflow-hidden rounded-[22px] bg-fufu-primary-soft">
        <Pressable
          accessibilityLabel={`Open ${product.name}`}
          accessibilityRole={onPress ? "button" : undefined}
          className={soldOut ? "h-full w-full opacity-50" : "h-full w-full"}
          disabled={!onPress}
          onPress={() => onPress?.(product)}
        >
          <CatalogImage
            accessibilityLabel={product.name}
            className="h-full w-full"
            fallbackKey={product.slug}
            uri={product.imageUrl}
          />
        </Pressable>
        {onAdd && !soldOut ? (
          <View className="absolute bottom-2.5 right-2.5">
            <AddButton
              added={added}
              label={`Add ${product.name} to cart`}
              loading={loading}
              onPress={() => onAdd(product)}
            />
          </View>
        ) : null}
      </View>
      <Text
        className="mt-3 min-h-10 font-outfit-semibold text-[15px] leading-5 text-fufu-ink"
        numberOfLines={2}
      >
        {product.name}
      </Text>
      <Text className="mt-1 font-outfit-medium text-[14px] text-fufu-muted">
        {soldOut ? "Sold out" : formatRwf(getProductPrice(product))}
      </Text>
    </View>
  );
}

/**
 * Plus -> spinner -> check as a crossfade, not three class swaps. Two values
 * (`done`, `busy`) drive every layer, so the states can overlap mid-flight and
 * a fast add never flashes the wrong glyph. The circle is ink at rest and turns
 * primary once the item is in the cart: orange only ever means "done".
 * 40pt visible, 52pt touchable (the old button was 36pt with no hit slop).
 */
function AddButton({
  added,
  label,
  loading,
  onPress,
}: {
  added: boolean;
  label: string;
  loading: boolean;
  onPress: () => void;
}) {
  const done = useSharedValue(added ? 1 : 0);
  const busy = useSharedValue(loading ? 1 : 0);

  useEffect(() => {
    done.value = withTiming(added ? 1 : 0, TIMING);
  }, [added, done]);
  useEffect(() => {
    busy.value = withTiming(loading ? 1 : 0, TIMING);
  }, [loading, busy]);

  const doneFill = useAnimatedStyle(() => ({ opacity: done.value }));
  const plus = useAnimatedStyle(() => ({
    opacity: (1 - done.value) * (1 - busy.value),
  }));
  const spinner = useAnimatedStyle(() => ({ opacity: busy.value }));
  const check = useAnimatedStyle(() => ({
    opacity: done.value * (1 - busy.value),
  }));

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ busy: loading }}
      className="h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-fufu-ink active:scale-95"
      disabled={loading}
      hitSlop={6}
      onPress={onPress}
    >
      <Animated.View
        className="absolute inset-0 bg-fufu-primary"
        pointerEvents="none"
        style={doneFill}
      />
      <Animated.View className="absolute" pointerEvents="none" style={plus}>
        <PlusGlyph color={FUFU.white} size={20} strokeWidth={2} />
      </Animated.View>
      <Animated.View className="absolute" pointerEvents="none" style={spinner}>
        <ActivityIndicator color={FUFU.white} size="small" />
      </Animated.View>
      <Animated.View className="absolute" pointerEvents="none" style={check}>
        <CheckGlyph color={FUFU.white} size={20} strokeWidth={2} />
      </Animated.View>
    </Pressable>
  );
}