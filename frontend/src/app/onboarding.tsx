import { Image } from "expo-image";
import { router, type Href } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
  Extrapolation,
} from "react-native-reanimated";
import { OUTFIT } from "@/theme/fonts";

const { width } = Dimensions.get("window");

const slides = [
  {
    image: require("@/assets/images/onboarding1.png"),
    title: "Your favourite food,\njust a few taps away.",
    body: "From juicy burgers and delicious pizza to crispy chicken, discover your cravings and find your next favourite meal.",
    tint: "#E95F18",
  },
  {
    image: require("@/assets/images/onboarding2.png"),
    title: "Your meal,\nwith a little extra.",
    body: "Pair your favourite burger, pizza, or crispy chicken with a refreshing juice and your preferred spice level.",
    tint: "#D6490C",
  },
  {
    image: require("@/assets/images/onboarding3.png"),
    title: "Good food,\ndelivered to your door.",
    body: "Sit back and relax while our delivery riders bring your favourite meals straight to you, fresh and ready.",
    tint: "#C23D08",
  },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function OnboardingScreen() {
  const scrollRef = useRef<Animated.ScrollView>(null);
  const scrollX = useSharedValue(0);
  const [active, setActive] = useState(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const updateActive = useCallback((index: number) => {
    setActive(index);
  }, []);

  const onMomentumEnd = useCallback(
    (event: {
      nativeEvent: { contentOffset: { x: number } };
    }) => {
      const index = Math.round(event.nativeEvent.contentOffset.x / width);
      updateActive(index);
    },
    [updateActive],
  );

  const goTo = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
    setActive(index);
  };
  const isLast = active === slides.length - 1;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <Animated.ScrollView
        ref={scrollRef}
        style={styles.carousel}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        scrollEventThrottle={16}
        onScroll={scrollHandler}
        onMomentumScrollEnd={onMomentumEnd}
      >
        {slides.map((slide, index) => (
          <Slide key={slide.title} slide={slide} index={index} scrollX={scrollX} />
        ))}
      </Animated.ScrollView>

      <View style={styles.bottomArea}>
        <View style={styles.dots}>
          {slides.map((_, index) => (
            <Dot key={index} index={index} scrollX={scrollX} onPress={() => goTo(index)} />
          ))}
        </View>

        <MorphingCta
          scrollX={scrollX}
          onPress={() =>
            isLast
              ? router.replace("/auth/login" as Href)
              : goTo(active + 1)
          }
        />
      </View>
    </SafeAreaView>
  );
}

function Slide({
  slide,
  index,
  scrollX,
}: {
  slide: (typeof slides)[number];
  index: number;
  scrollX: SharedValue<number>;
}) {
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  const imageStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      scrollX.value,
      inputRange,
      [width * 0.22, 0, -width * 0.22],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.82, 1, 0.82],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0, 1, 0],
      Extrapolation.CLAMP
    );
    return { transform: [{ translateX }, { scale }], opacity };
  });

  const textStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollX.value,
      inputRange,
      [18, 0, 18],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0, 1, 0],
      Extrapolation.CLAMP
    );
    return { transform: [{ translateY }], opacity };
  });

  return (
    <View style={styles.slide}>
      <View style={styles.artCard}>
        <Animated.View style={[styles.artWrap, imageStyle]}>
          <Image contentFit="contain" source={slide.image} style={styles.art} />
        </Animated.View>
      </View>
      <Animated.View style={textStyle}>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.body}>{slide.body}</Text>
      </Animated.View>
    </View>
  );
}

function Dot({
  index,
  scrollX,
  onPress,
}: {
  index: number;
  scrollX: SharedValue<number>;
  onPress: () => void;
}) {
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  const dotStyle = useAnimatedStyle(() => {
    const dotWidth = interpolate(
      scrollX.value,
      inputRange,
      [8, 26, 8],
      Extrapolation.CLAMP
    );
    const backgroundColor = interpolateColor(
      scrollX.value,
      inputRange,
      ["#E7D8C8", "#E95F18", "#E7D8C8"]
    );
    return { width: dotWidth, backgroundColor };
  });

  return (
    <AnimatedPressable onPress={onPress} hitSlop={10} style={[styles.dot, dotStyle]} />
  );
}

const lastIndex = slides.length - 1;
const lastRange = [
  (lastIndex - 1) * width,
  lastIndex * width,
];

function MorphingCta({
  scrollX,
  onPress,
}: {
  scrollX: SharedValue<number>;
  onPress: () => void;
}) {
  // Progress 0 -> 1 as the user scrolls from the second-to-last slide
  // into the final slide. Everything below reads off this one value,
  // the same way the dots and parallax read off scrollX directly —
  // so the CTA morphs on the same physics as the rest of the screen
  // instead of behaving like a separately-styled element.
  const containerStyle = useAnimatedStyle(() => {
    const ctaWidth = interpolate(
      scrollX.value,
      lastRange,
      [148, width - 56],
      Extrapolation.CLAMP
    );
    const radius = interpolate(
      scrollX.value,
      lastRange,
      [28, 16],
      Extrapolation.CLAMP
    );
    return { width: ctaWidth, borderRadius: radius };
  });

  const labelStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollX.value,
      [lastRange[1] - width * 0.35, lastRange[1]],
      [0, 1],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  const compactLabelStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollX.value,
      [lastRange[0], lastRange[0] + width * 0.3],
      [1, 0],
      Extrapolation.CLAMP
    );
    return { opacity, position: "absolute" as const };
  });

  const arrowStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      scrollX.value,
      lastRange,
      [0, 6],
      Extrapolation.CLAMP
    );
    return { transform: [{ translateX }] };
  });

  return (
    <View style={styles.ctaRow}>
      <AnimatedPressable
        onPress={onPress}
        style={[styles.button, containerStyle]}
      >
        <Animated.Text style={[styles.compactLabel, compactLabelStyle]}>
          Next
        </Animated.Text>
        <Animated.Text style={[styles.buttonText, labelStyle]}>
          Get started
        </Animated.Text>
        <Animated.Text style={[styles.buttonArrow, arrowStyle]}>
          →
        </Animated.Text>
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: "#FFF9F2", flex: 1 },
  carousel: { flex: 1 },
  slide: { paddingHorizontal: 28, paddingTop: 16, width },
  artCard: {
    alignItems: "center",
    height: "46%",
    justifyContent: "center",
  },
  artWrap: {
    alignItems: "center",
    height: "100%",
    justifyContent: "center",
    width: "100%",
  },
  art: { height: "100%", width: "100%" },
  title: {
    color: "#28170E",
    fontFamily: OUTFIT.semibold,
    fontSize: 30,
    letterSpacing: -0.6,
    lineHeight: 36,
    marginTop: 28,
  },
  body: {
    color: "#705B4C",
    fontFamily: OUTFIT.regular,
    fontSize: 15.5,
    letterSpacing: 0.1,
    lineHeight: 23,
    marginTop: 14,
    paddingRight: 12,
  },
  bottomArea: {
    gap: 28,
    minHeight: 132,
    paddingBottom: 8,
    paddingHorizontal: 28,
    paddingTop: 12,
  },
  dots: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
  },
  dot: { borderRadius: 4, height: 8 },
  ctaRow: { alignItems: "flex-end", width: "100%" },
  button: {
    alignItems: "center",
    backgroundColor: "#E95F18",
    flexDirection: "row",
    gap: 8,
    height: 56,
    justifyContent: "center",
  },
  compactLabel: {
    color: "#FFF9F4",
    fontFamily: OUTFIT.bold,
    fontSize: 16,
    letterSpacing: 0.1,
  },
  buttonText: {
    color: "#FFF9F4",
    fontFamily: OUTFIT.bold,
    fontSize: 16,
    letterSpacing: 0.1,
  },
  buttonArrow: {
    color: "#FFF9F4",
    fontFamily: OUTFIT.bold,
    fontSize: 16,
  },
});