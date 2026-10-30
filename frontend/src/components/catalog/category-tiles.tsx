import { Pressable, Text, View } from "react-native";
import type { CatalogCategory } from "@/features/catalog/types";
import { CatalogImage } from "./catalog-image";

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
          {row.map((category) => (
            <Pressable
              accessibilityLabel={`Browse ${category.name}`}
              accessibilityRole="button"
              className="min-h-[226px] flex-1 overflow-hidden rounded-[18px] border border-fufu-line bg-fufu-surface active:scale-[0.98] active:opacity-80"
              key={category.id}
              onPress={() => onSelect(category.slug)}
            >
              <View className="h-[174px] w-full bg-fufu-surface">
                <CatalogImage
                  accessibilityLabel={`${category.name} category image`}
                  className="h-full w-full"
                  contentFit="contain"
                  fallbackKey={category.slug}
                  uri={category.imageUrl}
                />
              </View>
              <View className="flex-1 justify-center px-3 pb-3 pt-2">
                <Text
                  className="text-center font-outfit-semibold text-[15px] text-fufu-ink"
                  numberOfLines={1}
                >
                  {category.name}
                </Text>
              </View>
            </Pressable>
          ))}
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
