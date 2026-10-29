import { Pressable, Text, View } from "react-native";
import { ChevronDownGlyph, SearchGlyph } from "@/components/ui/glyphs";
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
    <View className="flex-row items-center gap-3 px-5 pb-1 pt-3">
      <Text className="font-outfit-extrabold text-[22px] tracking-[1.1px] text-fufu-primary">
        FUFU
      </Text>
      <Pressable
        accessibilityLabel={`Delivery location: ${AREA}`}
        accessibilityRole={onLocation ? "button" : undefined}
        className="flex-1 flex-row items-center justify-center gap-1.5 active:opacity-70"
        disabled={!onLocation}
        onPress={onLocation}
      >
        <Text className="font-outfit-bold text-[15px] text-fufu-primary">⌖</Text>
        <Text className="font-outfit-semibold text-[13px] text-fufu-muted">
          Delivery to <Text className="text-fufu-ink-soft">{AREA}</Text>
        </Text>
        {onLocation ? <ChevronDownGlyph color={FUFU.muted} size={14} /> : null}
      </Pressable>
      <View className="flex-row items-center gap-2">
        {onSearch ? (
          <Pressable
            accessibilityLabel="Search menu"
            accessibilityRole="button"
            className="h-10 w-10 items-center justify-center rounded-xl border border-fufu-line bg-fufu-surface active:scale-95 active:opacity-75"
            hitSlop={8}
            onPress={onSearch}
          >
            <SearchGlyph color={FUFU.ink} size={19} />
          </Pressable>
        ) : null}
        <Pressable
          accessibilityLabel="Open profile"
          accessibilityRole="button"
          className="h-10 w-10 items-center justify-center rounded-xl bg-fufu-ink active:scale-95 active:opacity-75"
          hitSlop={8}
          onPress={onProfile}
        >
          <Text className="font-outfit-bold text-[13px] text-fufu-white">
            {initials(user?.firstName, user?.lastName)}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
