import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAuthStore } from "@/features/auth/auth-store";
import { FUFU } from "@/theme/colors";
import { initials } from "@/utils/catalog";

type CustomerHeaderProps = {
  onProfile?: () => void;
  onSearch?: () => void;
};

export function CustomerHeader({
  onProfile,
  onSearch,
}: CustomerHeaderProps) {
  const user = useAuthStore((state) => state.user);

  return (
    <View style={styles.header}>
      <View style={styles.brandRow}>
        <View style={styles.locationBlock}>
          <Text style={styles.brand}>FUFU</Text>
          <Pressable
            accessibilityLabel="Delivery location: Kigali, Rwanda"
            accessibilityRole="button"
            hitSlop={8}
            style={styles.location}
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
            <Text style={styles.locationText}>
              Delivering in <Text style={styles.locationStrong}>Kigali</Text>
            </Text>
            <Text style={styles.chevron}>⌄</Text>
          </Pressable>
        </View>

        <View style={styles.actions}>
          {onSearch ? (
            <Pressable
              accessibilityLabel="Search menu"
              accessibilityRole="button"
              hitSlop={8}
              onPress={onSearch}
              style={({ pressed }) => [
                styles.iconButton,
                pressed && styles.pressed,
              ]}
            >
              <SymbolView
                name={{
                  android: "search",
                  ios: "magnifyingglass",
                  web: "search",
                }}
                size={21}
                tintColor={FUFU.ink}
              />
            </Pressable>
          ) : null}
          <Pressable
            accessibilityLabel="Open profile"
            accessibilityRole="button"
            hitSlop={8}
            onPress={onProfile}
            style={({ pressed }) => [
              styles.avatar,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.avatarText}>
              {initials(user?.firstName, user?.lastName)}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: FUFU.background,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  brandRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  locationBlock: {
    gap: 4,
  },
  brand: {
    color: FUFU.primary,
    fontFamily: "Outfit_800ExtraBold",
    fontSize: 22,
    letterSpacing: 1.1,
  },
  location: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
  },
  locationText: {
    color: FUFU.muted,
    fontFamily: "Outfit_400Regular",
    fontSize: 12,
  },
  locationStrong: {
    color: FUFU.inkSoft,
    fontFamily: "Outfit_600SemiBold",
  },
  chevron: {
    color: FUFU.primary,
    fontFamily: "Outfit_700Bold",
    fontSize: 15,
    lineHeight: 13,
  },
  actions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: FUFU.surface,
    borderColor: FUFU.line,
    borderRadius: 14,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: FUFU.ink,
    borderRadius: 14,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  avatarText: {
    color: FUFU.white,
    fontFamily: "Outfit_700Bold",
    fontSize: 14,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.96 }],
  },
});
