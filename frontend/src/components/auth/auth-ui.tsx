import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export function Field({
  label,
  ...props
}: React.ComponentProps<typeof TextInput> & { label: string }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor="#A3A3A3"
        style={styles.input}
        {...props}
      />
    </View>
  );
}

export function PrimaryButton({
  children,
  disabled,
  onPress,
}: {
  children: ReactNode;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}>
      <Text style={styles.primaryButtonText}>{children}</Text>
    </Pressable>
  );
}

export function InlineError({ children }: { children?: string }) {
  if (!children) return null;
  return <Text style={styles.error}>{children}</Text>;
}

const styles = StyleSheet.create({
  fieldGroup: { gap: 8 },
  label: { color: "#3D3026", fontSize: 14, fontWeight: "700" },
  input: {
    borderColor: "#E7D8C8",
    borderRadius: 16,
    borderWidth: 1,
    color: "#261A12",
    fontSize: 16,
    minHeight: 54,
    paddingHorizontal: 16,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#E95F18",
    borderRadius: 16,
    justifyContent: "center",
    minHeight: 56,
    shadowColor: "#E95F18",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
  },
  primaryButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  disabled: { opacity: 0.55 },
  pressed: { transform: [{ scale: 0.98 }] },
  error: { color: "#B42318", fontSize: 14, lineHeight: 20 },
});
