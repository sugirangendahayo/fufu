import { router, type Href } from "expo-router";
import { useState } from "react";
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
import { SIGNUP_ART } from "@/components/auth/Garnish";
import { authApi } from "@/features/auth/api";
import { errorText, useAuthForm } from "@/features/auth/use-auth-form";

const MIN_PASSWORD = 8;

export default function SignupScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const { message, show, clear, submitting, submit } = useAuthForm();

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/auth/login" as Href);
  };

  const signup = () => {
    clear();
    const input = {
      firstName: firstName.trim(),
      lastName: lastName.trim() || undefined,
      phone: phone.trim(),
    };
    if (!input.firstName || !input.phone || !password) {
      show("error", "Please complete your name, phone number, and password.");
      return;
    }
    if (password.length < MIN_PASSWORD) {
      show("error", `Your password must have at least ${MIN_PASSWORD} characters.`);
      return;
    }

    void submit(async () => {
      Keyboard.dismiss();
      try {
        await authApi.register({ ...input, password, channel: "sms" });
        router.replace({
          pathname: "/auth/verify-phone",
          params: { phone: input.phone },
        } as unknown as Href);
        return "leaving";
      } catch (reason) {
        show(
          "error",
          errorText(
            reason,
            "Couldn't create your account. Check your connection and try again.",
          ),
        );
      }
    });
  };

  const google = () => {
    Keyboard.dismiss();
    show("info", "Google sign-up is coming soon.");
  };

  return (
    <AuthSheet
      art={SIGNUP_ART}
      topLeft={
        <Pressable
          accessibilityLabel="Back"
          accessibilityRole="button"
          className="self-start active:opacity-70"
          hitSlop={12}
          onPress={goBack}
        >
          <Text className="font-outfit-bold text-base text-[#705B4C]">← Back</Text>
        </Pressable>
      }
    >
      <Heading
        title={"Let's create\nyour account."}
        subtitle="We'll send a one-time SMS code to confirm your phone number."
      />

      <View className="mt-7 gap-5">
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Field
              label="First name"
              value={firstName}
              onChangeText={setFirstName}
              autoComplete="given-name"
              placeholder="Luc"
            />
          </View>
          <View className="flex-1">
            <Field
              label="Last name (optional)"
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
          hint={
            password.length > 0 && password.length < MIN_PASSWORD
              ? `${password.length}/${MIN_PASSWORD}`
              : undefined
          }
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
          placeholder={`At least ${MIN_PASSWORD} characters`}
          returnKeyType="go"
          onSubmitEditing={signup}
        />
      </View>

      <View className="mt-7 gap-3.5">
        <View className="flex-row gap-3">
          <View className="flex-1">
            <PrimaryButton loading={submitting} onPress={signup}>
              Create account
            </PrimaryButton>
          </View>
          <GoogleButton label="Sign up with Google" onPress={google} />
        </View>
        <InlineError key={message?.id} tone={message?.tone}>
          {message?.text}
        </InlineError>
        <Text className="font-outfit text-xs leading-[17px] text-[#705B4C]">
          By continuing, you agree to receive a one-time verification SMS. Standard carrier charges may apply.
        </Text>
      </View>

      <View className="min-h-8 flex-grow" />
      <AuthSwitch
        prompt="Already have an account?"
        action="Log in"
        onPress={() => router.replace("/auth/login" as Href)}
      />
    </AuthSheet>
  );
}
