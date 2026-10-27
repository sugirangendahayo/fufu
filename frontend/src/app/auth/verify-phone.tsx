import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AuthShell } from "@/components/auth/auth-shell";
import { Field, InlineError, PrimaryButton } from "@/components/auth/auth-ui";
import { ApiError, authApi } from "@/features/auth/api";
import { OUTFIT } from "@/theme/fonts";

export default function VerifyPhoneScreen() {
  const { phone: rawPhone } = useLocalSearchParams<{ phone?: string }>();
  const phone = rawPhone ?? "";
  const [code, setCode] = useState("");
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const verify = async () => {
    setError(undefined);
    if (!phone)
      return setError("Your phone number is missing. Please sign up again.");
    if (code.trim().length < 4)
      return setError("Enter the code from your SMS.");
    setSubmitting(true);
    try {
      const { data } = await authApi.verifyPhone({ phone, code: code.trim() });
      if (data.user.role !== "CUSTOMER")
        return setError("This verification is for customer accounts only.");
      router.replace("/(customer)/(tabs)");
    } catch (reason) {
      setError((reason as ApiError).message);
    } finally {
      setSubmitting(false);
    }
  };

  const resend = async () => {
    if (!phone) return;
    setError(undefined);
    setMessage(undefined);
    setResending(true);
    try {
      await authApi.resendCode({ phone, channel: "sms" });
      setMessage("A new code was requested. It can take a moment to arrive.");
    } catch (reason) {
      setError((reason as ApiError).message);
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthShell>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>
        <View style={styles.icon}>
          <Text style={styles.iconText}>✦</Text>
        </View>
        <Text style={styles.eyebrow}>ONE MORE STEP</Text>
        <Text style={styles.title}>Check your messages.</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to {phone || "your phone"}. Enter it below to
          activate your account.
        </Text>
        <View style={styles.form}>
          <Field
            label="Verification code"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="123456"
          />
          <InlineError>{error}</InlineError>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <PrimaryButton
            disabled={submitting}
            loading={submitting}
            onPress={verify}
          >
            Verify phone
          </PrimaryButton>
        </View>
        <View style={styles.resendBox}>
          <Text style={styles.resendText}>Didn&apos;t get a code?</Text>
          <Pressable disabled={resending} onPress={resend} hitSlop={10}>
            <Text style={[styles.resendLink, resending && styles.disabled]}>
              {resending ? "Requesting…" : "Send a new code"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, padding: 24 },
  back: {
    color: "#705B4C",
    fontFamily: OUTFIT.bold,
    fontSize: 16,
    fontWeight: "700",
  },
  icon: {
    alignItems: "center",
    backgroundColor: "#FFE2C8",
    borderRadius: 30,
    height: 60,
    justifyContent: "center",
    marginTop: 42,
    width: 60,
  },
  iconText: { color: "#E95F18", fontFamily: OUTFIT.extraBold, fontSize: 29 },
  eyebrow: {
    color: "#E95F18",
    fontFamily: OUTFIT.extraBold,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginTop: 27,
  },
  title: {
    color: "#28170E",
    fontFamily: OUTFIT.extraBold,
    fontSize: 31,
    fontWeight: "900",
    letterSpacing: -0.8,
    marginTop: 9,
  },
  subtitle: {
    color: "#705B4C",
    fontFamily: OUTFIT.regular,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 10,
  },
  form: { gap: 18, marginTop: 32 },
  message: {
    color: "#237A48",
    fontFamily: OUTFIT.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  resendBox: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
    marginTop: 28,
  },
  resendText: { color: "#705B4C", fontFamily: OUTFIT.regular, fontSize: 15 },
  resendLink: {
    color: "#D84E09",
    fontFamily: OUTFIT.extraBold,
    fontSize: 15,
    fontWeight: "800",
  },
  disabled: { opacity: 0.55 },
});
