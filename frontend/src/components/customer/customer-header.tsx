import { Pressable, Text, View } from "react-native";
import {
  LocationGlyph,
  PencilGlyph,
  SearchGlyph,
} from "@/components/ui/glyphs";
import { useAuthStore } from "@/features/auth/auth-store";
import { FUFU } from "@/theme/colors";
import { initials } from "@/utils/catalog";

type CustomerHeaderProps = {
  onLocation?: () => void;
  onProfile?: () => void;
  onSearch?: () => void;
};

const AREA = "Kigali";

export function CustomerHeader({
  onLocation,
  onProfile,
  onSearch,
}: CustomerHeaderProps) {
  const user = useAuthStore((state) => state.user);

  return (
    <View className="flex-row items-center gap-3 bg-fufu-bg px-5 pb-3 pt-3">
      <Text className="font-outfit-extrabold text-[22px] tracking-[1px] text-fufu-primary">
        FUFU
      </Text>

      <View className="flex-1 items-center">
        <Pressable
          accessibilityLabel={`Delivery location: ${AREA}`}
          accessibilityRole={onLocation ? "button" : undefined}
          className="h-[48px] min-w-[150px] max-w-[190px] flex-row items-center rounded-full bg-[#F2F0EF] px-3 active:opacity-75"
          disabled={!onLocation}
          onPress={onLocation}
        >
          <LocationGlyph color={FUFU.primary} size={20} />
          <View className="ml-2 flex-1">
            <Text className="font-outfit-medium text-[10px] uppercase tracking-[0.7px] text-fufu-muted">
              Deliver to
            </Text>
            <Text className="font-outfit-semibold text-[14px] leading-[17px] text-fufu-ink-soft">
              {AREA}
            </Text>
          </View>
          {onLocation ? <PencilGlyph color={FUFU.muted} size={17} /> : null}
        </Pressable>
      </View>

      <View className="flex-row items-center gap-2">
        {onSearch ? (
          <Pressable
            accessibilityLabel="Search menu"
            accessibilityRole="button"
            className="h-10 w-10 items-center justify-center rounded-full border border-fufu-line bg-fufu-surface active:scale-95 active:opacity-75"
            hitSlop={8}
            onPress={onSearch}
          >
            <SearchGlyph color={FUFU.ink} size={19} />
          </Pressable>
        ) : null}
        <Pressable
          accessibilityLabel="Open profile"
          accessibilityRole="button"
          className="h-10 w-10 items-center justify-center rounded-full bg-fufu-primary-soft active:scale-95 active:opacity-75"
          hitSlop={8}
          onPress={onProfile}
        >
          <Text className="font-outfit-bold text-[13px] text-fufu-primary-deep">
            {initials(user?.firstName, user?.lastName)}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
