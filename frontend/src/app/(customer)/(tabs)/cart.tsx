import { router, type Href } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { CatalogError, NoticeBanner } from "@/components/catalog/catalog-state";
import { CartEmpty, CartSkeleton } from "@/components/cart/cart-state";
import { CartItemCard } from "@/components/cart/cart-item-card";
import { CartSummary } from "@/components/cart/cart-summary";
import { CustomerHeader } from "@/components/customer/customer-header";
import { useTabBarInset } from "@/components/navigation/floating-tab-bar";
import { useCart, useCartActions } from "@/features/cart/hooks";
import { FUFU } from "@/theme/colors";

export default function CartScreen() {
  const cartQuery = useCart();
  const {
    clearCart,
    error: actionError,
    isClearing,
    isPending,
    pendingItemId,
    removeItem,
    updateQuantity,
  } = useCartActions();
  const tabBarInset = useTabBarInset();
  const cart = cartQuery.data;
  const { refetch: refetchCart } = cartQuery;

  const openMenu = useCallback(() => {
    router.push("/(customer)/(tabs)/menu" as Href);
  }, []);

  const openProfile = useCallback(() => {
    router.push("/(customer)/(tabs)/profile" as Href);
  }, []);

  const refresh = useCallback(() => {
    void refetchCart();
  }, [refetchCart]);

  const confirmClear = useCallback(() => {
    if (!cart?.items.length || isPending) return;

    Alert.alert(
      "Clear your cart?",
      "Every item will be removed from your cart.",
      [
        { text: "Keep items", style: "cancel" },
        {
          text: "Clear cart",
          onPress: () => void clearCart(),
          style: "destructive",
        },
      ],
    );
  }, [cart?.items.length, clearCart, isPending]);

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: tabBarInset },
        ]}
        refreshControl={
          <RefreshControl
            onRefresh={refresh}
            refreshing={cartQuery.isRefetching}
            tintColor={FUFU.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <CustomerHeader onProfile={openProfile} onSearch={openMenu} />

        <View style={styles.content}>
          <Animated.View entering={FadeInDown.duration(500)} style={styles.intro}>
            <View style={styles.titleRow}>
              <View style={styles.titleCopy}>
                <Text style={styles.eyebrow}>YOUR FUFU BAG</Text>
                <Text style={styles.title}>Good choices, all in one place.</Text>
                <Text style={styles.subtitle}>
                  Review your favourites before they make their way to you.
                </Text>
              </View>
              {cart && cart.items.length > 0 ? (
                <Pressable
                  accessibilityLabel="Clear cart"
                  accessibilityRole="button"
                  accessibilityState={{ disabled: isPending }}
                  disabled={isPending}
                  onPress={confirmClear}
                  style={({ pressed }) => [
                    styles.clearButton,
                    isPending && styles.disabled,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.clearText}>Clear</Text>
                </Pressable>
              ) : null}
            </View>
          </Animated.View>

          {cartQuery.isPending ? (
            <CartSkeleton />
          ) : cartQuery.isError ? (
            <CatalogError
              message="Your cart couldn't be loaded. Check your connection and try again."
              onRetry={() => void refetchCart()}
            />
          ) : cart && cart.items.length > 0 ? (
            <>
              <View style={styles.itemHeading}>
                <Text style={styles.sectionTitle}>Your items</Text>
                <Text style={styles.itemCount}>
                  {cart.totalQuantity} {cart.totalQuantity === 1 ? "item" : "items"}
                </Text>
              </View>

              <View style={styles.items}>
                {cart.items.map((item, index) => (
                  <CartItemCard
                    busy={isPending && (pendingItemId === item.id || isClearing)}
                    index={index}
                    item={item}
                    key={item.id}
                    onDecrease={() => void updateQuantity(item.id, item.quantity - 1)}
                    onIncrease={() => void updateQuantity(item.id, item.quantity + 1)}
                    onRemove={() => void removeItem(item.id)}
                  />
                ))}
              </View>

              <NoticeBanner message={actionError} />
              <CartSummary
                itemCount={cart.totalQuantity}
                onContinueShopping={openMenu}
                subtotal={cart.subtotal}
              />
            </>
          ) : (
            <CartEmpty onBrowse={openMenu} />
          )}
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
    paddingTop: 1,
  },
  content: {
    gap: 22,
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  intro: {
    gap: 6,
  },
  titleRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  titleCopy: {
    flex: 1,
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
    fontSize: 29,
    letterSpacing: -0.8,
    lineHeight: 35,
  },
  subtitle: {
    color: FUFU.muted,
    fontFamily: "Outfit_400Regular",
    fontSize: 15,
    lineHeight: 21,
  },
  clearButton: {
    borderColor: FUFU.line,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 3,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  clearText: {
    color: FUFU.primaryDeep,
    fontFamily: "Outfit_600SemiBold",
    fontSize: 12,
  },
  itemHeading: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: FUFU.ink,
    fontFamily: "Outfit_700Bold",
    fontSize: 20,
  },
  itemCount: {
    color: FUFU.muted,
    fontFamily: "Outfit_400Regular",
    fontSize: 13,
  },
  items: {
    gap: 12,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
});
