import { useEffect, useState, type ReactNode } from "react";
import { Keyboard, Platform, Pressable, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Geometry. One slot per tab, and the pill hugs its tabs, like the reference.
const SLOT = 64; // touch area of one tab
const BAR_PAD = 8; // inner padding of the pill
const BAR_HEIGHT = 64;
const BUBBLE = 48; // the orange circle
const ICON = 24;
const LIFT = 12; // gap between the pill and the safe-area edge

// FUFU tokens (the same hexes as AUTH in auth-ui.tsx): the bar is the warm
// near-black text colour, the bubble is the primary, and inactive icons are the
// cream background at 72%. Orange is the only accent: it marks where you are.
const COLORS = {
  bar: "#28170E",
  bubble: "#E95F18",
  icon: "rgba(255, 249, 242, 0.72)",
  iconActive: "#FFFFFF",
} as const;

// No overshoot: it reads as one quick, physical glide, and it retargets
// smoothly (velocity kept) if the user taps another tab mid-flight.
const SPRING = {
  damping: 26,
  stiffness: 300,
  mass: 0.9,
  overshootClamping: true,
} as const;
const TIMING = { duration: 140, easing: Easing.out(Easing.cubic) } as const;

type TabBarProps = {
  state: {
    routes: { key: string; name: string; params?: object }[];
    index: number;
  };
  descriptors: Record<
    string,
    {
      options: {
        tabBarIcon?: (props: {
          focused: boolean;
          color: string;
          size: number;
        }) => ReactNode;
        tabBarAccessibilityLabel?: string;
        title?: string;
        tabBarButtonTestID?: string;
        href?: unknown;
      };
    }
  >;
  navigation: {
    emit: (event: {
      type: "tabPress" | "tabLongPress";
      target: string;
      canPreventDefault?: boolean;
    }) => { defaultPrevented?: boolean };
    navigate: (name: string, params?: object) => void;
  };
};

/**
 * Space the floating bar takes at the bottom, margin included. The bar floats
 * OVER the screens, so nothing reserves room for it: add this to the bottom
 * padding of every tab screen's scroll content (and to any sticky bottom
 * button, e.g. checkout), or the last row will sit behind the bar.
 */
export function useTabBarInset() {
  const { bottom } = useSafeAreaInsets();
  return BAR_HEIGHT + LIFT + bottom + 16;
}

export function FloatingTabBar({
  state,
  descriptors,
  navigation,
}: TabBarProps) {
  const insets = useSafeAreaInsets();

  // Only routes that opt in with an icon, and aren't hidden with `href: null`.
  // A custom tab bar receives EVERY route in the folder; without this filter an
  // extra file such as explore.tsx would show up as an empty tab.
  const tabs = state.routes.filter((route) => {
    const options = descriptors[route.key].options;
    return typeof options.tabBarIcon === "function" && options.href !== null;
  });
  const focusedKey = state.routes[state.index]?.key;
  const activeIndex = tabs.findIndex((route) => route.key === focusedKey);

  // The one value everything below reads: the tab index, animated. It follows
  // the navigation state, so it also glides when something else navigates
  // (a "View cart" button on Home, say), not only on taps.
  const position = useSharedValue(Math.max(activeIndex, 0));
  useEffect(() => {
    if (activeIndex >= 0) position.value = withSpring(activeIndex, SPRING);
  }, [activeIndex, position]);

  // The bar leaves with the keyboard: on Android (window resize) it would
  // otherwise ride up above it.
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const hidden = useSharedValue(0);
  useEffect(() => {
    const ios = Platform.OS === "ios";
    const show = Keyboard.addListener(
      ios ? "keyboardWillShow" : "keyboardDidShow",
      () => {
        setKeyboardOpen(true);
        hidden.value = withTiming(1, TIMING);
      },
    );
    const hide = Keyboard.addListener(
      ios ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardOpen(false);
        hidden.value = withTiming(0, TIMING);
      },
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, [hidden]);

  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value * SLOT }],
  }));
  const wrapStyle = useAnimatedStyle(() => ({
    opacity: 1 - hidden.value,
    transform: [{ translateY: hidden.value * (BAR_HEIGHT + LIFT + 32) }],
  }));

  return (
    // `box-none`: the full-width strip must not swallow touches meant for the
    // screen behind it; only the pill itself is touchable.
    <Animated.View
      accessibilityRole="tablist"
      className="absolute left-0 right-0 items-center"
      pointerEvents={keyboardOpen ? "none" : "box-none"}
      style={[{ bottom: insets.bottom + LIFT }, wrapStyle]}
    >
      <View
        className="h-16 flex-row rounded-[32px] bg-fufu-ink px-2 shadow-2xl"
        style={{ width: tabs.length * SLOT + BAR_PAD * 2 }}
      >
        <Animated.View
          className="absolute top-2 h-12 w-12 rounded-[24px] bg-fufu-primary"
          style={[{ left: BAR_PAD + (SLOT - BUBBLE) / 2 }, bubbleStyle]}
        />
        {tabs.map((route, index) => {
          const { options } = descriptors[route.key];
          const focused = route.key === focusedKey;
          return (
            <TabItem
              key={route.key}
              focused={focused}
              index={index}
              // The label is gone visually but not for screen readers.
              label={
                options.tabBarAccessibilityLabel ?? options.title ?? route.name
              }
              position={position}
              renderIcon={(active) =>
                options.tabBarIcon?.({
                  focused: active,
                  color: active ? COLORS.iconActive : COLORS.icon,
                  size: ICON,
                })
              }
              testID={options.tabBarButtonTestID}
              onLongPress={() =>
                navigation.emit({ type: "tabLongPress", target: route.key })
              }
              onPress={() => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name, route.params);
                }
              }}
            />
          );
        })}
      </View>
    </Animated.View>
  );
}

function TabItem({
  focused,
  index,
  label,
  position,
  renderIcon,
  testID,
  onPress,
  onLongPress,
}: {
  focused: boolean;
  index: number;
  label: string;
  position: SharedValue<number>;
  renderIcon: (active: boolean) => ReactNode;
  testID?: string;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const press = useSharedValue(0);

  // Distance from the bubble to this tab: 0 when it's on it, 1 once it's a full
  // slot away. Two stacked copies of the icon crossfade on it, so as the bubble
  // slides past, each icon it crosses lights up and dims in turn instead of
  // snapping. (An SVG icon's `color` can't be animated; opacity can.)
  const away = useAnimatedStyle(() => ({
    opacity: Math.min(Math.abs(position.value - index), 1),
  }));
  const here = useAnimatedStyle(() => ({
    opacity: 1 - Math.min(Math.abs(position.value - index), 1),
  }));
  const scale = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - press.value * 0.1 }],
  }));

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      className="h-16 w-16 items-center justify-center"
      onLongPress={onLongPress}
      onPress={onPress}
      onPressIn={() => {
        press.value = withTiming(1, { duration: 80, easing: TIMING.easing });
      }}
      onPressOut={() => {
        press.value = withTiming(0, TIMING);
      }}
      testID={testID}
    >
      <Animated.View className="h-6 w-6" style={scale}>
        <Animated.View style={away}>{renderIcon(false)}</Animated.View>
        <Animated.View className="absolute inset-0" style={here}>
          {renderIcon(true)}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}
