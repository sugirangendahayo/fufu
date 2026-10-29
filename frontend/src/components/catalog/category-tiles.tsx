import { Pressable, Text, View } from "react-native";
import { ArrowRightGlyph } from "@/components/ui/glyphs";
import type { CatalogCategory } from "@/features/catalog/types";
import { FUFU } from "@/theme/colors";

const TILES = [
  { background: "bg-fufu-primary-soft", accent: "text-fufu-primary-deep" },
  { background: "bg-fufu-butter-soft", accent: "text-[#9A6500]" },
  { background: "bg-fufu-sage-soft", accent: "text-fufu-success" },
  { background: "bg-[#F1E8F5]", accent: "text-[#79518B]" },
] as const;

export function CategoryTiles({
  categories,
  onSelect,
}: {
  categories: CatalogCategory[];
  onSelect: (slug: string) => void;
}) {
  return (
    <View className="gap-3 px-5">
      {chunk(categories.slice(0, 4), 2).map((row, rowIndex) => (
        <View className="flex-row gap-3" key={rowIndex}>
          {row.map((category, index) => {
            const tile = TILES[(rowIndex * 2 + index) % TILES.length];
            return (
              <Pressable
                accessibilityLabel={`Browse ${category.name}`}
                accessibilityRole="button"
                className={`min-h-[92px] flex-1 justify-between rounded-[22px] p-4 active:scale-[0.98] active:opacity-80 ${tile.background}`}
                key={category.id}
                onPress={() => onSelect(category.slug)}
              >
                <Text className={`font-outfit-bold text-[17px] ${tile.accent}`}>
                  {category.name}
                </Text>
                <View className="flex-row items-center justify-between">
                  <Text className="font-outfit text-xs text-fufu-muted">Explore</Text>
                  <ArrowRightGlyph color={FUFU.ink} size={16} strokeWidth={1.8} />
                </View>
              </Pressable>
            );
          })}
          {row.length === 1 ? <View className="flex-1" /> : null}
        </View>
      ))}
    </View>
  );
}

function chunk<T>(items: T[], size: number) {
  const rows: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    rows.push(items.slice(index, index + size));
  }
  return rows;
}
