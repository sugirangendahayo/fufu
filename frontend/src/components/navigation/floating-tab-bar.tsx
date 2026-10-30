import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useEffect, useState, type ReactNode } from "react";
import { Keyboard, Platform, Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BAR_HEIGHT = 70;
const LIFT = 12;

export function useTabBarInset() {
  const { bottom } = useSafeAreaInsets();
  return BAR_HEIGHT + LIFT + bottom + 16;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const ios = Platform.OS === "ios";
    const show = Keyboard.addListener(
      ios ? "keyboardWillShow" : "keyboardDidShow",
      () => setKeyboardOpen(true),
    );
    const hide = Keyboard.addListener(
      ios ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardOpen(false),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return (
    <View
      accessibilityRole="tablist"
      className="absolute left-0 right-0 items-center"
      pointerEvents={keyboardOpen ? "none" : "box-none"}
      style={{ bottom: insets.bottom + LIFT }}
    >
      <View className="h-[70px] w-[calc(100%-32px)] max-w-[430px] flex-row items-stretch rounded-[35px] border border-fufu-line bg-fufu-surface px-1.5 shadow-2xl">
        {tabs.map((route) => {
          const { options } = descriptors[route.key];
          const focused = route.key === focusedKey;
          return (
            <TabItem
              focused={focused}
              key={route.key}
              label={options.tabBarAccessibilityLabel ?? options.title ?? route.name}
              renderIcon={(active) =>
                options.tabBarIcon?.({
                  focused: active,
                  color: active ? "#E95F18" : "#4F3B2E",
                  size: 22,
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
    </View>
  );
}

function TabItem({
  focused,
  label,
  renderIcon,
  testID,
  onPress,
  onLongPress,
}: {
  focused: boolean;
  label: string;
  renderIcon: (active: boolean) => ReactNode;
  testID?: string;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const active = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    active.value = withSpring(focused ? 1 : 0, {
      damping: 18,
      stiffness: 240,
      overshootClamping: true,
    });
  }, [active, focused]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + active.value * 0.08 }],
  }));

  return (
    <AnimatedPressable
      accessibilityLabel={label}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      className="flex-1 items-center justify-center gap-0.5 active:opacity-70"
      onLongPress={onLongPress}
      onPress={onPress}
      testID={testID}
    >
      <Animated.View style={iconStyle}>{renderIcon(focused)}</Animated.View>
      <Text className={`font-outfit-semibold text-[11px] ${focused ? "text-fufu-primary" : "text-fufu-ink-soft"}`}>
        {label}
      </Text>
    </AnimatedPressable>
  );
}
