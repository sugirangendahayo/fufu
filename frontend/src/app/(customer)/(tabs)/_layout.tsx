import { Tabs } from "expo-router";
import { SymbolView } from "expo-symbols";
import { FUFU } from "@/theme/colors";

export default function CustomerTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: FUFU.primary,
        tabBarInactiveTintColor: FUFU.muted,
        tabBarStyle: {
          backgroundColor: FUFU.surface,
          borderTopColor: FUFU.line,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <SymbolView
              name={{ ios: "house", android: "home", web: "home" }}
              size={size}
              tintColor={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: "Menu",
          tabBarIcon: ({ color, size }) => (
            <SymbolView
              name={{
                ios: "fork.knife",
                android: "restaurant_menu",
                web: "restaurant_menu",
              }}
              size={size}
              tintColor={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ color, size }) => (
            <SymbolView
              name={{ ios: "cart", android: "shopping_cart", web: "shopping_cart" }}
              size={size}
              tintColor={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <SymbolView
              name={{ ios: "person", android: "person", web: "person" }}
              size={size}
              tintColor={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
