import { Pressable, Text, View } from "react-native";
import {
  BellGlyph,
  ChevronDownGlyph,
  SearchGlyph,
} from "@/components/ui/glyphs";
import { useAuthStore } from "@/features/auth/auth-store";
import { FUFU } from "@/theme/colors";

type CustomerHeaderProps = {
  hasNotifications?: boolean;
  onLocation?: () => void;
  onNotifications?: () => void;
  onSearch?: () => void;
};

const AREA = "Kigali";

export function CustomerHeader({
  hasNotifications = false,
  onLocation,
  onNotifications,
  onSearch,
}: CustomerHeaderProps) {
  return (
    <View className="flex-row justify-between items-center bg-fufu-bg px-5 pt-3 pb-3">
      <Pressable
        accessibilityLabel="Search menu"
        accessibilityRole="button"
        className="justify-center items-center bg-fufu-surface active:opacity-75 border border-fufu-line rounded-full w-10 h-10 active:scale-95"
        hitSlop={8}
        onPress={onSearch}
      >
        <SearchGlyph color={FUFU.ink} size={19} />
      </Pressable>

      <Pressable
        accessibilityLabel={`Delivery location: ${AREA}`}
        accessibilityRole={onLocation ? "button" : undefined}
        className="items-center active:opacity-75"
        disabled={!onLocation}
        onPress={onLocation}
      >
        <Text className="font-outfit-medium text-[11px] text-fufu-muted">
          Location
        </Text>
        <View className="flex-row items-center gap-1.5 mt-0.5">
          <View className="bg-[#A6D32C] rounded-full w-2.5 h-2.5" />
          <Text className="font-outfit-semibold text-[15px] text-fufu-ink">
            {AREA}
          </Text>
          <ChevronDownGlyph color={FUFU.ink} size={16} />
        </View>
      </Pressable>

      <Pressable
        accessibilityLabel="Notifications"
        accessibilityRole="button"
        className="justify-center items-center bg-fufu-surface active:opacity-75 border border-fufu-line rounded-full w-10 h-10 active:scale-95"
        hitSlop={8}
        onPress={onNotifications}
      >
        <BellGlyph color={FUFU.ink} size={19} />
        {hasNotifications ? (
          <View className="top-2 right-2 absolute bg-[#EF4444] rounded-full w-2 h-2" />
        ) : null}
      </Pressable>
    </View>
  );
}