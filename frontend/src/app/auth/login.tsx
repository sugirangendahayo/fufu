import { Image } from "expo-image";
import { router, type Href } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { AuthShell } from "@/components/auth/auth-shell";
import { Field, InlineError, PrimaryButton } from "@/components/auth/auth-ui";
import { ApiError, authApi } from "@/features/auth/api";

export default function LoginScreen() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const login = async () => {
    setError(undefined);
    if (!phone.trim() || !password) return setError("Enter your phone number and password.");
    setSubmitting(true);
    try {
      const { data } = await authApi.login({ phone, password });
      if (data.user.role !== "CUSTOMER") {
        setError("This sign-in is for customer accounts. Please use your staff portal.");
        return;
      }
      router.replace("/(customer)/(tabs)");
    } catch (reason) {
      const apiError = reason as ApiError;
      setError(apiError.code === "INVALID_CREDENTIALS" ? "Your details are incorrect, or your phone is not verified yet." : apiError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => router.replace("/onboarding" as Href)} hitSlop={12}>
          <Text style={styles.brand}>FUFU</Text>
        </Pressable>
        <Image source={require("@/assets/images/Tasty & Fresh Burger Badge.png")} contentFit="contain" style={styles.image} />
        <View style={styles.copy}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Good food is just a few taps away.</Text>
        </View>
        <View style={styles.form}>
          <Field label="Phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" autoComplete="tel" placeholder="0788 123 456" />
          <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="password" placeholder="Your password" />
          <InlineError>{error}</InlineError>
          <PrimaryButton disabled={submitting} onPress={login}>
            {submitting ? <ActivityIndicator color="#FFFFFF" /> : "Log in"}
          </PrimaryButton>
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don&apos;t have an account?</Text>
          <Pressable onPress={() => router.push("/auth/signup" as Href)} hitSlop={10}>
            <Text style={styles.link}>Create account</Text>
          </Pressable>
        </View>
      </ScrollView>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, padding: 24 },
  brand: { color: "#E95F18", fontSize: 22, fontWeight: "900", letterSpacing: 1.5 },
  image: { alignSelf: "center", height: 168, marginBottom: -12, marginTop: 4, width: 190 },
  copy: { gap: 7 },
  title: { color: "#28170E", fontSize: 32, fontWeight: "900", letterSpacing: -0.8 },
  subtitle: { color: "#705B4C", fontSize: 16 },
  form: { gap: 18, marginTop: 34 },
  footer: { alignItems: "center", flexDirection: "row", gap: 5, justifyContent: "center", marginTop: "auto", paddingTop: 30 },
  footerText: { color: "#705B4C", fontSize: 15 },
  link: { color: "#D84E09", fontSize: 15, fontWeight: "800" },
});
