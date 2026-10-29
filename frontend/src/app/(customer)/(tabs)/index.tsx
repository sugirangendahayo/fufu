import { router, type Href } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CategoryRail } from "@/components/catalog/category-rail";
import {
  CatalogBoundary,
  ChipsSkeleton,
  GridSkeleton,
  phaseOf,
  Toast,
} from "@/components/catalog/catalog-state";
import { ComboCard } from "@/components/catalog/combo-card";
import { ProductCard } from "@/components/catalog/product-card";
import { SearchEntry } from "@/components/catalog/search-field";
import { CustomerHeader } from "@/components/customer/customer-header";
import { Masthead } from "@/components/customer/masthead";
import { SectionHeader } from "@/components/customer/section-header";
import { useTabBarInset } from "@/components/navigation/floating-tab-bar";
import { useAuthStore } from "@/features/auth/auth-store";
import { useAddToCart } from "@/features/cart/use-add-to-cart";
import { useCategories, useCombos, useProducts } from "@/features/catalog/hooks";
import type { CatalogProduct } from "@/features/catalog/types";
import { FUFU } from "@/theme/colors";

export default function HomeScreen() {
  const firstName = useAuthStore((state) => state.user?.firstName);
  const tabBarInset = useTabBarInset();
  const categoriesQuery = useCategories();
  const featuredQuery = useProducts({ featured: true, limit: 6 });
  const combosQuery = useCombos();
  const cart = useAddToCart();

  // Switching tabs is `navigate`, not `push`: it should land on the tab, not
  // stack another entry onto the history.
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

  // Not memoised: its dependencies are query objects that change every render,
  // so useCallback was re-creating it each time anyway.
  const refresh = () => {
    void Promise.all([
      categoriesQuery.refetch(),
      featuredQuery.refetch(),
      combosQuery.refetch(),
    ]);
  };

  const categories = categoriesQuery.data ?? [];
  const featured = featuredQuery.data?.data ?? [];
  const combos = combosQuery.data ?? [];
  const refreshing =
    categoriesQuery.isRefetching ||
    featuredQuery.isRefetching ||
    combosQuery.isRefetching;

  // Built from the real menu, so the placeholder never promises food you don't sell.
  const searchHint =
    categories.length > 0
      ? `Search ${categories
          .slice(0, 3)
          .map((category) => category.name.toLowerCase())
          .join(", ")}`
      : "Search the menu";

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
        <Masthead name={firstName} />

        <View className="mt-4 px-5">
          <SearchEntry hint={searchHint} onPress={openMenu} />
        </View>

        {/* Categories are a shortcut, not content: if they fail there's nothing
            to retry on Home, and the Menu tab still works. So no error box. */}
        <View className="mt-4">
          {categoriesQuery.isPending ? (
            <ChipsSkeleton />
          ) : categories.length > 0 ? (
            <CategoryRail bleed categories={categories} onSelect={openCategory} />
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
              <ProductGrid cart={cart} products={featured} />
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

/** Two columns, built from rows of `flex-1` cards (the same contract as the Menu grid). */
function ProductGrid({
  cart,
  products,
}: {
  cart: Cart;
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
              product={product}
            />
          ))}
          {/* An odd last item keeps its half width instead of stretching. */}
          {row.length === 1 ? <View className="flex-1" /> : null}
        </View>
      ))}
    </View>
  );
}

function chunk<T>(items: T[], size: number) {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}