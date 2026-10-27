import { ScrollView, StyleSheet, Text, Pressable, View } from "react-native";
import { FUFU } from "@/theme/colors";
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
      contentContainerStyle={styles.content}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {options.map((category) => {
        const selected = selectedSlug === category.slug;

        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected }}
            key={category.id}
            onPress={() => onSelect(category.slug)}
            style={({ pressed }) => [
              styles.item,
              selected && styles.itemSelected,
              pressed && styles.itemPressed,
            ]}
          >
            {category.slug === "all" ? (
              <View style={[styles.allIcon, selected && styles.allIconSelected]}>
                <Text style={styles.allIconText}>✦</Text>
              </View>
            ) : (
              <View style={styles.imageWrap}>
                <CatalogImage
                  accessibilityLabel={`${category.name} category`}
                  fallbackKey={category.slug}
                  uri={category.imageUrl}
                />
              </View>
            )}
            <Text
              numberOfLines={1}
              style={[styles.label, selected && styles.labelSelected]}
            >
              {category.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 10,
    paddingRight: 24,
  },
  item: {
    alignItems: "center",
    backgroundColor: FUFU.surface,
    borderColor: FUFU.line,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    minHeight: 54,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  itemPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  itemSelected: {
    backgroundColor: FUFU.primary,
    borderColor: FUFU.primary,
  },
  imageWrap: {
    backgroundColor: FUFU.primarySoft,
    borderRadius: 13,
    height: 38,
    overflow: "hidden",
    width: 38,
  },
  allIcon: {
    alignItems: "center",
    backgroundColor: FUFU.butterSoft,
    borderRadius: 13,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  allIconSelected: {
    backgroundColor: "rgba(255, 255, 255, 0.22)",
  },
  allIconText: {
    color: FUFU.primaryDeep,
    fontFamily: "Outfit_700Bold",
    fontSize: 18,
  },
  label: {
    color: FUFU.inkSoft,
    fontFamily: "Outfit_600SemiBold",
    fontSize: 14,
    maxWidth: 108,
  },
  labelSelected: {
    color: FUFU.white,
  },
});
