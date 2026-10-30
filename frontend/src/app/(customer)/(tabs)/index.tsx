import { router, type Href } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CategoryTiles } from "@/components/catalog/category-tiles";
import { CatalogBoundary, GridSkeleton, phaseOf, Toast } from "@/components/catalog/catalog-state";
import { ComboCard } from "@/components/catalog/combo-card";
import { ProductCard } from "@/components/catalog/product-card";
import { CustomerHeader } from "@/components/customer/customer-header";
import { PromoBanner } from "@/components/customer/promo-banner";
import { SectionHeader } from "@/components/customer/section-header";
import { useTabBarInset } from "@/components/navigation/floating-tab-bar";
import { useAddToCart } from "@/features/cart/use-add-to-cart";
import { useCategories, useCombos, useProducts } from "@/features/catalog/hooks";
import type { CatalogProduct } from "@/features/catalog/types";
import { FUFU } from "@/theme/colors";

export default function HomeScreen() {
  const tabBarInset = useTabBarInset();
  const categoriesQuery = useCategories();
  const featuredQuery = useProducts({ featured: true, limit: 6 });
  const combosQuery = useCombos();
  const cart = useAddToCart();

  const categories = categoriesQuery.data ?? [];
  const featured = featuredQuery.data?.data ?? [];
  const combos = combosQuery.data ?? [];

  const openMenu = useCallback(() => {
    router.navigate("/(customer)/(tabs)/menu" as Href);
  }, []);
  const openProfile = useCallback(() => {
    router.navigate("/(customer)/(tabs)/profile" as Href);
  }, []);
  const openCategory = useCallback((slug: string) => {
    router.navigate({
      pathname: "/(customer)/(tabs)/menu",
      params: { category: slug },
    } as unknown as Href);
  }, []);
  const openProduct = useCallback((product: CatalogProduct) => {
    router.push({
      pathname: "/(customer)/product/[id]",
      params: { id: product.id },
    } as unknown as Href);
  }, []);

  const promo = combos[0]
    ? {
        fallbackKey: combos[0].slug,
        imageUrl: combos[0].imageUrl,
        price: combos[0].price,
        subtitle: combos[0].description,
        title: combos[0].name,
      }
    : featured[0]
      ? {
          fallbackKey: featured[0].slug,
          imageUrl: featured[0].imageUrl,
          price: featured[0].basePrice,
          subtitle: featured[0].description,
          title: featured[0].name,
        }
      : null;

  const refresh = () => {
    void Promise.all([
      categoriesQuery.refetch(),
      featuredQuery.refetch(),
      combosQuery.refetch(),
    ]);
  };
  const refreshing =
    categoriesQuery.isRefetching ||
    featuredQuery.isRefetching ||
    combosQuery.isRefetching;

  return (
    <SafeAreaView className="flex-1 bg-fufu-bg" edges={["top"]}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: tabBarInset }}
        refreshControl={
          <RefreshControl
            onRefresh={refresh}
            refreshing={refreshing}
            tintColor={FUFU.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <CustomerHeader onProfile={openProfile} />
        {promo ? <PromoBanner {...promo} onPress={openMenu} /> : null}

        <View className="mt-8 gap-4">
          <View className="px-5">
            <SectionHeader
              actionLabel="See all"
              onAction={openMenu}
              title="Browse categories"
            />
          </View>
          {categoriesQuery.isPending ? (
            <GridSkeleton rows={2} />
          ) : categories.length > 0 ? (
            <CategoryTiles categories={categories} onSelect={openCategory} />
          ) : null}
        </View>

        <View className="mt-8 gap-8">
          <View className="gap-4">
            <View className="px-5">
              <SectionHeader
                actionLabel="Full menu"
                onAction={openMenu}
                title="Popular right now"
              />
            </View>
            <CatalogBoundary
              emptyMessage="No popular picks yet. The full menu is ready to explore."
              errorMessage="Popular picks couldn't be loaded."
              onRetry={() => void featuredQuery.refetch()}
              phase={phaseOf(featuredQuery, featured.length)}
              skeleton={<GridSkeleton />}
            >
              <ProductGrid cart={cart} onProductPress={openProduct} products={featured} />
            </CatalogBoundary>
          </View>

          {combos.length > 0 ? (
            <View className="gap-4">
              <View className="px-5">
                <SectionHeader
                  actionLabel="See menu"
                  onAction={openMenu}
                  title="Made to go together"
                />
              </View>
              <View className="gap-5 px-5">
                {combos.slice(0, 3).map((combo) => (
                  <ComboCard combo={combo} key={combo.id} onPress={openMenu} />
                ))}
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <Toast bottom={tabBarInset} message={cart.error} />
    </SafeAreaView>
  );
}

type Cart = Pick<ReturnType<typeof useAddToCart>, "addToCart" | "addedId" | "addingId">;

function ProductGrid({
  cart,
  onProductPress,
  products,
}: {
  cart: Cart;
  onProductPress: (product: CatalogProduct) => void;
  products: CatalogProduct[];
}) {
  return (
    <View className="px-5">
      {chunk(products, 2).map((row) => (
        <View className="flex-row gap-3" key={row[0].id}>
          {row.map((product) => (
            <ProductCard
              added={cart.addedId === product.id}
              key={product.id}
              loading={cart.addingId === product.id}
              onAdd={cart.addToCart}
              onPress={onProductPress}
              product={product}
            />
          ))}
          {row.length === 1 ? <View className="flex-1" /> : null}
        </View>
      ))}
    </View>
  );
}

function chunk<T>(items: T[], size: number) {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) rows.push(items.slice(i, i + size));
  return rows;
}
