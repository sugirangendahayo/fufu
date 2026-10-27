import { router, type Href } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
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
    <SafeAreaView className="flex-1 bg-fufu-bg" edges={["top"]}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: tabBarInset }}
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

        <View className="gap-[22px] px-5 pt-[25px]">
          <Animated.View entering={FadeInDown.duration(500)} className="gap-1.5">
            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1 gap-1.5">
                <Text className="font-outfit-bold text-[11px] tracking-[1.5px] text-fufu-primary-deep">
                  YOUR FUFU BAG
                </Text>
                <Text className="font-outfit-bold text-[29px] leading-[35px] tracking-[-0.8px] text-fufu-ink">
                  Good choices, all in one place.
                </Text>
                <Text className="font-outfit text-[15px] leading-[21px] text-fufu-muted">
                  Review your favourites before they make their way to you.
                </Text>
              </View>
              {cart && cart.items.length > 0 ? (
                <Pressable
                  accessibilityLabel="Clear cart"
                  accessibilityRole="button"
                  accessibilityState={{ disabled: isPending }}
                  className={`mt-[3px] rounded-xl border border-fufu-line px-3 py-2 ${isPending ? "opacity-45" : ""} active:opacity-70 active:scale-95`}
                  disabled={isPending}
                  onPress={confirmClear}
                >
                  <Text className="font-outfit-semibold text-xs text-fufu-primary-deep">Clear</Text>
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
              <View className="flex-row items-center justify-between">
                <Text className="font-outfit-bold text-xl text-fufu-ink">Your items</Text>
                <Text className="font-outfit text-[13px] text-fufu-muted">
                  {cart.totalQuantity} {cart.totalQuantity === 1 ? "item" : "items"}
                </Text>
              </View>

              <View className="gap-3">
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
