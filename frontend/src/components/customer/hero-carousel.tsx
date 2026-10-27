import { Image } from "expo-image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";
import { FUFU } from "@/theme/colors";

const heroSlides = [
  {
    accent: "WEEKEND TABLE",
    background: "#F8E2B9",
    image: require("@/assets/images/Discount Burger with 45% Off Badge.png"),
    title: "A little extra\nfor your appetite.",
  },
  {
    accent: "DELIVERED WARM",
    background: "#EBDDD0",
    image: require("@/assets/images/Cheerful Pizza Delivery Rider on Yellow Scooter.png"),
    title: "Good food,\nright on time.",
  },
  {
    accent: "FUFU PICKS",
    background: "#DCE9D8",
    image: require("@/assets/images/Colorful Fast-Food Sticker Collage.png"),
    title: "Make tonight\ndelicious.",
  },
] as const;

type HeroCarouselProps = {
  onExplore: () => void;
};

export function HeroCarousel({ onExplore }: HeroCarouselProps) {
  const { width } = useWindowDimensions();
  const cardWidth = Math.max(width - 40, 280);
  const scrollX = useSharedValue(0);
  const scrollRef = useRef<Animated.ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const goTo = useCallback(
    (index: number) => {
      scrollRef.current?.scrollTo({
        animated: true,
        x: index * cardWidth,
      });
      setActiveIndex(index);
    },
    [cardWidth],
  );

  useEffect(() => {
    const timer = setInterval(() => {
      goTo((activeIndex + 1) % heroSlides.length);
    }, 5600);

    return () => clearInterval(timer);
  }, [activeIndex, goTo]);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  return (
    <View style={styles.wrapper}>
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        horizontal
        onMomentumScrollEnd={(event) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x / cardWidth,
          );
          setActiveIndex(Math.min(index, heroSlides.length - 1));
        }}
        onScroll={onScroll}
        pagingEnabled
        ref={scrollRef}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
      >
        {heroSlides.map((slide, index) => (
          <HeroSlide
            cardWidth={cardWidth}
            index={index}
            key={slide.accent}
            onExplore={onExplore}
            scrollX={scrollX}
            slide={slide}
          />
        ))}
      </Animated.ScrollView>
      <View style={styles.pagination}>
        <View style={styles.dots}>
          {heroSlides.map((slide, index) => (
            <Pressable
              accessibilityLabel={`Show hero ${index + 1}`}
              accessibilityRole="button"
              hitSlop={8}
              key={slide.accent}
              onPress={() => goTo(index)}
              style={[styles.dot, activeIndex === index && styles.activeDot]}
            />
          ))}
        </View>
        <Text style={styles.counter}>
          0{activeIndex + 1} <Text style={styles.counterMuted}>/ 0{heroSlides.length}</Text>
        </Text>
      </View>
    </View>
  );
}

function HeroSlide({
  cardWidth,
  index,
  onExplore,
  scrollX,
  slide,
}: {
  cardWidth: number;
  index: number;
  onExplore: () => void;
  scrollX: SharedValue<number>;
  slide: (typeof heroSlides)[number];
}) {
  const inputRange = [
    (index - 1) * cardWidth,
    index * cardWidth,
    (index + 1) * cardWidth,
  ];

  const imageStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          scrollX.value,
          inputRange,
          [38, 0, -38],
          Extrapolation.CLAMP,
        ),
      },
      {
        scale: interpolate(
          scrollX.value,
          inputRange,
          [0.86, 1, 0.86],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const copyStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollX.value,
      inputRange,
      [0.45, 1, 0.45],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        translateY: interpolate(
          scrollX.value,
          inputRange,
          [10, 0, 10],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  return (
    <View
      style={[
        styles.slide,
        {
          backgroundColor: slide.background,
          width: cardWidth,
        },
      ]}
    >
      <Animated.View style={[styles.copy, copyStyle]}>
        <Text style={styles.accent}>{slide.accent}</Text>
        <Text style={styles.title}>{slide.title}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={onExplore}
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
        >
          <Text style={styles.ctaText}>Explore menu</Text>
          <Text style={styles.ctaArrow}>↗</Text>
        </Pressable>
      </Animated.View>
      <Animated.View style={[styles.art, imageStyle]}>
        <Image
          accessibilityLabel={slide.title.replace("\n", " ")}
          allowDownscaling
          contentFit="contain"
          source={slide.image}
          style={styles.artImage}
          transition={300}
        />
      </Animated.View>
      <View style={styles.glow} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 13,
  },
  scrollContent: {
    gap: 0,
  },
  slide: {
    borderRadius: 28,
    height: 220,
    overflow: "hidden",
    paddingLeft: 20,
    position: "relative",
  },
  copy: {
    alignSelf: "flex-start",
    gap: 8,
    justifyContent: "center",
    paddingTop: 10,
    width: "58%",
    zIndex: 2,
  },
  accent: {
    color: FUFU.primaryDeep,
    fontFamily: "Outfit_700Bold",
    fontSize: 10,
    letterSpacing: 1.4,
  },
  title: {
    color: FUFU.ink,
    fontFamily: "Outfit_700Bold",
    fontSize: 27,
    letterSpacing: -0.7,
    lineHeight: 30,
  },
  cta: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: FUFU.ink,
    borderRadius: 12,
    flexDirection: "row",
    gap: 8,
    marginTop: 5,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  ctaPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  ctaText: {
    color: FUFU.white,
    fontFamily: "Outfit_600SemiBold",
    fontSize: 12,
  },
  ctaArrow: {
    color: FUFU.butter,
    fontFamily: "Outfit_700Bold",
    fontSize: 15,
  },
  art: {
    bottom: -10,
    height: 210,
    position: "absolute",
    right: -25,
    width: "57%",
    zIndex: 1,
  },
  artImage: {
    height: "100%",
    width: "100%",
  },
  glow: {
    backgroundColor: "rgba(255, 255, 255, 0.24)",
    borderRadius: 100,
    height: 160,
    position: "absolute",
    right: 30,
    top: -70,
    width: 160,
  },
  pagination: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 3,
  },
  dots: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    backgroundColor: "#E4D5C8",
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  activeDot: {
    backgroundColor: FUFU.primary,
    width: 22,
  },
  counter: {
    color: FUFU.inkSoft,
    fontFamily: "Outfit_700Bold",
    fontSize: 12,
  },
  counterMuted: {
    color: FUFU.muted,
    fontFamily: "Outfit_400Regular",
  },
});
