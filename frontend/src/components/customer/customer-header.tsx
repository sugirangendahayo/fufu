import { Pressable, Text, View } from "react-native";
import { ChevronDownGlyph, SearchGlyph } from "@/components/ui/glyphs";
import { useAuthStore } from "@/features/auth/auth-store";
import { FUFU } from "@/theme/colors";
import { initials } from "@/utils/catalog";

type CustomerHeaderProps = {
  /** Pass this once there's an address picker. Without it the location is plain text. */
  onLocation?: () => void;
  onProfile?: () => void;
  /** Legacy. Home no longer shows a search icon: it has a search field. */
  onSearch?: () => void;
};

const AREA = "Kigali";

/**
 * Two things, not four: where the order is going, and who's ordering. The FUFU
 * wordmark is gone (you're already inside the app) and so is the search icon
 * (Home has a search field). The old location row was a Pressable with no
 * onPress: a chevron that promised a picker and did nothing. It's only
 * interactive now if you give it somewhere to go.
 */
export function CustomerHeader({
  onLocation,
  onProfile,
  onSearch,
}: CustomerHeaderProps) {
  const user = useAuthStore((state) => state.user);

  const place = (
    <View>
      <Text className="font-outfit text-xs leading-4 text-fufu-muted">
        Deliver to
      </Text>
      <View className="flex-row items-center gap-1">
        <Text className="font-outfit-semibold text-base leading-[22px] text-fufu-ink">
          {AREA}
        </Text>
        {onLocation ? <ChevronDownGlyph color={FUFU.ink} size={16} /> : null}
      </View>
    </View>
  );

  return (
    <View className="flex-row items-center justify-between bg-fufu-bg px-5 pb-1 pt-2">
      {onLocation ? (
        <Pressable
          accessibilityLabel={`Delivery location: ${AREA}`}
          accessibilityRole="button"
          className="active:opacity-70"
          hitSlop={8}
          onPress={onLocation}
        >
          {place}
        </Pressable>
      ) : (
        <View accessible accessibilityLabel={`Delivering in ${AREA}`}>
          {place}
        </View>
      )}

      <View className="flex-row items-center gap-2.5">
        {onSearch ? (
          <Pressable
            accessibilityLabel="Search menu"
            accessibilityRole="button"
            className="h-10 w-10 items-center justify-center rounded-full border border-fufu-line bg-fufu-surface active:opacity-75"
            hitSlop={8}
            onPress={onSearch}
          >
            <SearchGlyph color={FUFU.ink} size={20} />
          </Pressable>
        ) : null}
        <Pressable
          accessibilityLabel="Open profile"
          accessibilityRole="button"
          className="h-10 w-10 items-center justify-center rounded-full bg-fufu-ink active:opacity-75"
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