import { SymbolView } from "expo-symbols";
import { Pressable, Text, View } from "react-native";
import { useAuthStore } from "@/features/auth/auth-store";
import { FUFU } from "@/theme/colors";
import { initials } from "@/utils/catalog";

type CustomerHeaderProps = {
  onProfile?: () => void;
  onSearch?: () => void;
};

export function CustomerHeader({ onProfile, onSearch }: CustomerHeaderProps) {
  const user = useAuthStore((state) => state.user);

  return (
    <View className="bg-fufu-bg px-5 pt-2">
      <View className="flex-row items-center justify-between">
        <View className="gap-1">
          <Text className="font-outfit-extrabold text-[22px] tracking-[1.1px] text-fufu-primary">
            FUFU
          </Text>
          <Pressable
            accessibilityLabel="Delivery location: Kigali, Rwanda"
            accessibilityRole="button"
            className="flex-row items-center gap-1 active:opacity-70"
            hitSlop={8}
          >
            <SymbolView
              name={{
                android: "location_on",
                ios: "location.fill",
                web: "location_on",
              }}
              size={15}
              tintColor={FUFU.primary}
            />
            <Text className="font-outfit text-xs text-fufu-muted">
              Delivering in <Text className="font-outfit-semibold text-fufu-ink-soft">Kigali</Text>
            </Text>
            <Text className="font-outfit-bold text-[15px] leading-[13px] text-fufu-primary">⌄</Text>
          </Pressable>
        </View>

        <View className="flex-row items-center gap-[9px]">
          {onSearch ? (
            <Pressable
              accessibilityLabel="Search menu"
              accessibilityRole="button"
              className="h-[42px] w-[42px] items-center justify-center rounded-[14px] border border-fufu-line bg-fufu-surface active:opacity-75 active:scale-95"
              hitSlop={8}
              onPress={onSearch}
            >
              <SymbolView
                name={{ android: "search", ios: "magnifyingglass", web: "search" }}
                size={21}
                tintColor={FUFU.ink}
              />
            </Pressable>
          ) : null}
          <Pressable
            accessibilityLabel="Open profile"
            accessibilityRole="button"
            className="h-[42px] w-[42px] items-center justify-center rounded-[14px] bg-fufu-ink active:opacity-75 active:scale-95"
            hitSlop={8}
            onPress={onProfile}
          >
            <Text className="font-outfit-bold text-sm text-fufu-white">
              {initials(user?.firstName, user?.lastName)}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
