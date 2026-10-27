import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { FUFU } from "@/theme/colors";

export function CatalogSkeleton({ rows = 1 }: { rows?: number }) {
  return (
    <View className="flex-row gap-3">
      {Array.from({ length: rows }).map((_, index) => (
        <View key={index} className="flex-1 gap-2.5 rounded-[20px] bg-fufu-surface p-2.5">
          <View className="h-[110px] rounded-[15px] bg-[#F4E9DF]" />
          <View className="h-3 w-4/5 rounded-[5px] bg-[#F4E9DF]" />
          <View className="h-2.5 w-[48%] rounded-[5px] bg-[#F4E9DF]" />
        </View>
      ))}
    </View>
  );
}

export function CatalogLoading({ label = "Loading the good stuff…" }) {
  return (
    <View accessibilityLabel={label} className="items-center gap-2.5 py-7">
      <ActivityIndicator color={FUFU.primary} />
      <Text className="font-outfit text-sm text-fufu-muted">{label}</Text>
    </View>
  );
}

export function CatalogError({
  message = "We couldn't load this part of the menu.",
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  return (
    <View className="gap-2 rounded-[18px] bg-fufu-primary-soft p-4">
      <Text className="font-outfit-bold text-base text-fufu-ink">A small kitchen delay</Text>
      <Text className="font-outfit text-sm leading-5 text-fufu-muted">{message}</Text>
      <Pressable
        accessibilityRole="button"
        className="mt-0.5 self-start rounded-[11px] bg-fufu-primary px-3.5 py-2.5 active:opacity-80"
        onPress={onRetry}
      >
        <Text className="font-outfit-semibold text-[13px] text-fufu-white">Try again</Text>
      </Pressable>
    </View>
  );
}

export function CatalogEmpty({
  message = "There are no items here yet.",
}: {
  message?: string;
}) {
  return (
    <View className="items-center gap-1.5 px-5 py-6">
      <Text className="font-outfit text-[25px] text-fufu-butter">✦</Text>
      <Text className="text-center font-outfit text-sm text-fufu-muted">{message}</Text>
    </View>
  );
}

export function NoticeBanner({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <View accessibilityRole="alert" className="mb-3.5 rounded-[14px] bg-fufu-ink px-3.5 py-2.5">
      <Text className="font-outfit-medium text-[13px] leading-[18px] text-fufu-white">
        {message}
      </Text>
    </View>
  );
}
