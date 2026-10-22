import { useEffect, type ReactNode } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { OUTFIT } from "@/theme/fonts";

/**
 * FUFU tokens. Every neutral is an alpha tint of `text` / `muted`, so there are
 * no extra hex values. `surface` is the same white as `onPrimary`, named for
 * its job. `error` is the one non-brand colour, kept from the original because
 * the palette has no error token.
 *
 * FIX 9 (token drift): the original used five hexes outside the palette
 * (#3D3026, #261A12, #E7D8C8, #A3A3A3, #D84E09). They're gone.
 */
export const AUTH = {
  primary: "#E95F18",
  text: "#28170E",
  muted: "#705B4C",
  error: "#B42318",
  onPrimary: "#FFFFFF",
  surface: "#FFFFFF",
  rule: "rgba(40, 23, 14, 0.16)", // text @ 16%
  placeholder: "rgba(112, 91, 76, 0.55)", // muted @ 55%
  shade: "rgba(40, 23, 14, 0.14)", // text @ 14%, the pressed overlay
} as const;

// One timing for every transition in the auth flow.
const TIMING = { duration: 140, easing: Easing.out(Easing.cubic) } as const;

/**
 * Underline field. Each field owns one `focus` value (0 -> 1). The label colour
 * and the rule both read from it, so they can't drift apart.
 */
export function Field({
  label,
  onFocus,
  onBlur,
  style,
  ...props
}: TextInputProps & { label: string }) {
  const focus = useSharedValue(0);
  // Starts at the window width so the active rule is off-screen on the very
  // first frame, before onLayout has reported the real width.
  const ruleWidth = useSharedValue(Dimensions.get("window").width);

  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(focus.value, [0, 1], [AUTH.muted, AUTH.text]),
  }));
  const ruleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (focus.value - 1) * ruleWidth.value }],
  }));

  return (
    <View>
      <Animated.Text
        accessibilityElementsHidden
        importantForAccessibility="no"
        style={[styles.label, labelStyle]}
      >
        {label}
      </Animated.Text>
      <TextInput
        accessibilityLabel={label}
        cursorColor={AUTH.primary}
        placeholderTextColor={AUTH.placeholder}
        selectionColor={AUTH.primary}
        {...props}
        // FIX 7: spread first, then merge. A caller's `style` no longer
        // replaces the base input style.
        style={[styles.input, style]}
        onFocus={(event) => {
          focus.value = withTiming(1, TIMING);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          focus.value = withTiming(0, TIMING);
          onBlur?.(event);
        }}
      />
      <View
        style={styles.rule}
        onLayout={(event) => {
          ruleWidth.value = event.nativeEvent.layout.width;
        }}
      >
        <View style={styles.ruleBase} />
        <Animated.View style={[styles.ruleActive, ruleStyle]} />
      </View>
    </View>
  );
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * One press system for every tappable surface in the auth flow, so the CTA and
 * the icon button can't drift apart: press 0 (resting) -> 1 (finger down) drives
 * a 1.5% scale and a shade overlay.
 */
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

/**
 * The Pressable owns size, radius and background; the animated style adds only
 * `transform`. `busy` (0 label -> 1 spinner) crossfades inside a fixed-size
 * button, so loading never resizes it.
 */
export function PrimaryButton({
  children,
  disabled,
  loading,
  onPress,
}: {
  // FIX 1: a label, never a node. The spinner used to be passed in as a child
  // and rendered inside <Text>; it is now a sibling layer.
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
      disabled={inert}
      onPress={onPress}
      {...handlers}
      // FIX 2: only a real `disabled` dims. Loading blocks presses but stays at
      // full opacity (it used to render the spinner at 55%).
      style={[styles.button, disabled && !loading && styles.dimmed, surface]}
    >
      <Animated.View
        pointerEvents="none"
        style={[styles.fill, styles.shade, shade]}
      />
      <Animated.Text style={[styles.buttonLabel, labelFade]}>
        {children}
      </Animated.Text>
      <Animated.View
        pointerEvents="none"
        style={[styles.fill, styles.center, spinnerFade]}
      >
        <ActivityIndicator color={AUTH.onPrimary} />
      </Animated.View>
    </AnimatedPressable>
  );
}

/**
 * Square, icon-only secondary action. Same height and radius as the CTA so the
 * two sit in one row as a pair. The Pressable owns size, border and radius.
 */
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
      onPress={onPress}
      {...handlers}
      style={[styles.iconButton, surface]}
    >
      <Animated.View
        pointerEvents="none"
        style={[styles.fill, styles.shade, shade]}
      />
      {children}
    </AnimatedPressable>
  );
}

/**
 * FIX 6: render this *below* the button row. It used to mount between the
 * password field and the button, shoving the button down 38pt (58pt for two
 * lines) the instant it was tapped. Below the row it only eats slack the
 * screen's spacer was already absorbing, so nothing the user touched moves.
 *
 * FIX 12: `tone`. A neutral notice ("coming soon") must not read as a failure.
 */
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
      style={[styles.message, tone === "error" ? styles.error : styles.info]}
    >
      {children}
    </Animated.Text>
  );
}

// FIX 8: no `fontWeight` anywhere. The font family already encodes the weight,
// so a second, disagreeing declaration had no job to do.
const styles = StyleSheet.create({
  label: { fontFamily: OUTFIT.bold, fontSize: 13 },
  input: {
    color: AUTH.text,
    fontFamily: OUTFIT.regular,
    fontSize: 18,
    minHeight: 48,
    paddingHorizontal: 0,
    paddingVertical: 10,
  },
  // 2pt tall so the active rule (2pt) and the resting hairline (1pt, bottom
  // aligned) share one slot. Focus never changes the field's height.
  rule: { height: 2, overflow: "hidden" },
  ruleBase: {
    backgroundColor: AUTH.rule,
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 1,
  },
  ruleActive: { backgroundColor: AUTH.primary, height: 2 },
  button: {
    alignItems: "center",
    backgroundColor: AUTH.primary,
    borderRadius: 12,
    justifyContent: "center",
    minHeight: 56,
    overflow: "hidden",
  },
  buttonLabel: {
    color: AUTH.onPrimary,
    fontFamily: OUTFIT.extraBold,
    fontSize: 16,
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: AUTH.surface,
    borderColor: AUTH.rule,
    borderRadius: 12,
    borderWidth: 1,
    height: 56,
    justifyContent: "center",
    overflow: "hidden",
    width: 56,
  },
  fill: { bottom: 0, left: 0, position: "absolute", right: 0, top: 0 },
  shade: { backgroundColor: AUTH.shade },
  center: { alignItems: "center", justifyContent: "center" },
  dimmed: { opacity: 0.45 },
  message: { fontFamily: OUTFIT.regular, fontSize: 14, lineHeight: 20 },
  error: { color: AUTH.error },
  info: { color: AUTH.muted },
});
