import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { useEffect, useState, type ReactNode } from "react";
import { Keyboard, Platform, Pressable, StyleSheet, View } from "react-native";
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

// FUFU tokens (the same hexes as AUTH in auth-ui.tsx). The bar is now glass:
// a blurred backdrop with a translucent dark tint over it, rather than a flat
// fill, so content scrolling underneath shows through softly. The bubble
// keeps the primary orange but gains a glow halo so it reads as lit from
// within the glass rather than printed on top of it.
const COLORS = {
  barTint: "rgba(40, 23, 14, 0.55)", // translucent version of the old #28170E
  barBorder: "rgba(255, 255, 255, 0.14)", // hairline edge highlight
  bubble: "#E95F18",
  bubbleGlow: "rgba(233, 95, 24, 0.45)",
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
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const tabs = state.routes.filter((route) => {
    const options = descriptors[route.key].options;
    return (
      typeof options.tabBarIcon === "function" &&
      (options as { href?: unknown }).href !== null
    );
  });
  const focusedKey = state.routes[state.index]?.key;
  const activeIndex = tabs.findIndex((route) => route.key === focusedKey);

  const position = useSharedValue(Math.max(activeIndex, 0));
  useEffect(() => {
    if (activeIndex >= 0) position.value = withSpring(activeIndex, SPRING);
  }, [activeIndex, position]);

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
    <Animated.View
      accessibilityRole="tablist"
      pointerEvents={keyboardOpen ? "none" : "box-none"}
      style={[styles.wrap, { bottom: insets.bottom + LIFT }, wrapStyle]}
    >
      <View style={[styles.bar, { width: tabs.length * SLOT + BAR_PAD * 2 }]}>
        {/* Glass backdrop. `tint="dark"` gets the blur in the right tonal
            range on Android (where blur intensity behaves differently than
            iOS); the explicit tint View on top is what actually carries the
            FUFU brand colour, since BlurView's own `tint` prop is coarse. */}
        <BlurView
          intensity={38}
          tint="dark"
          style={StyleSheet.absoluteFill}
          experimentalBlurMethod={
            Platform.OS === "android" ? "dimezisBlurView" : undefined
          }
        />
        <View style={[StyleSheet.absoluteFill, styles.tint]} />
        {/* Hairline top+edge highlight: the thing that sells "glass" rather
            than "dark translucent plastic" is a faint light edge where it
            would catch a reflection. */}
        <View style={styles.edge} pointerEvents="none" />

        <Animated.View style={[styles.bubbleGlow, bubbleStyle]} />
        <Animated.View style={[styles.bubble, bubbleStyle]} />
        {tabs.map((route, index) => {
          const { options } = descriptors[route.key];
          const focused = route.key === focusedKey;
          return (
            <TabItem
              key={route.key}
              focused={focused}
              index={index}
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
      onLongPress={onLongPress}
      onPress={onPress}
      onPressIn={() => {
        press.value = withTiming(1, { duration: 80, easing: TIMING.easing });
      }}
      onPressOut={() => {
        press.value = withTiming(0, TIMING);
      }}
      style={styles.item}
      testID={testID}
    >
      <Animated.View style={[styles.icon, scale]}>
        <Animated.View style={away}>{renderIcon(false)}</Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, here]}>
          {renderIcon(true)}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", left: 0, position: "absolute", right: 0 },
  bar: {
    borderRadius: BAR_HEIGHT / 2,
    elevation: 12,
    flexDirection: "row",
    height: BAR_HEIGHT,
    overflow: "hidden",
    paddingHorizontal: BAR_PAD,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
  },
  tint: {
    backgroundColor: COLORS.barTint,
  },
  edge: {
    borderColor: COLORS.barBorder,
    borderRadius: BAR_HEIGHT / 2,
    borderWidth: 1,
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  bubble: {
    backgroundColor: COLORS.bubble,
    borderRadius: BUBBLE / 2,
    height: BUBBLE,
    left: BAR_PAD + (SLOT - BUBBLE) / 2,
    position: "absolute",
    top: (BAR_HEIGHT - BUBBLE) / 2,
    width: BUBBLE,
  },
  bubbleGlow: {
    backgroundColor: COLORS.bubbleGlow,
    borderRadius: (BUBBLE + 20) / 2,
    height: BUBBLE + 20,
    left: BAR_PAD + (SLOT - (BUBBLE + 20)) / 2,
    position: "absolute",
    top: (BAR_HEIGHT - (BUBBLE + 20)) / 2,
    width: BUBBLE + 20,
  },
  item: {
    alignItems: "center",
    height: BAR_HEIGHT,
    justifyContent: "center",
    width: SLOT,
  },
  icon: { height: ICON, width: ICON },
});