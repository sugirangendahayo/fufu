import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { CatalogImage } from "@/components/catalog/catalog-image";
import type { CartItem } from "@/features/cart/types";
import { FUFU } from "@/theme/colors";
import { formatRwf } from "@/utils/catalog";

type CartItemCardProps = {
  busy?: boolean;
  index?: number;
  item: CartItem;
  onDecrease: () => void;
  onIncrease: () => void;
  onRemove: () => void;
};

export function CartItemCard({
  busy = false,
  index = 0,
  item,
  onDecrease,
  onIncrease,
  onRemove,
}: CartItemCardProps) {
  const stockQuantity = item.product.inventory?.stockQuantity ?? null;
  const canIncrease =
    !busy &&
    stockQuantity !== 0 &&
    item.quantity < 100 &&
    (stockQuantity === null || item.quantity < stockQuantity);
  const stockMessage =
    stockQuantity === 0
      ? "No longer available"
      : stockQuantity !== null && item.quantity > stockQuantity
        ? `Only ${stockQuantity} left — adjust before checkout`
        : stockQuantity !== null && stockQuantity < 5
          ? `Only ${stockQuantity} left`
          : null;

  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index, 7) * 45)
        .duration(420)
        .springify()
        .damping(17)}
      style={styles.card}
    >
      <View style={styles.imageWrap}>
        <CatalogImage
          accessibilityLabel={item.product.name}
          fallbackKey={item.product.slug}
          uri={item.product.imageUrl}
        />
      </View>

      <View style={styles.body}>
        <View style={styles.heading}>
          <View style={styles.copy}>
            <Text numberOfLines={2} style={styles.name}>
              {item.product.name}
            </Text>
            <Text numberOfLines={1} style={styles.variant}>
              {item.variant?.name ?? "Regular"}
            </Text>
          </View>
          <Pressable
            accessibilityLabel={`Remove ${item.product.name}`}
            accessibilityRole="button"
            disabled={busy}
            hitSlop={8}
            onPress={onRemove}
            style={({ pressed }) => [
              styles.remove,
              busy && styles.disabled,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.removeText}>×</Text>
          </Pressable>
        </View>

        {stockMessage ? (
          <Text style={styles.stockMessage}>{stockMessage}</Text>
        ) : null}

        <View style={styles.footer}>
          <View>
            <Text style={styles.unitPrice}>{formatRwf(item.unitPrice)}</Text>
            <Text style={styles.lineTotal}>{formatRwf(item.lineTotal)}</Text>
          </View>
          <View style={styles.quantityControl}>
            <Pressable
              accessibilityLabel={`Decrease ${item.product.name} quantity`}
              accessibilityRole="button"
              accessibilityState={{
                disabled: busy || item.quantity <= 1,
              }}
              disabled={busy || item.quantity <= 1}
              hitSlop={4}
              onPress={onDecrease}
              style={({ pressed }) => [
                styles.quantityButton,
                (busy || item.quantity <= 1) && styles.disabled,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.quantityButtonText}>−</Text>
            </Pressable>
            <Text accessibilityLabel={`Quantity ${item.quantity}`} style={styles.quantity}>
              {item.quantity}
            </Text>
            <Pressable
              accessibilityLabel={`Increase ${item.product.name} quantity`}
              accessibilityRole="button"
              accessibilityState={{ disabled: !canIncrease }}
              disabled={!canIncrease}
              hitSlop={4}
              onPress={onIncrease}
              style={({ pressed }) => [
                styles.quantityButton,
                !canIncrease && styles.disabled,
                pressed && styles.pressed,
              ]}
            >
              {busy ? (
                <ActivityIndicator color={FUFU.primary} size="small" />
              ) : (
                <Text style={styles.quantityButtonText}>+</Text>
              )}
            </Pressable>
          </View>
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
    flexDirection: "row",
    gap: 12,
    minHeight: 126,
    padding: 11,
  },
  imageWrap: {
    backgroundColor: FUFU.primarySoft,
    borderRadius: 16,
    height: 102,
    overflow: "hidden",
    width: 102,
  },
  body: {
    flex: 1,
    gap: 8,
    justifyContent: "space-between",
    minWidth: 0,
  },
  heading: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 6,
    justifyContent: "space-between",
  },
  copy: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  name: {
    color: FUFU.ink,
    fontFamily: "Outfit_600SemiBold",
    fontSize: 16,
    lineHeight: 20,
  },
  variant: {
    color: FUFU.muted,
    fontFamily: "Outfit_400Regular",
    fontSize: 12,
  },
  remove: {
    alignItems: "center",
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  removeText: {
    color: FUFU.muted,
    fontFamily: "Outfit_400Regular",
    fontSize: 25,
    lineHeight: 25,
  },
  footer: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  unitPrice: {
    color: FUFU.primaryDeep,
    fontFamily: "Outfit_700Bold",
    fontSize: 13,
  },
  lineTotal: {
    color: FUFU.muted,
    fontFamily: "Outfit_400Regular",
    fontSize: 11,
    marginTop: 2,
  },
  quantityControl: {
    alignItems: "center",
    backgroundColor: FUFU.primarySoft,
    borderRadius: 13,
    flexDirection: "row",
    gap: 3,
    padding: 3,
  },
  quantityButton: {
    alignItems: "center",
    borderRadius: 10,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  quantityButtonText: {
    color: FUFU.primaryDeep,
    fontFamily: "Outfit_600SemiBold",
    fontSize: 20,
    lineHeight: 22,
  },
  quantity: {
    color: FUFU.ink,
    fontFamily: "Outfit_700Bold",
    fontSize: 14,
    minWidth: 20,
    textAlign: "center",
  },
  stockMessage: {
    color: FUFU.danger,
    fontFamily: "Outfit_500Medium",
    fontSize: 11,
  },
  disabled: {
    opacity: 0.35,
  },
  pressed: {
    opacity: 0.65,
    transform: [{ scale: 0.92 }],
  },
});
