import { Pressable, Text, View } from "react-native";
import type { Address } from "@/features/profile/types";

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
    <View className="flex-row items-start gap-[11px] rounded-[20px] border border-fufu-line bg-fufu-surface p-3.5">
      <View className="h-[42px] w-[42px] items-center justify-center rounded-[14px] bg-fufu-sage-soft">
        <Text className="font-outfit-bold text-[22px] text-fufu-success">⌂</Text>
      </View>
      <View className="min-w-0 flex-1 gap-[3px]">
        <View className="flex-row items-center gap-2">
          <Text className="font-outfit-bold text-[15px] text-fufu-ink">
            {address.label || "Saved address"}
          </Text>
          {address.isDefault ? (
            <View className="rounded-[7px] bg-fufu-sage-soft px-[7px] py-[3px]">
              <Text className="font-outfit-semibold text-[10px] text-fufu-success">Default</Text>
            </View>
          ) : null}
        </View>
        <Text className="font-outfit-medium text-[13px] text-fufu-ink-soft">
          {address.recipientName}
        </Text>
        <Text numberOfLines={2} className="font-outfit text-xs leading-[17px] text-fufu-muted">
          {location || "Kigali"}
        </Text>
        <Text className="mt-px font-outfit text-[11px] text-fufu-muted">{address.phone}</Text>
      </View>
      <Pressable
        accessibilityLabel={`Remove ${address.label || "saved address"}`}
        accessibilityRole="button"
        className={`h-7 w-7 items-center justify-center ${busy ? "opacity-40" : ""} active:opacity-65 active:scale-90`}
        disabled={busy}
        hitSlop={8}
        onPress={onRemove}
      >
        <Text className="font-outfit text-[25px] leading-[25px] text-fufu-muted">×</Text>
      </Pressable>
    </View>
  );
}
