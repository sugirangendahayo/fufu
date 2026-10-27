import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { FUFU } from "@/theme/colors";
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
      style={styles.card}
    >
      <View style={styles.heading}>
        <Text style={styles.title}>Order summary</Text>
        <Text style={styles.count}>
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Subtotal</Text>
        <Text style={styles.value}>{formatRwf(subtotal)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Delivery</Text>
        <Text style={styles.delivery}>Calculated at checkout</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.row}>
        <Text style={styles.totalLabel}>Total for now</Text>
        <Text style={styles.total}>{formatRwf(subtotal)}</Text>
      </View>

      <View style={styles.nextStep}>
        <Text style={styles.nextStepMark}>✦</Text>
        <Text style={styles.nextStepText}>
          Delivery address and payment will be selected at checkout.
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={onContinueShopping}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Text style={styles.buttonText}>Continue shopping</Text>
        <Text style={styles.buttonArrow}>↗</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: FUFU.ink,
    borderRadius: 26,
    gap: 15,
    padding: 20,
  },
  heading: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    color: FUFU.white,
    fontFamily: "Outfit_700Bold",
    fontSize: 19,
  },
  count: {
    color: "rgba(255, 255, 255, 0.62)",
    fontFamily: "Outfit_400Regular",
    fontSize: 12,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    color: "rgba(255, 255, 255, 0.70)",
    fontFamily: "Outfit_400Regular",
    fontSize: 14,
  },
  value: {
    color: FUFU.white,
    fontFamily: "Outfit_500Medium",
    fontSize: 14,
  },
  delivery: {
    color: FUFU.butter,
    fontFamily: "Outfit_500Medium",
    fontSize: 12,
  },
  divider: {
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    height: 1,
  },
  totalLabel: {
    color: FUFU.white,
    fontFamily: "Outfit_600SemiBold",
    fontSize: 16,
  },
  total: {
    color: FUFU.butter,
    fontFamily: "Outfit_700Bold",
    fontSize: 19,
  },
  nextStep: {
    alignItems: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 14,
    flexDirection: "row",
    gap: 8,
    padding: 11,
  },
  nextStepMark: {
    color: FUFU.butter,
    fontSize: 14,
  },
  nextStepText: {
    color: "rgba(255, 255, 255, 0.72)",
    flex: 1,
    fontFamily: "Outfit_400Regular",
    fontSize: 12,
    lineHeight: 17,
  },
  button: {
    alignItems: "center",
    backgroundColor: FUFU.primary,
    borderRadius: 14,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    paddingVertical: 13,
  },
  buttonText: {
    color: FUFU.white,
    fontFamily: "Outfit_600SemiBold",
    fontSize: 14,
  },
  buttonArrow: {
    color: FUFU.butter,
    fontFamily: "Outfit_700Bold",
    fontSize: 17,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
});
