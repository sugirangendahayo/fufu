import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ScreenPlaceholderProps = {
  title: string;
  description: string;
};

/** Shared presentation for the temporary staff/admin placeholders. */
export function ScreenPlaceholder({
  title,
  description,
}: ScreenPlaceholderProps) {
  return (
    <SafeAreaView className="flex-1 bg-fufu-bg" edges={["top"]}>
      <View className="flex-1 justify-center p-6">
        <Text className="mb-3 font-outfit-bold text-[32px] text-fufu-ink">{title}</Text>
        <Text className="font-outfit text-[17px] leading-[26px] text-fufu-ink-soft">{description}</Text>
      </View>
    </SafeAreaView>
  );
}
