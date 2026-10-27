import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { AuthShell } from "@/components/auth/auth-shell";
import { Field, InlineError, PrimaryButton } from "@/components/auth/auth-ui";
import { ApiError, authApi } from "@/features/auth/api";

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
    if (!phone) return setError("Your phone number is missing. Please sign up again.");
    if (code.trim().length < 4) return setError("Enter the code from your SMS.");
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
        contentContainerClassName="grow p-6"
        keyboardShouldPersistTaps="handled"
      >
        <Pressable className="active:opacity-70" onPress={() => router.back()} hitSlop={12}>
          <Text className="font-outfit-bold text-base text-[#705B4C]">← Back</Text>
        </Pressable>
        <View className="mt-[42px] h-[60px] w-[60px] items-center justify-center rounded-[30px] bg-[#FFE2C8]">
          <Text className="font-outfit-extrabold text-[29px] text-fufu-primary">✦</Text>
        </View>
        <Text className="mt-[27px] font-outfit-extrabold text-xs tracking-[1.2px] text-fufu-primary">
          ONE MORE STEP
        </Text>
        <Text className="mt-[9px] font-outfit-extrabold text-[31px] leading-[37px] tracking-[-0.8px] text-fufu-ink">
          Check your messages.
        </Text>
        <Text className="mt-2.5 font-outfit text-base leading-6 text-[#705B4C]">
          We sent a 6-digit code to {phone || "your phone"}. Enter it below to activate your account.
        </Text>
        <View className="mt-8 gap-[18px]">
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
          {message ? (
            <Text className="font-outfit text-sm leading-5 text-[#237A48]">{message}</Text>
          ) : null}
          <PrimaryButton disabled={submitting} loading={submitting} onPress={verify}>
            Verify phone
          </PrimaryButton>
        </View>
        <View className="mt-7 flex-row items-center justify-center gap-1">
          <Text className="font-outfit text-[15px] text-[#705B4C]">Didn&apos;t get a code?</Text>
          <Pressable disabled={resending} onPress={resend} hitSlop={10} className="active:opacity-70">
            <Text className={`font-outfit-extrabold text-[15px] text-fufu-primary-deep ${resending ? "opacity-55" : ""}`}>
              {resending ? "Requesting…" : "Send a new code"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </AuthShell>
  );
}
