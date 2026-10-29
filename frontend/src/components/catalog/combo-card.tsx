import { Pressable, Text, View } from "react-native";
import type { CatalogCombo } from "@/features/catalog/types";
import { formatRwf } from "@/utils/catalog";
import { CatalogImage } from "./catalog-image";

type ComboCardProps = {
  combo: CatalogCombo;
  onPress?: (combo: CatalogCombo) => void;
};

/**
 * A row, not a card: image, name, one line of description, price. It's full
 * width, so a stack of combos reads as a list instead of a third horizontal
 * scroller. (The old one was a fixed 300pt dark card; inside a horizontal
 * scroller, wrap this in a View with a fixed width.)
 */
export function ComboCard({ combo, onPress }: ComboCardProps) {
  return (
    <Pressable
      accessibilityLabel={`${combo.name} combo, ${formatRwf(combo.price)}`}
      accessibilityRole={onPress ? "button" : undefined}
      className="flex-row items-center gap-4 active:opacity-80"
      disabled={!onPress}
      onPress={() => onPress?.(combo)}
    >
      <View className="h-[88px] w-[88px] overflow-hidden rounded-[20px] bg-fufu-primary-soft">
        <CatalogImage
          accessibilityLabel={combo.name}
          className="h-full w-full"
          fallbackKey={combo.slug}
          uri={combo.imageUrl}
        />
      </View>
      <View className="min-w-0 flex-1 gap-1">
        <Text
          className="font-outfit-semibold text-[16px] leading-[22px] text-fufu-ink"
          numberOfLines={1}
        >
          {combo.name}
        </Text>
        {combo.description ? (
          <Text
            className="font-outfit text-[13px] leading-[18px] text-fufu-muted"
            numberOfLines={2}
          >
            {combo.description}
          </Text>
        ) : null}
        <Text className="font-outfit-bold text-[14px] text-fufu-ink">
          {formatRwf(combo.price)}
        </Text>
      </View>
    </Pressable>
  );
}