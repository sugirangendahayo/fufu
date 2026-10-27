import { router, type Href } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
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
import { useAddToCart } from "@/features/cart/use-add-to-cart";
import {
  useCategories,
  useCombos,
  useProducts,
} from "@/features/catalog/hooks";
import { useAuthStore } from "@/features/auth/auth-store";
import { FUFU } from "@/theme/colors";

export default function HomeScreen() {
  const firstName = useAuthStore((state) => state.user?.firstName);
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
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.contentContainer}
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

        <View style={styles.content}>
          <Animated.View entering={FadeInDown.duration(500)} style={styles.intro}>
            <Text style={styles.eyebrow}>YOUR NEXT GOOD MEAL</Text>
            <Text style={styles.title}>
              {firstName ? `Hey ${firstName}, ` : "Hey there, "}
              what are you craving?
            </Text>
            <Text style={styles.subtitle}>
              Freshly made favourites, ready when you are.
            </Text>
          </Animated.View>

          <HeroCarousel onExplore={openMenu} />

          <View style={styles.section}>
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

          <View style={styles.section}>
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
                contentContainerStyle={styles.productRow}
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
            <View style={styles.section}>
              <SectionHeader
                actionLabel="See menu"
                onAction={openMenu}
                title="Made to go together"
              />
              <ScrollView
                contentContainerStyle={styles.comboRow}
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                {combos.slice(0, 4).map((combo) => (
                  <ComboCard combo={combo} key={combo.id} onPress={openMenu} />
                ))}
              </ScrollView>
            </View>
          ) : null}

          <View style={styles.bottomNote}>
            <Text style={styles.bottomNoteMark}>✦</Text>
            <Text style={styles.bottomNoteText}>
              Made for Kigali cravings, one order at a time.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: FUFU.background,
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 34,
  },
  content: {
    gap: 25,
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  intro: {
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
    fontSize: 31,
    letterSpacing: -0.8,
    lineHeight: 37,
  },
  subtitle: {
    color: FUFU.muted,
    fontFamily: "Outfit_400Regular",
    fontSize: 15,
    lineHeight: 21,
  },
  section: {
    gap: 14,
  },
  productRow: {
    gap: 12,
    paddingRight: 20,
  },
  comboRow: {
    gap: 12,
    paddingRight: 20,
  },
  bottomNote: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    paddingBottom: 8,
    paddingTop: 3,
  },
  bottomNoteMark: {
    color: FUFU.butter,
    fontSize: 20,
  },
  bottomNoteText: {
    color: FUFU.muted,
    fontFamily: "Outfit_400Regular",
    fontSize: 12,
  },
});
