import { ActivityIndicator, Pressable, Text, View } from "react-native";
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
      className="min-h-[126px] flex-row gap-3 rounded-[22px] border border-fufu-line bg-fufu-surface p-[11px]"
    >
      <View className="h-[102px] w-[102px] overflow-hidden rounded-2xl bg-fufu-primary-soft">
        <CatalogImage
          accessibilityLabel={item.product.name}
          className="h-full w-full"
          fallbackKey={item.product.slug}
          uri={item.product.imageUrl}
        />
      </View>

      <View className="min-w-0 flex-1 justify-between gap-2">
        <View className="flex-row items-start justify-between gap-1.5">
          <View className="min-w-0 flex-1 gap-[3px]">
            <Text numberOfLines={2} className="font-outfit-semibold text-base leading-5 text-fufu-ink">
              {item.product.name}
            </Text>
            <Text numberOfLines={1} className="font-outfit text-xs text-fufu-muted">
              {item.variant?.name ?? "Regular"}
            </Text>
          </View>
          <Pressable
            accessibilityLabel={`Remove ${item.product.name}`}
            accessibilityRole="button"
            className={`h-7 w-7 items-center justify-center ${busy ? "opacity-35" : ""} active:opacity-65 active:scale-90`}
            disabled={busy}
            hitSlop={8}
            onPress={onRemove}
          >
            <Text className="font-outfit text-[25px] leading-[25px] text-fufu-muted">×</Text>
          </Pressable>
        </View>

        {stockMessage ? (
          <Text className="font-outfit-medium text-[11px] text-fufu-danger">{stockMessage}</Text>
        ) : null}

        <View className="flex-row items-end justify-between">
          <View>
            <Text className="font-outfit-bold text-[13px] text-fufu-primary-deep">
              {formatRwf(item.unitPrice)}
            </Text>
            <Text className="mt-0.5 font-outfit text-[11px] text-fufu-muted">
              {formatRwf(item.lineTotal)}
            </Text>
          </View>
          <View className="flex-row items-center gap-[3px] rounded-[13px] bg-fufu-primary-soft p-[3px]">
            <Pressable
              accessibilityLabel={`Decrease ${item.product.name} quantity`}
              accessibilityRole="button"
              accessibilityState={{ disabled: busy || item.quantity <= 1 }}
              className={`h-[30px] w-[30px] items-center justify-center rounded-[10px] ${busy || item.quantity <= 1 ? "opacity-35" : ""} active:opacity-65 active:scale-90`}
              disabled={busy || item.quantity <= 1}
              hitSlop={4}
              onPress={onDecrease}
            >
              <Text className="font-outfit-semibold text-xl leading-[22px] text-fufu-primary-deep">−</Text>
            </Pressable>
            <Text
              accessibilityLabel={`Quantity ${item.quantity}`}
              className="min-w-5 text-center font-outfit-bold text-sm text-fufu-ink"
            >
              {item.quantity}
            </Text>
            <Pressable
              accessibilityLabel={`Increase ${item.product.name} quantity`}
              accessibilityRole="button"
              accessibilityState={{ disabled: !canIncrease }}
              className={`h-[30px] w-[30px] items-center justify-center rounded-[10px] ${!canIncrease ? "opacity-35" : ""} active:opacity-65 active:scale-90`}
              disabled={!canIncrease}
              hitSlop={4}
              onPress={onIncrease}
            >
              {busy ? (
                <ActivityIndicator color={FUFU.primary} size="small" />
              ) : (
                <Text className="font-outfit-semibold text-xl leading-[22px] text-fufu-primary-deep">+</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}
