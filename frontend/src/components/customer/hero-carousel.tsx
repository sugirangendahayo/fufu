import { Image } from "expo-image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, Text, useWindowDimensions, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";

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
    <View className="gap-[13px]">
      <Animated.ScrollView
        contentContainerClassName="gap-0"
        decelerationRate="fast"
        horizontal
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / cardWidth);
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
      <View className="flex-row items-center justify-between px-[3px]">
        <View className="flex-row items-center gap-1.5">
          {heroSlides.map((slide, index) => (
            <Pressable
              accessibilityLabel={`Show hero ${index + 1}`}
              accessibilityRole="button"
              className={`h-1.5 rounded-[3px] ${activeIndex === index ? "w-[22px] bg-fufu-primary" : "w-1.5 bg-[#E4D5C8]"} active:opacity-70`}
              hitSlop={8}
              key={slide.accent}
              onPress={() => goTo(index)}
            />
          ))}
        </View>
        <Text className="font-outfit-bold text-xs text-fufu-ink-soft">
          0{activeIndex + 1}{" "}
          <Text className="font-outfit text-fufu-muted">/ 0{heroSlides.length}</Text>
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
      className="relative h-[220px] overflow-hidden rounded-[28px] pl-5"
      style={{ backgroundColor: slide.background, width: cardWidth }}
    >
      <Animated.View className="z-[2] w-[58%] self-start justify-center gap-2 pt-2.5" style={copyStyle}>
        <Text className="font-outfit-bold text-[10px] tracking-[1.4px] text-fufu-primary-deep">
          {slide.accent}
        </Text>
        <Text className="font-outfit-bold text-[27px] leading-[30px] tracking-[-0.7px] text-fufu-ink">
          {slide.title}
        </Text>
        <Pressable
          accessibilityRole="button"
          className="mt-[5px] self-start flex-row items-center gap-2 rounded-xl bg-fufu-ink px-[13px] py-2.5 active:opacity-80 active:scale-[0.97]"
          onPress={onExplore}
        >
          <Text className="font-outfit-semibold text-xs text-fufu-white">Explore menu</Text>
          <Text className="font-outfit-bold text-[15px] text-fufu-butter">↗</Text>
        </Pressable>
      </Animated.View>
      <Animated.View
        className="absolute bottom-[-10px] right-[-25px] z-[1] h-[210px] w-[57%]"
        style={imageStyle}
      >
        <Image
          accessibilityLabel={slide.title.replace("\n", " ")}
          allowDownscaling
          className="h-full w-full"
          contentFit="contain"
          source={slide.image}
          transition={300}
        />
      </Animated.View>
      <View className="absolute right-[30px] top-[-70px] h-40 w-40 rounded-[100px] bg-[rgba(255,255,255,0.24)]" />
    </View>
  );
}
