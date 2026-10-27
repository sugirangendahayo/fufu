import { router, useLocalSearchParams, type Href } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CategoryRail } from "@/components/catalog/category-rail";
import {
  CatalogEmpty,
  CatalogError,
  CatalogLoading,
  NoticeBanner,
} from "@/components/catalog/catalog-state";
import { ProductCard } from "@/components/catalog/product-card";
import { SearchField } from "@/components/catalog/search-field";
import { CustomerHeader } from "@/components/customer/customer-header";
import { SectionHeader } from "@/components/customer/section-header";
import { useTabBarInset } from "@/components/navigation/floating-tab-bar";
import { useAddToCart } from "@/features/cart/use-add-to-cart";
import {
  useCategories,
  useProducts,
} from "@/features/catalog/hooks";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { FUFU } from "@/theme/colors";

export default function MenuScreen() {
  const tabBarInset = useTabBarInset();
  const params = useLocalSearchParams<{ category?: string }>();
  const selectedCategory =
    typeof params.category === "string" && params.category.length > 0
      ? params.category
      : "all";
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim());
  const categoriesQuery = useCategories();
  const productsQuery = useProducts({
    category: selectedCategory === "all" ? undefined : selectedCategory,
    limit: 100,
    search: debouncedSearch || undefined,
  });
  const { addToCart, addedId, addingId, error: cartError } = useAddToCart();

  const openProfile = useCallback(() => {
    router.push("/(customer)/(tabs)/profile" as Href);
  }, []);

  const selectCategory = useCallback((slug: string) => {
    router.setParams({ category: slug });
  }, []);

  const categories = categoriesQuery.data ?? [];
  const products = productsQuery.data?.data ?? [];
  const total = productsQuery.data?.meta.total ?? products.length;
  const refresh = useCallback(() => {
    void Promise.all([categoriesQuery.refetch(), productsQuery.refetch()]);
  }, [categoriesQuery, productsQuery]);
  const refreshing = categoriesQuery.isRefetching || productsQuery.isRefetching;

  const header = (
    <View style={styles.listHeader}>
      <View style={styles.titleBlock}>
        <Text style={styles.eyebrow}>THE FUFU MENU</Text>
        <Text style={styles.title}>Find your next favourite.</Text>
        <Text style={styles.subtitle}>
          Take your time. There&apos;s something good in every category.
        </Text>
      </View>

      <SearchField onChangeText={setSearch} value={search} />

      <View style={styles.categorySection}>
        <SectionHeader title="Categories" />
        {categoriesQuery.isPending ? (
          <CatalogLoading label="Loading categories…" />
        ) : categoriesQuery.isError ? (
          <CatalogError
            message="Categories are taking a moment to arrive."
            onRetry={() => void categoriesQuery.refetch()}
          />
        ) : (
          <CategoryRail
            categories={categories}
            onSelect={selectCategory}
            selectedSlug={selectedCategory}
            showAll
          />
        )}
      </View>

      <View style={styles.resultHeading}>
        <SectionHeader title={search ? "Search results" : "All favourites"} />
        {!productsQuery.isPending && !productsQuery.isError ? (
          <Text style={styles.resultCount}>
            {total} {total === 1 ? "item" : "items"}
          </Text>
        ) : null}
      </View>
      <NoticeBanner message={cartError} />
    </View>
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <StatusBar style="dark" />
      <FlatList
        columnWrapperStyle={styles.column}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarInset }]}
        data={products}
        keyExtractor={(product) => product.id}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          productsQuery.isPending ? (
            <CatalogLoading label="Loading the menu…" />
          ) : productsQuery.isError ? (
            <CatalogError
              message="The menu couldn't be loaded. Check your connection and try again."
              onRetry={() => void productsQuery.refetch()}
            />
          ) : (
            <CatalogEmpty
              message={
                search
                  ? "No menu items match that search."
                  : "No items are available in this category yet."
              }
            />
          )
        }
        ListHeaderComponent={
          <View>
            <CustomerHeader onProfile={openProfile} />
            {header}
          </View>
        }
        numColumns={2}
        refreshControl={
          <RefreshControl
            onRefresh={refresh}
            refreshing={refreshing}
            tintColor={FUFU.primary}
          />
        }
        renderItem={({ item, index }) => (
          <ProductCard
            added={addedId === item.id}
            index={index}
            loading={addingId === item.id}
            onAdd={addToCart}
            product={item}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: FUFU.background,
    flex: 1,
  },
  content: {
    paddingBottom: 104,
    paddingHorizontal: 20,
  },
  listHeader: {
    gap: 22,
    paddingBottom: 20,
    paddingTop: 25,
  },
  titleBlock: {
    gap: 6,
  },
  eyebrow: {
    color: FUFU.primaryDeep,
    fontFamily: "Outfit_700Bold",
    fontSize: 11,
    letterSpacing: 1.5,
  },
  title: {
    color: FUFU.ink,
    fontFamily: "Outfit_700Bold",
    fontSize: 30,
    letterSpacing: -0.8,
    lineHeight: 36,
  },
  subtitle: {
    color: FUFU.muted,
    fontFamily: "Outfit_400Regular",
    fontSize: 15,
    lineHeight: 21,
  },
  categorySection: {
    gap: 13,
  },
  resultHeading: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  resultCount: {
    color: FUFU.muted,
    fontFamily: "Outfit_400Regular",
    fontSize: 13,
  },
  column: {
    gap: 12,
  },
});
