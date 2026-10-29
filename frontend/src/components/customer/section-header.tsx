import { Pressable, Text, View } from "react-native";

type SectionHeaderProps = {
  actionLabel?: string;
  onAction?: () => void;
  title: string;
};

export function SectionHeader({
  actionLabel,
  onAction,
  title,
}: SectionHeaderProps) {
  return (
    <View className="flex-row items-baseline justify-between">
      <Text
        accessibilityRole="header"
        className="font-outfit-bold text-[20px] leading-6 tracking-[-0.3px] text-fufu-ink"
      >
        {title}
      </Text>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          className="active:opacity-60"
          hitSlop={{ bottom: 14, left: 14, right: 8, top: 14 }}
          onPress={onAction}
        >
          <Text className="font-outfit-semibold text-[13px] text-fufu-ink-soft">
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}