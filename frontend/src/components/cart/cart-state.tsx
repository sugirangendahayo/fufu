import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { CatalogImage } from "@/components/catalog/catalog-image";
import { FUFU } from "@/theme/colors";

export function CartSkeleton() {
  return (
    <View style={styles.skeletonList}>
      {[0, 1].map((item) => (
        <View key={item} style={styles.skeletonCard}>
          <View style={styles.skeletonImage} />
          <View style={styles.skeletonCopy}>
            <View style={styles.skeletonLineWide} />
            <View style={styles.skeletonLineShort} />
            <View style={styles.skeletonLinePrice} />
          </View>
        </View>
      ))}
    </View>
  );
}

type CartEmptyProps = {
  onBrowse: () => void;
};

export function CartEmpty({ onBrowse }: CartEmptyProps) {
  return (
    <Animated.View
      entering={FadeInDown.duration(420)}
      style={styles.emptyCard}
    >
      <View style={styles.emptyImage}>
        <CatalogImage
          accessibilityLabel="A selection of FUFU meals"
          fallbackKey="burger"
        />
      </View>
      <Text style={styles.emptyTitle}>Your cart is waiting.</Text>
      <Text style={styles.emptyBody}>
        Add something delicious from the menu and we&apos;ll keep it here while you
        decide.
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={onBrowse}
        style={({ pressed }) => [styles.browseButton, pressed && styles.pressed]}
      >
        <Text style={styles.browse}>Browse the menu ↗</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  skeletonList: {
    gap: 12,
  },
  skeletonCard: {
    backgroundColor: FUFU.surface,
    borderRadius: 22,
    flexDirection: "row",
    gap: 12,
    padding: 11,
  },
  skeletonImage: {
    backgroundColor: "#F4E9DF",
    borderRadius: 16,
    height: 102,
    width: 102,
  },
  skeletonCopy: {
    flex: 1,
    gap: 12,
    justifyContent: "center",
  },
  skeletonLineWide: {
    backgroundColor: "#F4E9DF",
    borderRadius: 6,
    height: 15,
    width: "76%",
  },
  skeletonLineShort: {
    backgroundColor: "#F4E9DF",
    borderRadius: 6,
    height: 11,
    width: "44%",
  },
  skeletonLinePrice: {
    backgroundColor: "#F4E9DF",
    borderRadius: 6,
    height: 13,
    width: "56%",
  },
  emptyCard: {
    alignItems: "center",
    backgroundColor: FUFU.surface,
    borderColor: FUFU.line,
    borderRadius: 26,
    borderWidth: 1,
    gap: 10,
    padding: 24,
  },
  emptyImage: {
    backgroundColor: FUFU.primarySoft,
    borderRadius: 42,
    height: 84,
    overflow: "hidden",
    width: 84,
  },
  emptyTitle: {
    color: FUFU.ink,
    fontFamily: "Outfit_700Bold",
    fontSize: 20,
    marginTop: 4,
  },
  emptyBody: {
    color: FUFU.muted,
    fontFamily: "Outfit_400Regular",
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 290,
    textAlign: "center",
  },
  browseButton: {
    marginTop: 5,
    padding: 6,
  },
  browse: {
    color: FUFU.primaryDeep,
    fontFamily: "Outfit_700Bold",
    fontSize: 14,
  },
  pressed: {
    opacity: 0.65,
    transform: [{ scale: 0.97 }],
  },
});
