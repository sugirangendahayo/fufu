import { router, type Href } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
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

export default function SignupScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const signup = async () => {
    setError(undefined);
    if (!firstName.trim() || !phone.trim() || !password)
      return setError("Please complete your name, phone number, and password.");
    if (password.length < 8)
      return setError("Your password must have at least 8 characters.");
    setSubmitting(true);
    try {
      await authApi.register({
        firstName,
        lastName: lastName || undefined,
        phone,
        password,
        channel: "sms",
      });
      // The generated Expo Router types are refreshed on the next Expo start.
      // Keep the parameter typed until then so this route is usable immediately.
      router.replace({
        pathname: "/auth/verify-phone",
        params: { phone },
      } as unknown as Href);
    } catch (reason) {
      setError((reason as ApiError).message);
    } finally {
      setSubmitting(false);
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
        <Text style={styles.eyebrow}>JOIN FUFU</Text>
        <Text style={styles.title}>Let&apos;s create your account.</Text>
        <Text style={styles.subtitle}>
          We&apos;ll send a one-time SMS code to confirm your phone number.
        </Text>
        <View style={styles.form}>
          <View style={styles.nameRow}>
            <View style={styles.nameField}>
              <Field
                label="First name"
                value={firstName}
                onChangeText={setFirstName}
                autoComplete="given-name"
                placeholder="Luc"
              />
            </View>
            <View style={styles.nameField}>
              <Field
                label="Last name"
                value={lastName}
                onChangeText={setLastName}
                autoComplete="family-name"
                placeholder="Hirwa"
              />
            </View>
          </View>
          <Field
            label="Phone number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            autoComplete="tel"
            placeholder="0788 123 456"
          />
          <Field
            label="Create password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="new-password"
            placeholder="At least 8 characters"
          />
          <InlineError>{error}</InlineError>
          <PrimaryButton disabled={submitting} onPress={signup}>
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              "Create account"
            )}
          </PrimaryButton>
          <Text style={styles.note}>
            By continuing, you agree to receive a one-time verification SMS.
            Standard carrier charges may apply.
          </Text>
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Pressable
            onPress={() => router.replace("/auth/login" as Href)}
            hitSlop={10}
          >
            <Text style={styles.link}>Log in</Text>
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
  eyebrow: {
    color: "#E95F18",
    fontFamily: OUTFIT.extraBold,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginTop: 42,
  },
  title: {
    color: "#28170E",
    fontFamily: OUTFIT.extraBold,
    fontSize: 31,
    fontWeight: "900",
    letterSpacing: -0.8,
    lineHeight: 39,
    marginTop: 9,
  },
  subtitle: {
    color: "#705B4C",
    fontFamily: OUTFIT.regular,
    fontSize: 16,
    lineHeight: 23,
    marginTop: 10,
  },
  form: { gap: 18, marginTop: 30 },
  nameRow: { flexDirection: "row", gap: 12 },
  nameField: { flex: 1 },
  note: {
    color: "#8B7768",
    fontFamily: OUTFIT.regular,
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
  },
  footer: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
    marginTop: "auto",
    paddingTop: 28,
  },
  footerText: { color: "#705B4C", fontFamily: OUTFIT.regular, fontSize: 15 },
  link: {
    color: "#D84E09",
    fontFamily: OUTFIT.extraBold,
    fontSize: 15,
    fontWeight: "800",
  },
});
