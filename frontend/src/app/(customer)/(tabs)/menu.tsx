import { router, useLocalSearchParams, type Href } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";
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
import { useCategories, useProducts } from "@/features/catalog/hooks";
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
    <View className="gap-[22px] pb-5 pt-[25px]">
      <View className="gap-1.5">
        <Text className="font-outfit-bold text-[11px] tracking-[1.5px] text-fufu-primary-deep">
          THE FUFU MENU
        </Text>
        <Text className="font-outfit-bold text-[30px] leading-9 tracking-[-0.8px] text-fufu-ink">
          Find your next favourite.
        </Text>
        <Text className="font-outfit text-[15px] leading-[21px] text-fufu-muted">
          Take your time. There&apos;s something good in every category.
        </Text>
      </View>

      <SearchField onChangeText={setSearch} value={search} />

      <View className="gap-[13px]">
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

      <View className="flex-row items-center justify-between">
        <SectionHeader title={search ? "Search results" : "All favourites"} />
        {!productsQuery.isPending && !productsQuery.isError ? (
          <Text className="font-outfit text-[13px] text-fufu-muted">
            {total} {total === 1 ? "item" : "items"}
          </Text>
        ) : null}
      </View>
      <NoticeBanner message={cartError} />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-fufu-bg" edges={["top"]}>
      <StatusBar style="dark" />
      <FlatList
        columnWrapperClassName="gap-3"
        contentContainerClassName="px-5"
        contentContainerStyle={{ paddingBottom: tabBarInset }}
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
