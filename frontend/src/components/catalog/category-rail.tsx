import { Pressable, ScrollView, Text, View } from "react-native";
import type { CatalogCategory } from "@/features/catalog/types";
import { CatalogImage } from "./catalog-image";

type CategoryRailProps = {
  categories: CatalogCategory[];
  onSelect: (slug: string) => void;
  selectedSlug?: string;
  showAll?: boolean;
};

export function CategoryRail({
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
      contentContainerClassName="gap-2.5 pr-6"
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {options.map((category) => {
        const selected = selectedSlug === category.slug;

        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected }}
            className={`min-h-[54px] flex-row items-center gap-2 rounded-[18px] border px-2.5 py-[7px] ${selected ? "border-fufu-primary bg-fufu-primary" : "border-fufu-line bg-fufu-surface"} active:opacity-80 active:scale-[0.98]`}
            key={category.id}
            onPress={() => onSelect(category.slug)}
          >
            {category.slug === "all" ? (
              <View className={`h-[38px] w-[38px] items-center justify-center rounded-[13px] ${selected ? "bg-[rgba(255,255,255,0.22)]" : "bg-fufu-butter-soft"}`}>
                <Text className="font-outfit-bold text-lg text-fufu-primary-deep">✦</Text>
              </View>
            ) : (
              <View className="h-[38px] w-[38px] overflow-hidden rounded-[13px] bg-fufu-primary-soft">
                <CatalogImage
                  accessibilityLabel={`${category.name} category`}
                  className="h-full w-full"
                  fallbackKey={category.slug}
                  uri={category.imageUrl}
                />
              </View>
            )}
            <Text
              numberOfLines={1}
              className={`max-w-[108px] font-outfit-semibold text-sm ${selected ? "text-fufu-white" : "text-fufu-ink-soft"}`}
            >
              {category.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
