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
    <View className="flex-row items-center justify-between">
      <Text className="font-outfit-bold text-xl tracking-[-0.2px] text-fufu-ink">
        {title}
      </Text>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          className="active:opacity-60"
          hitSlop={8}
          onPress={onAction}
        >
          <Text className="font-outfit-semibold text-[13px] text-fufu-primary-deep">
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
