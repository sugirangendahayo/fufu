import { router, type Href } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { CategoryRail } from "@/components/catalog/category-rail";
import {
  CatalogEmpty,
  CatalogError,
  CatalogSkeleton,
  NoticeBanner,
} from "@/components/catalog/catalog-state";
import { ComboCard } from "@/components/catalog/combo-card";
import { ProductCard } from "@/components/catalog/product-card";
import { CustomerHeader } from "@/components/customer/customer-header";
import { HeroCarousel } from "@/components/customer/hero-carousel";
import { SectionHeader } from "@/components/customer/section-header";
import { useTabBarInset } from "@/components/navigation/floating-tab-bar";
import { useAddToCart } from "@/features/cart/use-add-to-cart";
import { useAuthStore } from "@/features/auth/auth-store";
import { useCategories, useCombos, useProducts } from "@/features/catalog/hooks";
import { FUFU } from "@/theme/colors";

export default function HomeScreen() {
  const firstName = useAuthStore((state) => state.user?.firstName);
  const tabBarInset = useTabBarInset();
  const categoriesQuery = useCategories();
  const featuredQuery = useProducts({ featured: true, limit: 6 });
  const combosQuery = useCombos();
  const { addToCart, addedId, addingId, error: cartError } = useAddToCart();

  const openMenu = useCallback(() => {
    router.push("/(customer)/(tabs)/menu" as Href);
  }, []);

  const openProfile = useCallback(() => {
    router.push("/(customer)/(tabs)/profile" as Href);
  }, []);

  const openCategory = useCallback((slug: string) => {
    router.push({
      pathname: "/(customer)/(tabs)/menu",
      params: { category: slug },
    } as unknown as Href);
  }, []);

  const refresh = useCallback(() => {
    void Promise.all([
      categoriesQuery.refetch(),
      featuredQuery.refetch(),
      combosQuery.refetch(),
    ]);
  }, [categoriesQuery, combosQuery, featuredQuery]);

  const categories = categoriesQuery.data ?? [];
  const featuredProducts = featuredQuery.data?.data ?? [];
  const combos = combosQuery.data ?? [];
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
        <CustomerHeader onProfile={openProfile} onSearch={openMenu} />

        <View className="gap-[25px] px-5 pt-[25px]">
          <Animated.View entering={FadeInDown.duration(500)} className="gap-1.5">
            <Text className="font-outfit-bold text-[11px] tracking-[1.5px] text-fufu-primary-deep">
              YOUR NEXT GOOD MEAL
            </Text>
            <Text className="font-outfit-bold text-[31px] leading-[37px] tracking-[-0.8px] text-fufu-ink">
              {firstName ? `Hey ${firstName}, ` : "Hey there, "}
              what are you craving?
            </Text>
            <Text className="font-outfit text-[15px] leading-[21px] text-fufu-muted">
              Freshly made favourites, ready when you are.
            </Text>
          </Animated.View>

          <HeroCarousel onExplore={openMenu} />

          <View className="gap-3.5">
            <SectionHeader
              actionLabel="See all"
              onAction={openMenu}
              title="Browse by mood"
            />
            {categoriesQuery.isPending ? (
              <CatalogSkeleton rows={3} />
            ) : categoriesQuery.isError ? (
              <CatalogError
                message="Categories are taking a moment to arrive."
                onRetry={() => void categoriesQuery.refetch()}
              />
            ) : categories.length > 0 ? (
              <CategoryRail categories={categories} onSelect={openCategory} />
            ) : (
              <CatalogEmpty message="Categories will appear here once the kitchen menu is ready." />
            )}
          </View>

          <NoticeBanner message={cartError} />

          <View className="gap-3.5">
            <SectionHeader
              actionLabel="Full menu"
              onAction={openMenu}
              title="Popular right now"
            />
            {featuredQuery.isPending ? (
              <CatalogSkeleton rows={2} />
            ) : featuredQuery.isError ? (
              <CatalogError
                message="Popular picks couldn't be loaded."
                onRetry={() => void featuredQuery.refetch()}
              />
            ) : featuredProducts.length > 0 ? (
              <ScrollView
                contentContainerClassName="gap-3 pr-5"
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                {featuredProducts.map((product, index) => (
                  <ProductCard
                    added={addedId === product.id}
                    compact
                    index={index}
                    key={product.id}
                    loading={addingId === product.id}
                    onAdd={addToCart}
                    product={product}
                  />
                ))}
              </ScrollView>
            ) : (
              <CatalogEmpty message="No popular picks yet. The full menu is ready to explore." />
            )}
          </View>

          {combos.length > 0 ? (
            <View className="gap-3.5">
              <SectionHeader
                actionLabel="See menu"
                onAction={openMenu}
                title="Made to go together"
              />
              <ScrollView
                contentContainerClassName="gap-3 pr-5"
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                {combos.slice(0, 4).map((combo) => (
                  <ComboCard combo={combo} key={combo.id} onPress={openMenu} />
                ))}
              </ScrollView>
            </View>
          ) : null}

          <View className="flex-row items-center justify-center gap-2 pb-2 pt-0.5">
            <Text className="font-outfit text-xl text-fufu-butter">✦</Text>
            <Text className="font-outfit text-xs text-fufu-muted">
              Made for Kigali cravings, one order at a time.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
