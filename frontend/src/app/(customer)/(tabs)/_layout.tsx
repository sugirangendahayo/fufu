import {
  Cart2Outlined,
  Home2Outlined,
  User4Outlined,
  Search1Outlined,
} from "@lineiconshq/free-icons";


import { Lineicons } from "@lineiconshq/react-native-lineicons";
import { Tabs } from "expo-router";
import type { ColorValue } from "react-native";
import { FloatingTabBar } from "@/components/navigation/floating-tab-bar";

// One icon family on every platform. SymbolView drew SF Symbols on iOS and
// Material Symbols on Android: two different drawings, weights and metrics.
// Named components keep the custom tab bar accessible and lintable.
type TabIconProps = { color: ColorValue; size: number };

function HomeTabIcon({ color, size }: TabIconProps) {
  return (
    <Lineicons
      icon={Home2Outlined}
      size={size}
      color={color as string}
      strokeWidth={1.75}
    />
  );
}

function MenuTabIcon({ color, size }: TabIconProps) {
  return (
    <Lineicons
      icon={Search1Outlined}
      size={size}
      color={color as string}
      strokeWidth={1.75}
    />
  );
}

function CartTabIcon({ color, size }: TabIconProps) {
  return (
    <Lineicons
      icon={Cart2Outlined}
      size={size}
      color={color as string}
      strokeWidth={1.75}
    />
  );
}

function ProfileTabIcon({ color, size }: TabIconProps) {
  return (
    <Lineicons
      icon={User4Outlined}
      size={size}
      color={color as string}
      strokeWidth={1.75}
    />
  );
}

export default function CustomerTabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...(props as any)} />}
      screenOptions={{
        headerShown: false,
        // The screens crossfade while the bubble glides. React Navigation 7's
        // built-in; "shift" is the other one.
        animation: "fade",
      }}
    >
      {/* `title` is no longer drawn, but it's the screen-reader label. */}
      <Tabs.Screen
        name="index"
        options={{ title: "Home", tabBarIcon: HomeTabIcon }}
      />
      {/* The search glyph keeps the compact floating bar visually clear. */}
      <Tabs.Screen
        name="menu"
        options={{ title: "Menu", tabBarIcon: MenuTabIcon }}
      />
      <Tabs.Screen
        name="cart"
        options={{ title: "Cart", tabBarIcon: CartTabIcon }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Profile", tabBarIcon: ProfileTabIcon }}
      />
    </Tabs>
  );
}
