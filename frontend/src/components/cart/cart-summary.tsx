import { Pressable, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import type { DecimalValue } from "@/features/catalog/types";
import { formatRwf } from "@/utils/catalog";

type CartSummaryProps = {
  itemCount: number;
  onContinueShopping: () => void;
  subtotal: DecimalValue;
};

export function CartSummary({
  itemCount,
  onContinueShopping,
  subtotal,
}: CartSummaryProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(120).duration(420)}
      className="gap-[15px] rounded-[26px] bg-fufu-ink p-5"
    >
      <View className="flex-row items-center justify-between">
        <Text className="font-outfit-bold text-[19px] text-fufu-white">Order summary</Text>
        <Text className="font-outfit text-xs text-[rgba(255,255,255,0.62)]">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </Text>
      </View>

      <View className="flex-row items-center justify-between">
        <Text className="font-outfit text-sm text-[rgba(255,255,255,0.70)]">Subtotal</Text>
        <Text className="font-outfit-medium text-sm text-fufu-white">{formatRwf(subtotal)}</Text>
      </View>
      <View className="flex-row items-center justify-between">
        <Text className="font-outfit text-sm text-[rgba(255,255,255,0.70)]">Delivery</Text>
        <Text className="font-outfit-medium text-xs text-fufu-butter">Calculated at checkout</Text>
      </View>
      <View className="h-px bg-[rgba(255,255,255,0.16)]" />
      <View className="flex-row items-center justify-between">
        <Text className="font-outfit-semibold text-base text-fufu-white">Total for now</Text>
        <Text className="font-outfit-bold text-[19px] text-fufu-butter">{formatRwf(subtotal)}</Text>
      </View>

      <View className="flex-row items-start gap-2 rounded-[14px] bg-[rgba(255,255,255,0.08)] p-[11px]">
        <Text className="font-outfit text-sm text-fufu-butter">✦</Text>
        <Text className="flex-1 font-outfit text-xs leading-[17px] text-[rgba(255,255,255,0.72)]">
          Delivery address and payment will be selected at checkout.
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        className="flex-row items-center justify-center gap-2 rounded-[14px] bg-fufu-primary py-[13px] active:opacity-80 active:scale-[0.98]"
        onPress={onContinueShopping}
      >
        <Text className="font-outfit-semibold text-sm text-fufu-white">Continue shopping</Text>
        <Text className="font-outfit-bold text-[17px] text-fufu-butter">↗</Text>
      </Pressable>
    </Animated.View>
  );
}
