import { Image } from "expo-image";
import { useEffect, type ReactNode } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export const AUTH = {
  primary: "#E95F18",
  text: "#28170E",
  muted: "#705B4C",
  error: "#B42318",
  onPrimary: "#FFFFFF",
  surface: "#FFFFFF",
  rule: "rgba(40, 23, 14, 0.16)",
  placeholder: "rgba(112, 91, 76, 0.55)",
  shade: "rgba(40, 23, 14, 0.14)",
} as const;

const TIMING = { duration: 140, easing: Easing.out(Easing.cubic) } as const;

export function Heading({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <View className="gap-1.5">
      <Text className="font-outfit-bold text-[32px] leading-9 tracking-[-0.8px] text-fufu-ink">
        {title}
      </Text>
      <Text className="font-outfit text-base leading-[22px] text-[#705B4C]">{subtitle}</Text>
    </View>
  );
}

export function Field({
  label,
  hint,
  onFocus,
  onBlur,
  style,
  ...props
}: TextInputProps & { label: string; hint?: string }) {
  const focus = useSharedValue(0);
  const ruleWidth = useSharedValue(Dimensions.get("window").width);
  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(focus.value, [0, 1], [AUTH.muted, AUTH.text]),
  }));
  const ruleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (focus.value - 1) * ruleWidth.value }],
  }));

  return (
    <View>
      <View className="flex-row justify-between">
        <Animated.Text
          accessibilityElementsHidden
          className="font-outfit-bold text-[13px]"
          importantForAccessibility="no"
          style={labelStyle}
        >
          {label}
        </Animated.Text>
        {hint ? (
          <Animated.Text
            entering={FadeIn.duration(TIMING.duration).easing(TIMING.easing)}
            exiting={FadeOut.duration(TIMING.duration).easing(TIMING.easing)}
            className="font-outfit text-[13px] text-[#705B4C]"
          >
            {hint}
          </Animated.Text>
        ) : null}
      </View>
      <TextInput
        accessibilityLabel={label}
        className="min-h-12 py-2.5 font-outfit text-lg text-fufu-ink"
        cursorColor={AUTH.primary}
        placeholderTextColor={AUTH.placeholder}
        selectionColor={AUTH.primary}
        {...props}
        style={style}
        onFocus={(event) => {
          // Reanimated shared values are mutable by design.
          // eslint-disable-next-line react-hooks/immutability
          focus.value = withTiming(1, TIMING);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          // Reanimated shared values are mutable by design.
          // eslint-disable-next-line react-hooks/immutability
          focus.value = withTiming(0, TIMING);
          onBlur?.(event);
        }}
      />
      <View
        className="h-0.5 overflow-hidden"
        onLayout={(event) => {
          ruleWidth.value = event.nativeEvent.layout.width;
        }}
      >
        <View className="absolute inset-x-0 bottom-0 top-px bg-[rgba(40,23,14,0.16)]" />
        <Animated.View className="h-0.5 bg-fufu-primary" style={ruleStyle} />
      </View>
    </View>
  );
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function usePressFeedback() {
  const press = useSharedValue(0);
  const handlers = {
    onPressIn: () => {
      press.value = withTiming(1, { duration: 80, easing: TIMING.easing });
    },
    onPressOut: () => {
      press.value = withTiming(0, TIMING);
    },
  };
  const surface = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - press.value * 0.015 }],
  }));
  const shade = useAnimatedStyle(() => ({ opacity: press.value }));
  return { handlers, surface, shade };
}

export function PrimaryButton({
  children,
  disabled,
  loading,
  onPress,
}: {
  children: string;
  disabled?: boolean;
  loading?: boolean;
  onPress: () => void;
}) {
  const { handlers, surface, shade } = usePressFeedback();
  const busy = useSharedValue(0);

  useEffect(() => {
    busy.value = withTiming(loading ? 1 : 0, TIMING);
  }, [loading, busy]);

  const labelFade = useAnimatedStyle(() => ({ opacity: 1 - busy.value }));
  const spinnerFade = useAnimatedStyle(() => ({ opacity: busy.value }));
  const inert = Boolean(disabled || loading);

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ busy: Boolean(loading), disabled: inert }}
      className={`min-h-14 items-center justify-center overflow-hidden rounded-xl bg-fufu-primary ${disabled && !loading ? "opacity-45" : ""}`}
      disabled={inert}
      onPress={onPress}
      {...handlers}
      style={surface}
    >
      <Animated.View className="absolute inset-0 bg-[rgba(40,23,14,0.14)]" pointerEvents="none" style={shade} />
      <Animated.Text className="font-outfit-extrabold text-base text-fufu-white" style={labelFade}>
        {children}
      </Animated.Text>
      <Animated.View className="absolute inset-0 items-center justify-center" pointerEvents="none" style={spinnerFade}>
        <ActivityIndicator color={AUTH.onPrimary} />
      </Animated.View>
    </AnimatedPressable>
  );
}

export function IconButton({
  children,
  label,
  hint,
  onPress,
}: {
  children: ReactNode;
  label: string;
  hint?: string;
  onPress: () => void;
}) {
  const { handlers, surface, shade } = usePressFeedback();
  return (
    <AnimatedPressable
      accessibilityHint={hint}
      accessibilityLabel={label}
      accessibilityRole="button"
      className="h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-[rgba(40,23,14,0.16)] bg-white"
      onPress={onPress}
      {...handlers}
      style={surface}
    >
      <Animated.View className="absolute inset-0 bg-[rgba(40,23,14,0.14)]" pointerEvents="none" style={shade} />
      {children}
    </AnimatedPressable>
  );
}

export function GoogleButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <IconButton hint="Not available yet" label={label} onPress={onPress}>
      <Image
        source={require("@/assets/images/google-g.png")}
        className="h-6 w-6"
        contentFit="contain"
      />
    </IconButton>
  );
}

export function InlineError({
  children,
  tone = "error",
}: {
  children?: string;
  tone?: "error" | "info";
}) {
  if (!children) return null;
  return (
    <Animated.Text
      accessibilityRole={tone === "error" ? "alert" : undefined}
      entering={FadeIn.duration(TIMING.duration).easing(TIMING.easing)}
      className={`font-outfit text-sm leading-5 ${tone === "error" ? "text-fufu-danger" : "text-[#705B4C]"}`}
    >
      {children}
    </Animated.Text>
  );
}

export function AuthSwitch({
  prompt,
  action,
  onPress,
}: {
  prompt: string;
  action: string;
  onPress: () => void;
}) {
  return (
    <View className="flex-row items-center gap-1.5">
      <Text className="font-outfit text-[15px] text-[#705B4C]">{prompt}</Text>
      <Pressable accessibilityRole="link" className="active:opacity-70" hitSlop={10} onPress={onPress}>
        <Text className="font-outfit-extrabold text-[15px] text-fufu-ink">{action}</Text>
      </Pressable>
    </View>
  );
}
