import { useEffect } from "react";
import { Pressable, ScrollView } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { TIMING } from "@/components/ui/motion";
import type { CatalogCategory } from "@/features/catalog/types";

type CategoryRailProps = {
  categories: CatalogCategory[];
  onSelect: (slug: string) => void;
  selectedSlug?: string;
  showAll?: boolean;
  /**
   * Full-bleed. The rail pads itself (px-5), so chips slide off the edge of the
   * screen. Inside a padded parent they were clipped 20pt in from the edge
   * mid-scroll. Off by default so existing callers keep their layout.
   */
  bleed?: boolean;
};

export function CategoryRail({
  bleed = false,
  categories,
  onSelect,
  selectedSlug,
  showAll = false,
}: CategoryRailProps) {
  const options: CatalogCategory[] = showAll
    ? [
        {
          id: "all",
          imageUrl: null,
          isActive: true,
          name: "All",
          slug: "all",
          sortOrder: -1,
        },
        ...categories,
      ]
    : categories;

  return (
    <ScrollView
      contentContainerClassName={bleed ? "gap-2 px-5" : "gap-2 pr-6"}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {options.map((category) => (
        <Chip
          key={category.id}
          label={category.name}
          onPress={() => onSelect(category.slug)}
          selected={selectedSlug === category.slug}
        />
      ))}
    </ScrollView>
  );
}

/**
 * Text only. The 38pt thumbnails (and a fallback collage squeezed into them)
 * were most of the old rail's noise; the food belongs in the product tiles.
 *
 * Selection is one value (0 -> 1) that fades a filled layer over an outlined
 * one, and swaps the two labels with it, so a chip never snaps between looks.
 * Both layers are sibling views, so no colour value needs to be known here.
 */
function Chip({
  label,
  onPress,
  selected,
}: {
  label: string;
  onPress: () => void;
  selected: boolean;
}) {
  const progress = useSharedValue(selected ? 1 : 0);
  useEffect(() => {
    progress.value = withTiming(selected ? 1 : 0, TIMING);
  }, [progress, selected]);

  const idle = useAnimatedStyle(() => ({ opacity: 1 - progress.value }));
  const active = useAnimatedStyle(() => ({ opacity: progress.value }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className="h-10 max-w-[180px] justify-center rounded-full px-4 active:opacity-80"
      onPress={onPress}
    >
      <Animated.View
        className="absolute inset-0 rounded-full border border-fufu-line bg-fufu-surface"
        style={idle}
      />
      <Animated.View
        className="absolute inset-0 rounded-full bg-fufu-ink"
        style={active}
      />
      {/* The in-flow label sizes the chip; the white one overlays it. */}
      <Animated.Text
        className="font-outfit-semibold text-[14px] leading-5 text-fufu-ink-soft"
        numberOfLines={1}
        style={idle}
      >
        {label}
      </Animated.Text>
      <Animated.Text
        className="absolute left-4 right-4 top-2.5 font-outfit-semibold text-[14px] leading-5 text-fufu-white"
        numberOfLines={1}
        style={active}
      >
        {label}
      </Animated.Text>
    </Pressable>
  );
}