import { Pressable, Text, TextInput, View } from "react-native";
import { CloseGlyph, SearchGlyph } from "@/components/ui/glyphs";
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
    <View className="h-[52px] flex-row items-center gap-3 rounded-2xl border border-fufu-line bg-fufu-surface px-4">
      <SearchGlyph color={FUFU.muted} size={20} />
      <TextInput
        accessibilityLabel="Search menu"
        autoCorrect={false}
        className="h-full flex-1 py-0 font-outfit text-[15px] text-fufu-ink"
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
          className="h-6 w-6 items-center justify-center rounded-full bg-fufu-primary-soft active:opacity-70"
          hitSlop={12}
          onPress={() => onChangeText("")}
        >
          <CloseGlyph color={FUFU.ink} size={14} strokeWidth={2} />
        </Pressable>
      ) : null}
    </View>
  );
}

/**
 * Looks like the field but is a button: on Home, search lives on the Menu tab,
 * so a real input here would put the keyboard on the wrong screen. `hint` is
 * built from real category names by the caller, so the placeholder never
 * promises food the menu doesn't have.
 */
export function SearchEntry({
  hint = "Search the menu",
  onPress,
}: {
  hint?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel="Search the menu"
      accessibilityRole="search"
      className="h-[52px] flex-row items-center gap-3 rounded-2xl border border-fufu-line bg-fufu-surface px-4 active:opacity-80"
      onPress={onPress}
    >
      <SearchGlyph color={FUFU.muted} size={20} />
      <Text numberOfLines={1} className="flex-1 font-outfit text-[15px] text-fufu-muted">
        {hint}
      </Text>
    </Pressable>
  );
}