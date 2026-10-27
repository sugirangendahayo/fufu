import { Image } from "expo-image";
import { router, type Href } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Dimensions, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";

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
    (event: { nativeEvent: { contentOffset: { x: number } } }) => {
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
    <SafeAreaView className="flex-1 bg-[#FFF9F2]" edges={["top", "bottom"]}>
      <Animated.ScrollView
        ref={scrollRef}
        className="flex-1"
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

      <View className="min-h-[132px] gap-7 px-7 pb-2 pt-3">
        <View className="flex-row items-center justify-center gap-[7px]">
          {slides.map((_, index) => (
            <Dot key={index} index={index} scrollX={scrollX} onPress={() => goTo(index)} />
          ))}
        </View>

        <MorphingCta
          scrollX={scrollX}
          onPress={() => (isLast ? router.replace("/auth/login" as Href) : goTo(active + 1))}
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
  const imageStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(scrollX.value, inputRange, [width * 0.22, 0, -width * 0.22], Extrapolation.CLAMP),
      },
      {
        scale: interpolate(scrollX.value, inputRange, [0.82, 1, 0.82], Extrapolation.CLAMP),
      },
    ],
    opacity: interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolation.CLAMP),
  }));
  const textStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(scrollX.value, inputRange, [18, 0, 18], Extrapolation.CLAMP) },
    ],
    opacity: interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolation.CLAMP),
  }));

  return (
    <View className="px-7 pt-4" style={{ width }}>
      <View className="h-[46%] items-center justify-center">
        <Animated.View className="h-full w-full items-center justify-center" style={imageStyle}>
          <Image contentFit="contain" source={slide.image} className="h-full w-full" />
        </Animated.View>
      </View>
      <Animated.View style={textStyle}>
        <Text className="mt-7 font-outfit-semibold text-[30px] leading-9 tracking-[-0.6px] text-fufu-ink">
          {slide.title}
        </Text>
        <Text className="mt-3.5 pr-3 font-outfit text-[15.5px] leading-[23px] tracking-[0.1px] text-[#705B4C]">
          {slide.body}
        </Text>
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
  const dotStyle = useAnimatedStyle(() => ({
    width: interpolate(scrollX.value, inputRange, [8, 26, 8], Extrapolation.CLAMP),
    backgroundColor: interpolateColor(scrollX.value, inputRange, ["#E7D8C8", "#E95F18", "#E7D8C8"]),
  }));

  return <AnimatedPressable onPress={onPress} hitSlop={10} className="h-2 rounded" style={dotStyle} />;
}

const lastIndex = slides.length - 1;
const lastRange = [(lastIndex - 1) * width, lastIndex * width];

function MorphingCta({
  scrollX,
  onPress,
}: {
  scrollX: SharedValue<number>;
  onPress: () => void;
}) {
  const containerStyle = useAnimatedStyle(() => ({
    width: interpolate(scrollX.value, lastRange, [148, width - 56], Extrapolation.CLAMP),
    borderRadius: interpolate(scrollX.value, lastRange, [28, 16], Extrapolation.CLAMP),
  }));
  const labelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollX.value, [lastRange[1] - width * 0.35, lastRange[1]], [0, 1], Extrapolation.CLAMP),
  }));
  const compactLabelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollX.value, [lastRange[0], lastRange[0] + width * 0.3], [1, 0], Extrapolation.CLAMP),
    position: "absolute" as const,
  }));
  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(scrollX.value, lastRange, [0, 6], Extrapolation.CLAMP) }],
  }));

  return (
    <View className="w-full items-end">
      <AnimatedPressable onPress={onPress} className="h-14 flex-row items-center justify-center gap-2 bg-fufu-primary" style={containerStyle}>
        <Animated.Text className="font-outfit-bold text-base tracking-[0.1px] text-[#FFF9F4]" style={compactLabelStyle}>
          Next
        </Animated.Text>
        <Animated.Text className="font-outfit-bold text-base tracking-[0.1px] text-[#FFF9F4]" style={labelStyle}>
          Get started
        </Animated.Text>
        <Animated.Text className="font-outfit-bold text-base text-[#FFF9F4]" style={arrowStyle}>
          →
        </Animated.Text>
      </AnimatedPressable>
    </View>
  );
}
