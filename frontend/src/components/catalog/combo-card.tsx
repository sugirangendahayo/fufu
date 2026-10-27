import { Pressable, Text, View } from "react-native";
import type { CatalogCombo } from "@/features/catalog/types";
import { formatRwf } from "@/utils/catalog";
import { CatalogImage } from "./catalog-image";

type ComboCardProps = {
  combo: CatalogCombo;
  onPress?: (combo: CatalogCombo) => void;
};

export function ComboCard({ combo, onPress }: ComboCardProps) {
  return (
    <Pressable
      accessibilityLabel={`${combo.name} combo`}
      accessibilityRole={onPress ? "button" : undefined}
      className="min-h-[170px] w-[300px] flex-row overflow-hidden rounded-3xl bg-fufu-ink active:opacity-90 active:scale-[0.99]"
      disabled={!onPress}
      onPress={() => onPress?.(combo)}
    >
      <View className="w-[126px] self-stretch bg-[#442A1D]">
        <CatalogImage
          accessibilityLabel={combo.name}
          className="h-full w-full"
          fallbackKey={combo.slug}
          uri={combo.imageUrl}
        />
      </View>
      <View className="flex-1 justify-center gap-1.5 px-4 py-[17px]">
        <Text className="font-outfit-bold text-[10px] tracking-[1.1px] text-fufu-butter">
          FUFU COMBO
        </Text>
        <Text numberOfLines={1} className="font-outfit-bold text-xl text-fufu-white">
          {combo.name}
        </Text>
        {combo.description ? (
          <Text
            numberOfLines={2}
            className="font-outfit text-xs leading-[17px] text-[rgba(255,255,255,0.70)]"
          >
            {combo.description}
          </Text>
        ) : null}
        <Text className="mt-0.5 font-outfit-bold text-[15px] text-fufu-white">
          {formatRwf(combo.price)}
        </Text>
      </View>
    </Pressable>
  );
}
