import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { FUFU } from "@/theme/colors";

type SearchFieldProps = {
  onChangeText: (value: string) => void;
  placeholder?: string;
  value: string;
};

export function SearchField({
  onChangeText,
  placeholder = "Search the menu",
  value,
}: SearchFieldProps) {
  return (
    <View style={styles.field}>
      <SymbolView
        name={{ android: "search", ios: "magnifyingglass", web: "search" }}
        size={20}
        tintColor={FUFU.muted}
      />
      <TextInput
        accessibilityLabel="Search menu"
        autoCorrect={false}
        clearButtonMode="never"
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={FUFU.muted}
        returnKeyType="search"
        style={styles.input}
        value={value}
      />
      {value.length > 0 ? (
        <Pressable
          accessibilityLabel="Clear search"
          accessibilityRole="button"
          hitSlop={10}
          onPress={() => onChangeText("")}
          style={styles.clear}
        >
          <Text style={styles.clearText}>×</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    alignItems: "center",
    backgroundColor: FUFU.surface,
    borderColor: FUFU.line,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 54,
    paddingHorizontal: 16,
  },
  input: {
    color: FUFU.ink,
    flex: 1,
    fontFamily: "Outfit_400Regular",
    fontSize: 16,
    paddingVertical: 4,
  },
  clear: {
    alignItems: "center",
    backgroundColor: FUFU.primarySoft,
    borderRadius: 10,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  clearText: {
    color: FUFU.primaryDeep,
    fontFamily: "Outfit_500Medium",
    fontSize: 22,
    lineHeight: 24,
  },
});
