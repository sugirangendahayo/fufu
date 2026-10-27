import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { FUFU } from "@/theme/colors";
import type { CatalogProduct } from "@/features/catalog/types";
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
      style={[styles.card, compact && styles.compactCard]}
    >
      <View style={styles.imageWrap}>
        <CatalogImage
          accessibilityLabel={product.name}
          fallbackKey={product.slug}
          uri={product.imageUrl}
        />
        {product.isFeatured ? (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>Popular</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        <Text style={styles.category} numberOfLines={1}>
          {product.category?.name ?? "Fufu kitchen"}
        </Text>
        <Text numberOfLines={2} style={styles.name}>
          {product.name}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.price}>{formatRwf(getProductPrice(product))}</Text>
          {onAdd ? (
            <Pressable
              accessibilityLabel={
                soldOut ? `${product.name} is sold out` : `Add ${product.name} to cart`
              }
              accessibilityRole="button"
              accessibilityState={{ busy: loading, disabled: soldOut || loading }}
              disabled={soldOut || loading}
              onPress={() => onAdd(product)}
              style={({ pressed }) => [
                styles.addButton,
                added && styles.addedButton,
                soldOut && styles.soldOutButton,
                pressed && !soldOut && styles.addButtonPressed,
              ]}
            >
              {loading ? (
                <ActivityIndicator color={FUFU.white} size="small" />
              ) : (
                <Text style={[styles.addText, added && styles.addTextAdded]}>
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: FUFU.surface,
    borderColor: FUFU.line,
    borderRadius: 22,
    borderWidth: 1,
    flex: 1,
    marginBottom: 14,
    minWidth: 0,
    overflow: "hidden",
    shadowColor: FUFU.ink,
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 2,
  },
  compactCard: {
    maxWidth: 188,
    width: 178,
  },
  imageWrap: {
    backgroundColor: FUFU.primarySoft,
    height: 142,
    overflow: "hidden",
    position: "relative",
  },
  featuredBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderRadius: 9,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
    position: "absolute",
    top: 10,
  },
  featuredText: {
    color: FUFU.primaryDeep,
    fontFamily: "Outfit_700Bold",
    fontSize: 11,
  },
  body: {
    gap: 5,
    paddingHorizontal: 13,
    paddingVertical: 13,
  },
  category: {
    color: FUFU.muted,
    fontFamily: "Outfit_500Medium",
    fontSize: 12,
    letterSpacing: 0.2,
  },
  name: {
    color: FUFU.ink,
    fontFamily: "Outfit_600SemiBold",
    fontSize: 16,
    lineHeight: 20,
    minHeight: 40,
  },
  footer: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
    marginTop: 3,
  },
  price: {
    color: FUFU.primaryDeep,
    flex: 1,
    fontFamily: "Outfit_700Bold",
    fontSize: 14,
  },
  addButton: {
    alignItems: "center",
    backgroundColor: FUFU.primary,
    borderRadius: 12,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  addButtonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.94 }],
  },
  addedButton: {
    backgroundColor: FUFU.success,
  },
  soldOutButton: {
    backgroundColor: FUFU.line,
  },
  addText: {
    color: FUFU.white,
    fontFamily: "Outfit_700Bold",
    fontSize: 23,
    lineHeight: 25,
  },
  addTextAdded: {
    fontSize: 18,
  },
});
