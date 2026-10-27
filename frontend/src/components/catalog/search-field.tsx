import { SymbolView } from "expo-symbols";
import { Pressable, Text, TextInput, View } from "react-native";
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
    <View className="min-h-[54px] flex-row items-center gap-2.5 rounded-2xl border border-fufu-line bg-fufu-surface px-4">
      <SymbolView
        name={{ android: "search", ios: "magnifyingglass", web: "search" }}
        size={20}
        tintColor={FUFU.muted}
      />
      <TextInput
        accessibilityLabel="Search menu"
        autoCorrect={false}
        className="flex-1 py-1 font-outfit text-base text-fufu-ink"
        clearButtonMode="never"
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={FUFU.muted}
        returnKeyType="search"
        value={value}
      />
      {value.length > 0 ? (
        <Pressable
          accessibilityLabel="Clear search"
          accessibilityRole="button"
          className="h-7 w-7 items-center justify-center rounded-[10px] bg-fufu-primary-soft active:opacity-70"
          hitSlop={10}
          onPress={() => onChangeText("")}
        >
          <Text className="font-outfit-medium text-[22px] leading-6 text-fufu-primary-deep">
            ×
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
