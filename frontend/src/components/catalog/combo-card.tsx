import { Pressable, StyleSheet, Text, View } from "react-native";
import { FUFU } from "@/theme/colors";
import type { CatalogCombo } from "@/features/catalog/types";
import { formatRwf } from "@/utils/catalog";
import { CatalogImage } from "./catalog-image";

type ComboCardProps = {
  combo: CatalogCombo;
  onPress?: (combo: CatalogCombo) => void;
};

export function ComboCard({ combo, onPress }: ComboCardProps) {
  return (
    <Pressable
      accessibilityLabel={`${combo.name} combo`}
      accessibilityRole={onPress ? "button" : undefined}
      disabled={!onPress}
      onPress={() => onPress?.(combo)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.imageWrap}>
        <CatalogImage
          accessibilityLabel={combo.name}
          fallbackKey={combo.slug}
          uri={combo.imageUrl}
        />
      </View>
      <View style={styles.copy}>
        <Text style={styles.kicker}>FUFU COMBO</Text>
        <Text numberOfLines={1} style={styles.name}>
          {combo.name}
        </Text>
        {combo.description ? (
          <Text numberOfLines={2} style={styles.description}>
            {combo.description}
          </Text>
        ) : null}
        <Text style={styles.price}>{formatRwf(combo.price)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: FUFU.ink,
    borderRadius: 24,
    flexDirection: "row",
    minHeight: 170,
    overflow: "hidden",
    width: 300,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  imageWrap: {
    alignSelf: "stretch",
    backgroundColor: "#442A1D",
    width: 126,
  },
  copy: {
    flex: 1,
    gap: 6,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 17,
  },
  kicker: {
    color: FUFU.butter,
    fontFamily: "Outfit_700Bold",
    fontSize: 10,
    letterSpacing: 1.1,
  },
  name: {
    color: FUFU.white,
    fontFamily: "Outfit_700Bold",
    fontSize: 20,
  },
  description: {
    color: "rgba(255, 255, 255, 0.70)",
    fontFamily: "Outfit_400Regular",
    fontSize: 12,
    lineHeight: 17,
  },
  price: {
    color: FUFU.white,
    fontFamily: "Outfit_700Bold",
    fontSize: 15,
    marginTop: 3,
  },
});
