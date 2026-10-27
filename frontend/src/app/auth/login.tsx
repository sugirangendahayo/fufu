import { router, type Href } from "expo-router";
import { useMemo, useState } from "react";
import { Keyboard, Pressable, Text, View } from "react-native";
import { AuthSheet } from "@/components/auth/auth-sheet";
import {
  AuthSwitch,
  Field,
  GoogleButton,
  Heading,
  InlineError,
  PrimaryButton,
} from "@/components/auth/auth-ui";
import { LOGIN_ART } from "@/components/auth/Garnish";
import { authApi } from "@/features/auth/api";
import { useAuthStore } from "@/features/auth/auth-store";
import { asApiError, errorText, useAuthForm } from "@/features/auth/use-auth-form";

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
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const { message, show, clear, submitting, submit } = useAuthForm();
  const subtitle = useMemo(() => mealLine(), []);
  const { setSession } = useAuthStore();

  const login = () => {
    clear();
    const phoneNumber = phone.trim();
    if (!phoneNumber || !password) {
      show("error", "Enter your phone number and password.");
      return;
    }

    void submit(async () => {
      Keyboard.dismiss();
      try {
        const { data } = await authApi.login({ phone: phoneNumber, password });
        if (data.user.role !== "CUSTOMER") {
          show(
            "error",
            "This sign-in is for customer accounts. Please use your staff portal.",
          );
          return;
        }
        await setSession({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });
        router.replace("/(customer)/(tabs)");
        return "leaving";
      } catch (reason) {
        show(
          "error",
          asApiError(reason)?.code === "INVALID_CREDENTIALS"
            ? "Your details are incorrect, or your phone is not verified yet."
            : errorText(
                reason,
                "Couldn't log you in. Check your connection and try again.",
              ),
        );
      }
    });
  };

  const google = () => {
    Keyboard.dismiss();
    show("info", "Google sign-in is coming soon.");
  };

  return (
    <AuthSheet
      art={LOGIN_ART}
      topLeft={
        <Pressable
          className="self-start active:opacity-70"
          hitSlop={12}
          onPress={() => router.replace("/onboarding" as Href)}
        >
          <Text className="font-outfit-extrabold text-[22px] tracking-[1.5px] text-fufu-primary">FUFU</Text>
        </Pressable>
      }
    >
      <Heading title="Welcome back" subtitle={subtitle} />

      <View className="mt-7 gap-5">
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

      <View className="mt-7 gap-3.5">
        <View className="flex-row gap-3">
          <View className="flex-1">
            <PrimaryButton loading={submitting} onPress={login}>
              Log in
            </PrimaryButton>
          </View>
          <GoogleButton label="Continue with Google" onPress={google} />
        </View>
        <InlineError key={message?.id} tone={message?.tone}>
          {message?.text}
        </InlineError>
      </View>

      <View className="min-h-8 flex-grow" />
      <AuthSwitch
        prompt="Don't have an account?"
        action="Create account"
        onPress={() => router.push("/auth/signup" as Href)}
      />
    </AuthSheet>
  );
}
