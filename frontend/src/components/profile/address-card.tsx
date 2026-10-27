import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Address } from "@/features/profile/types";
import { FUFU } from "@/theme/colors";

type AddressCardProps = {
  address: Address;
  busy?: boolean;
  onRemove: () => void;
};

export function AddressCard({ address, busy = false, onRemove }: AddressCardProps) {
  const location = [
    address.building,
    address.street,
    address.sector,
    address.district,
    address.province,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>⌂</Text>
      </View>
      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <Text style={styles.label}>{address.label || "Saved address"}</Text>
          {address.isDefault ? (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Default</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.recipient}>{address.recipientName}</Text>
        <Text numberOfLines={2} style={styles.location}>
          {location || "Kigali"}
        </Text>
        <Text style={styles.phone}>{address.phone}</Text>
      </View>
      <Pressable
        accessibilityLabel={`Remove ${address.label || "saved address"}`}
        accessibilityRole="button"
        accessibilityState={{ disabled: busy }}
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
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "flex-start",
    backgroundColor: FUFU.surface,
    borderColor: FUFU.line,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    gap: 11,
    padding: 14,
  },
  iconWrap: {
    alignItems: "center",
    backgroundColor: FUFU.sageSoft,
    borderRadius: 14,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  icon: {
    color: FUFU.success,
    fontFamily: "Outfit_700Bold",
    fontSize: 22,
  },
  copy: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  label: {
    color: FUFU.ink,
    fontFamily: "Outfit_700Bold",
    fontSize: 15,
  },
  defaultBadge: {
    backgroundColor: FUFU.sageSoft,
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  defaultText: {
    color: FUFU.success,
    fontFamily: "Outfit_600SemiBold",
    fontSize: 10,
  },
  recipient: {
    color: FUFU.inkSoft,
    fontFamily: "Outfit_500Medium",
    fontSize: 13,
  },
  location: {
    color: FUFU.muted,
    fontFamily: "Outfit_400Regular",
    fontSize: 12,
    lineHeight: 17,
  },
  phone: {
    color: FUFU.muted,
    fontFamily: "Outfit_400Regular",
    fontSize: 11,
    marginTop: 1,
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
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.65,
    transform: [{ scale: 0.92 }],
  },
});
