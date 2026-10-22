import { Image } from "expo-image";
import { router, type Href } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthShell } from "@/components/auth/auth-shell";
import {
  AUTH,
  Field,
  IconButton,
  InlineError,
  PrimaryButton,
} from "@/components/auth/auth-ui";
import { FrontPiece, Garnish } from "@/components/auth/Garnish";
import { ApiError, authApi } from "@/features/auth/api";
import { useAuthStore } from "@/features/auth/auth-store";
import { OUTFIT } from "@/theme/fonts";

const GUTTER = 24;

// Art zone height: a share of the window, clamped so it can neither collapse
// on a short phone nor swallow the form on a tall one.
const ART_RATIO = 0.34;
const ART_MIN = 230;
const ART_MAX = 330;

type Message = { id: number; tone: "error" | "info"; text: string };

// Content-level touch for a food app: the subtitle follows the meal.
function mealLine(now = new Date()) {
  const hour = now.getHours();
  const meal =
    hour >= 5 && hour < 11
      ? "Breakfast"
      : hour >= 11 && hour < 16
        ? "Lunch"
        : hour >= 16 && hour < 22
          ? "Dinner"
          : "A late bite";
  return `${meal} is a few taps away.`;
}

export default function LoginScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<Message>();
  const [submitting, setSubmitting] = useState(false);
  const inFlight = useRef(false);
  const messageId = useRef(0);
  const subtitle = useMemo(() => mealLine(), []);
  const { setSession } = useAuthStore();

  // The one value every piece of art reads.
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const artHeight = Math.round(
    Math.min(Math.max(height * ART_RATIO, ART_MIN), ART_MAX),
  );

  // FIX 11: every message gets a fresh id, used as the React key below. Before,
  // setError(undefined) followed by setError(sameText) in one batch left the
  // state identical, so tapping again with the same problem re-rendered
  // nothing and the tap looked dead.
  const show = (tone: Message["tone"], text: string) =>
    setMessage({ id: ++messageId.current, tone, text });

  const login = async () => {
    // FIX 3 (part 1): block re-entry in the function itself, not only through
    // a prop that updates after the next render.
    if (inFlight.current) return;

    setMessage(undefined);

    // FIX 4: one trimmed value, used for validation AND the request. It used
    // to validate phone.trim() but send the untrimmed phone.
    const phoneNumber = phone.trim();
    if (!phoneNumber || !password) {
      show("error", "Enter your phone number and password.");
      return;
    }

    inFlight.current = true;
    setSubmitting(true);
    // Behaviour change, not a bug fix: the message is never hidden by the keyboard.
    Keyboard.dismiss();

    let leaving = false;
    try {
      const { data } = await authApi.login({ phone: phoneNumber, password });
      if (data.user.role !== "CUSTOMER") {
        show(
          "error",
          "This sign-in is for customer accounts. Please use your staff portal.",
        );
        return;
      }
      // Persist tokens so the session survives app restarts.
      await setSession({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      router.replace("/(customer)/(tabs)");
      leaving = true;
    } catch (reason) {
      // FIX 5: `as` is a cast, not a check. If the thrown value has no
      // `.message`, clearing the error would make the tap look like it did
      // nothing.
      const apiError = reason as Partial<ApiError> | undefined;
      show(
        "error",
        apiError?.code === "INVALID_CREDENTIALS"
          ? "Your details are incorrect, or your phone is not verified yet."
          : apiError?.message ||
              "Couldn't log you in. Check your connection and try again.",
      );
    } finally {
      // FIX 3 (part 2): on success, stay busy until the route swap takes this
      // screen away. Resetting here re-armed the button mid-transition.
      if (!leaving) {
        inFlight.current = false;
        setSubmitting(false);
      }
    }
  };

  // Google isn't wired up yet. A dead button is worse than an honest one, so
  // it says so instead of silently doing nothing.
  const google = () => {
    Keyboard.dismiss();
    show("info", "Google sign-in is coming soon.");
  };

  return (
    <AuthShell>
      {/* Rule 6: `root` is flex 1, the ScrollView is flex 1, and the art zone
          has a clamped height, so nothing here can collapse or overflow. */}
      <View style={styles.root}>
        <Garnish scrollY={scrollY} width={width} height={artHeight} />

        <Animated.ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          onScroll={onScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          style={styles.scroll}
        >
          <View style={[styles.art, { height: artHeight }]}>
            {/* FIX 10: alignSelf. A Pressable in a column stretches to the full
                row, so a tap on empty space beside the wordmark replaced the
                route to onboarding. This came in with the original; the hit
                area is now just the wordmark. */}
            <Pressable
              hitSlop={12}
              onPress={() => router.replace("/onboarding" as Href)}
              style={styles.brandHit}
            >
              <Text style={styles.brand}>FUFU</Text>
            </Pressable>
          </View>

          <View
            style={[styles.sheet, { paddingBottom: GUTTER + insets.bottom }]}
          >
            <FrontPiece width={width} />

            <View style={styles.copy}>
              <Text style={styles.title}>Welcome back</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>

            <View style={styles.form}>
              <Field
                label="Phone number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoComplete="tel"
                placeholder="0788 123 456"
              />
              <Field
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
                placeholder="Your password"
                returnKeyType="go"
                onSubmitEditing={login}
              />
            </View>

            {/* FIX 6: the message lives under the row, so its arrival moves
                nothing the user just touched. */}
            <View style={styles.actions}>
              <View style={styles.ctaRow}>
                <View style={styles.cta}>
                  <PrimaryButton loading={submitting} onPress={login}>
                    Log in
                  </PrimaryButton>
                </View>
                <IconButton
                  label="Continue with Google"
                  hint="Not available yet"
                  onPress={google}
                >
                  <Image
                    source={require("@/assets/images/google-g.png")}
                    contentFit="contain"
                    style={styles.googleIcon}
                  />
                </IconButton>
              </View>
              <InlineError key={message?.id} tone={message?.tone}>
                {message?.text}
              </InlineError>
            </View>

            {/* Explicit flex + floor: absorbs slack on tall screens, and keeps
                a hard 32pt between the actions and the footer on short ones. */}
            <View style={styles.spacer} />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don&apos;t have an account?</Text>
              <Pressable
                accessibilityRole="link"
                hitSlop={10}
                onPress={() => router.push("/auth/signup" as Href)}
              >
                <Text style={styles.link}>Create account</Text>
              </Pressable>
            </View>
          </View>
        </Animated.ScrollView>
      </View>
    </AuthShell>
  );
}

// FIX 8: no `fontWeight` anywhere. The font family owns the weight.
// FIX 13: the art is its own layer. The old hero was one absolutely positioned
// box whose size also set the title column's max width, coupling two unrelated
// layouts through one number; that coupling is gone.
const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: { flexGrow: 1 },
  art: { padding: GUTTER },
  brandHit: { alignSelf: "flex-start" },
  brand: {
    color: AUTH.primary,
    fontFamily: OUTFIT.extraBold,
    fontSize: 22,
    letterSpacing: 1.5,
  },
  // No `overflow: hidden` here: it would clip the iOS shadow and the chili
  // that rests on the sheet's top edge.
  sheet: {
    backgroundColor: AUTH.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    elevation: 6,
    flexGrow: 1,
    paddingHorizontal: GUTTER,
    paddingTop: 28,
    shadowColor: AUTH.text,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  copy: { gap: 6 },
  title: {
    color: AUTH.text,
    fontFamily: OUTFIT.bold,
    fontSize: 32,
    letterSpacing: -0.8,
    lineHeight: 36,
  },
  subtitle: {
    color: AUTH.muted,
    fontFamily: OUTFIT.regular,
    fontSize: 16,
    lineHeight: 22,
  },
  form: { gap: 20, marginTop: 28 },
  actions: { gap: 14, marginTop: 28 },
  ctaRow: { flexDirection: "row", gap: 12 },
  cta: { flex: 1 },
  googleIcon: { height: 24, width: 24 },
  spacer: { flexGrow: 1, minHeight: 32 },
  footer: { alignItems: "center", flexDirection: "row", gap: 6 },
  footerText: {
    color: AUTH.muted,
    fontFamily: OUTFIT.regular,
    fontSize: 15,
  },
  link: { color: AUTH.text, fontFamily: OUTFIT.extraBold, fontSize: 15 },
});