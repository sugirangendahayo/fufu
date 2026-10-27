import { Pressable, StyleSheet, Text, View } from "react-native";
import { FUFU } from "@/theme/colors";

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
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          onPress={onAction}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    color: FUFU.ink,
    fontFamily: "Outfit_700Bold",
    fontSize: 20,
    letterSpacing: -0.2,
  },
  action: {
    color: FUFU.primaryDeep,
    fontFamily: "Outfit_600SemiBold",
    fontSize: 13,
  },
  pressed: {
    opacity: 0.6,
  },
});
