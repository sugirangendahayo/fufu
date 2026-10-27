import type { PropsWithChildren } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function AuthShell({ children }: PropsWithChildren) {
  return (
    <SafeAreaView className="flex-1 bg-[#FFF9F2]" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", default: undefined })}
        className="flex-1"
      >
        <View className="flex-1">{children}</View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
