import { Image } from "expo-image";
import { router, type Href } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const slides = [
  {
    image: require("@/assets/images/Photorealistic Fast-Food Feast Collage.png"),
    eyebrow: "FUFU IS HERE",
    title: "Your favourite food, without the wait.",
    body: "Fresh meals from nearby kitchens, ready when you are.",
  },
  {
    image: require("@/assets/images/Colorful Delivery Rider on Scooter.png"),
    eyebrow: "TRACK EVERY ORDER",
    title: "From the kitchen straight to your door.",
    body: "Know exactly when your meal is being prepared and delivered.",
  },
  {
    image: require("@/assets/images/Discount Burger with 45% Off Badge.png"),
    eyebrow: "MORE TO LOVE",
    title: "Good food feels even better with a deal.",
    body: "Discover favourites, combos, and offers made for you.",
  },
];

export default function OnboardingScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const fade = useRef(new Animated.Value(1)).current;
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const next = active === slides.length - 1 ? 0 : active + 1;
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
      setActive(next);
    }, 4600);
    return () => clearInterval(timer);
  }, [active]);

  useEffect(() => {
    fade.setValue(0.76);
    Animated.timing(fade, { toValue: 1, duration: 360, useNativeDriver: true }).start();
  }, [active, fade]);

  const goTo = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
    setActive(index);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.topRow}>
        <Text style={styles.brand}>FUFU</Text>
        <Pressable onPress={() => router.replace("/auth/login" as Href)} hitSlop={12}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) =>
          setActive(Math.round(event.nativeEvent.contentOffset.x / width))
        }>
        {slides.map((slide) => (
          <View key={slide.title} style={styles.slide}>
            <Animated.View style={[styles.artCard, { opacity: fade }]}>
              <Image contentFit="contain" source={slide.image} style={styles.art} />
            </Animated.View>
            <Animated.View style={{ opacity: fade }}>
              <Text style={styles.eyebrow}>{slide.eyebrow}</Text>
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.body}>{slide.body}</Text>
            </Animated.View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.bottomArea}>
        <View style={styles.dots}>
          {slides.map((slide, index) => (
            <Pressable key={slide.title} onPress={() => goTo(index)} hitSlop={10}>
              <View style={[styles.dot, active === index && styles.dotActive]} />
            </Pressable>
          ))}
        </View>
        <Pressable
          onPress={() => router.replace("/auth/login" as Href)}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
          <Text style={styles.buttonText}>Get started</Text>
          <Text style={styles.buttonArrow}>→</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: "#FFF9F2", flex: 1 },
  topRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 24, paddingTop: 8 },
  brand: { color: "#E95F18", fontSize: 22, fontWeight: "900", letterSpacing: 1.5 },
  skip: { color: "#7D6B5D", fontSize: 15, fontWeight: "700" },
  slide: { paddingHorizontal: 24, paddingTop: 24, width },
  artCard: { alignItems: "center", backgroundColor: "#FFE2C8", borderRadius: 40, height: "51%", justifyContent: "center", overflow: "hidden" },
  art: { height: "112%", width: "112%" },
  eyebrow: { color: "#E95F18", fontSize: 12, fontWeight: "900", letterSpacing: 1.2, marginTop: 30 },
  title: { color: "#28170E", fontSize: 33, fontWeight: "900", letterSpacing: -0.8, lineHeight: 39, marginTop: 10 },
  body: { color: "#705B4C", fontSize: 16, lineHeight: 24, marginTop: 12 },
  bottomArea: { gap: 23, paddingHorizontal: 24, paddingVertical: 18 },
  dots: { alignItems: "center", flexDirection: "row", gap: 8, justifyContent: "center" },
  dot: { backgroundColor: "#E7D8C8", borderRadius: 4, height: 8, width: 8 },
  dotActive: { backgroundColor: "#E95F18", width: 26 },
  button: { alignItems: "center", backgroundColor: "#E95F18", borderRadius: 18, flexDirection: "row", justifyContent: "center", minHeight: 57 },
  buttonPressed: { opacity: 0.88, transform: [{ scale: 0.985 }] },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  buttonArrow: { color: "#FFFFFF", fontSize: 24, fontWeight: "600", marginLeft: 10 },
});
