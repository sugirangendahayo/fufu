import { useFocusEffect } from "expo-router";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  AppState,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";
import { ArrowRightGlyph } from "@/components/ui/glyphs";
import { FUFU } from "@/theme/colors";

export type HeroSlide = {
  /** Stable unique id (React key). */
  id: string;
  /** First line, in ink. */
  title: string;
  /** Second line, in the brand orange. */
  accent?: string;
  subtitle?: string;
  ctaLabel?: string;
  onPressCta?: () => void;
  /**
   * The illustration. It's anchored to the bottom-right and fills a box about
   * half the card wide, bleeding off the card's edge, so give it
   * `className="h-full w-full"` and `contentFit="contain"`. It is never in the
   * text's way, whatever its size.
   */
  media?: ReactNode;
};

export type HeroCarouselProps = {
  slides: HeroSlide[];
  /** Card colour. Tokens only: there are no hex props any more. */
  tone?: "peach" | "butter";
  /** "ink" by default: white on #E95F18 is 3.4:1, under AA at this size. */
  ctaTone?: "ink" | "primary";
  /** Off by default. See the note on autoplay below. */
  autoPlay?: boolean;
  autoPlayInterval?: number;
  /** Minimum card height; the card grows with large text sizes. */
  height?: number;
  /** Applied to the outer wrapper (spacing). The carousel pads itself to the screen gutter. */
  className?: string;
};

const GUTTER = 20;
const TONE = {
  peach: "bg-fufu-primary-soft",
  butter: "bg-fufu-butter-soft",
} as const;
const CTA = { ink: "bg-fufu-ink", primary: "bg-fufu-primary" } as const;

/**
 * One fixed card, moving content. The card (colour, corners) never slides: only
 * the words and the illustration do, at different speeds, so a swipe feels like
 * one object changing its message instead of two cards sliding past each other.
 *
 * Everything reads one value, `scrollX`: the slide transforms, the dots, and the
 * active index itself (derived from it, not set by hand in three places).
 *
 * Autoplay is opt-in. A timer that moves content on its own is the opposite of
 * motion caused by the user, and a promo that auto-advances fails WCAG 2.2.2
 * unless it can be paused. When on, it does the right things: it stops while
 * you drag, when the screen isn't focused, when the app is in the background,
 * and when the system asks for reduced motion.
 */
export function HeroCarousel({
  autoPlay = false,
  autoPlayInterval = 6000,
  className = "",
  ctaTone = "ink",
  height = 188,
  slides,
  tone = "peach",
}: HeroCarouselProps) {
  const { width: windowWidth } = useWindowDimensions();
  // A first guess from the window, corrected by onLayout. (The old code read
  // Dimensions once at import time, so it never followed a rotation.)
  const [pageWidth, setPageWidth] = useState(windowWidth - GUTTER * 2);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const scrollRef = useRef<Animated.ScrollView>(null);
  const scrollX = useSharedValue(0);
  const count = slides.length;

  const focused = useScreenFocused();
  const appActive = useAppActive();
  const reduceMotion = useReducedMotion();

  const goTo = useCallback(
    (index: number) => {
      const target = ((index % count) + count) % count;
      scrollRef.current?.scrollTo({ x: target * pageWidth, animated: true });
    },
    [count, pageWidth],
  );

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  // The single source of truth for "which slide": derived from the scroll
  // position, so it's right for a swipe, a dot tap and autoplay alike. (The old
  // code set it from three places, and iOS doesn't fire onMomentumScrollEnd for
  // a programmatic scroll at all.)
  useAnimatedReaction(
    () => Math.round(scrollX.value / Math.max(pageWidth, 1)),
    (index, previous) => {
      if (index !== previous) runOnJS(setActiveIndex)(index);
    },
    [pageWidth],
  );

  // If the width changes (rotation, a parent resizing), re-snap to the current
  // page. Without this the page is left sitting between two slides.
  const previousPageWidth = useRef(pageWidth);
  useEffect(() => {
    if (previousPageWidth.current === pageWidth) return;
    previousPageWidth.current = pageWidth;
    scrollRef.current?.scrollTo({
      x: activeIndex * pageWidth,
      animated: false,
    });
  }, [activeIndex, pageWidth]);

  const running =
    autoPlay &&
    count > 1 &&
    focused &&
    appActive &&
    !dragging &&
    !reduceMotion;

  // A chain of timeouts, not an interval: each one is cancelled and re-armed
  // whenever the slide changes or any pause condition flips, so there's no ref
  // flag and no stray 400ms timer to race a second touch.
  useEffect(() => {
    if (!running) return;
    const timer = setTimeout(() => goTo(activeIndex + 1), autoPlayInterval);
    return () => clearTimeout(timer);
  }, [running, activeIndex, autoPlayInterval, goTo]);

  if (count === 0) return null;

  return (
    <View className={`px-5 ${className}`}>
      <View
        className={`overflow-hidden rounded-[28px] ${TONE[tone]}`}
        onLayout={(event) =>
          setPageWidth(Math.round(event.nativeEvent.layout.width))
        }
      >
        <Animated.ScrollView
          bounces={count > 1}
          horizontal
          onScroll={onScroll}
          onScrollBeginDrag={() => setDragging(true)}
          onScrollEndDrag={() => setDragging(false)}
          pagingEnabled
          ref={scrollRef}
          scrollEnabled={count > 1}
          scrollEventThrottle={16}
          showsHorizontalScrollIndicator={false}
        >
          {slides.map((slide, index) => (
            <Slide
              calm={reduceMotion}
              ctaClass={CTA[ctaTone]}
              index={index}
              key={slide.id}
              minHeight={height}
              pageWidth={pageWidth}
              scrollX={scrollX}
              slide={slide}
            />
          ))}
        </Animated.ScrollView>
      </View>

      {count > 1 ? (
        <Dots
          activeIndex={activeIndex}
          count={count}
          goTo={goTo}
          pageWidth={pageWidth}
          scrollX={scrollX}
        />
      ) : null}
    </View>
  );
}

export default HeroCarousel;

function Slide({
  calm,
  ctaClass,
  index,
  minHeight,
  pageWidth,
  scrollX,
  slide,
}: {
  calm: boolean;
  ctaClass: string;
  index: number;
  minHeight: number;
  pageWidth: number;
  scrollX: SharedValue<number>;
  slide: HeroSlide;
}) {
  // Guard: the first frame can report a width of 0, and an input range of
  // identical values is invalid.
  const w = Math.max(pageWidth, 1);

  // This slide's neighbours, in scroll offsets: one page before, at rest, one after.
  const pages = [(index - 1) * w, index * w, (index + 1) * w];

  // Words fade out within 60% of a page and drift a little faster than the page
  // (leaving) / slower (arriving); the illustration does the opposite and fades
  // within 80%. Two speeds, one value: that's all the depth there is. With
  // reduced motion on, they only fade.
  const copyStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollX.value,
      [(index - 0.6) * w, index * w, (index + 0.6) * w],
      [0, 1, 0],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        translateX: calm
          ? 0
          : interpolate(scrollX.value, pages, [28, 0, -28], Extrapolation.CLAMP),
      },
    ],
  }));

  const mediaStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollX.value,
      [(index - 0.8) * w, index * w, (index + 0.8) * w],
      [0, 1, 0],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        translateX: calm
          ? 0
          : interpolate(scrollX.value, pages, [-40, 0, 40], Extrapolation.CLAMP),
      },
      {
        scale: calm
          ? 1
          : interpolate(scrollX.value, pages, [0.9, 1, 0.9], Extrapolation.CLAMP),
      },
    ],
  }));

  return (
    <View className="justify-center" style={{ minHeight, width: pageWidth }}>
      <Animated.View className="gap-1.5 py-5 pl-5 w-[58%]" style={copyStyle}>
        <Text className="font-outfit-bold text-[24px] text-fufu-ink leading-[28px] tracking-[-0.5px]">
          {slide.title}
          {slide.accent ? (
            <>
              {"\n"}
              <Text className="text-fufu-primary">{slide.accent}</Text>
            </>
          ) : null}
        </Text>

        {slide.subtitle ? (
          <Text className="font-outfit text-[13px] text-fufu-muted leading-[18px]">
            {slide.subtitle}
          </Text>
        ) : null}

        {/* The Pressable owns size, radius and background; the Text only sets type. */}
        {slide.ctaLabel ? (
          <Pressable
            accessibilityRole="button"
            className={`mt-1.5 h-10 flex-row items-center gap-1.5 self-start rounded-full pl-4 pr-3.5 active:scale-[0.97] active:opacity-80 ${ctaClass}`}
            onPress={slide.onPressCta}
          >
            <Text className="font-outfit-semibold text-[13px] text-fufu-white">
              {slide.ctaLabel}
            </Text>
            <ArrowRightGlyph color={FUFU.white} size={16} strokeWidth={2} />
          </Pressable>
        ) : null}
      </Animated.View>

      {/* Anchored, not in the row: a big illustration can't squeeze the headline,
          and the card's rounded edge crops it, so it reads larger than its box. */}
      {slide.media ? (
        <Animated.View
          className="top-3 right-[-12px] bottom-[-10px] absolute justify-center items-center w-[50%]"
          pointerEvents="none"
          style={mediaStyle}
        >
          {slide.media}
        </Animated.View>
      ) : null}
    </View>
  );
}

/**
 * Dots that follow the finger: each one's width and opacity come from its
 * distance to the scroll position, so they stretch as you drag instead of
 * jumping when the slide settles. (The old Dot played withTiming off a boolean.)
 * For screen readers the whole row is one adjustable control ("2 of 3"), so
 * swiping up or down changes slide.
 */
function Dots({
  activeIndex,
  count,
  goTo,
  pageWidth,
  scrollX,
}: {
  activeIndex: number;
  count: number;
  goTo: (index: number) => void;
  pageWidth: number;
  scrollX: SharedValue<number>;
}) {
  return (
    <View
      accessible
      accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
      accessibilityLabel="Promotions"
      accessibilityRole="adjustable"
      accessibilityValue={{ text: `${activeIndex + 1} of ${count}` }}
      className="flex-row justify-center items-center mt-3"
      onAccessibilityAction={(event) =>
        goTo(
          activeIndex + (event.nativeEvent.actionName === "increment" ? 1 : -1),
        )
      }
    >
      {Array.from({ length: count }, (_, index) => (
        <Dot
          index={index}
          key={index}
          onPress={() => goTo(index)}
          pageWidth={pageWidth}
          scrollX={scrollX}
        />
      ))}
    </View>
  );
}

function Dot({
  index,
  onPress,
  pageWidth,
  scrollX,
}: {
  index: number;
  onPress: () => void;
  pageWidth: number;
  scrollX: SharedValue<number>;
}) {
  const w = Math.max(pageWidth, 1);
  const style = useAnimatedStyle(() => {
    const near = 1 - Math.min(Math.abs(scrollX.value / w - index), 1);
    return { opacity: 0.25 + 0.75 * near, width: 6 + 14 * near };
  });

  return (
    // 24pt tall plus a 12pt slop top and bottom: the old 6pt dot was ~22pt to hit.
    <Pressable
      className="justify-center items-center px-[3px] h-6"
      hitSlop={{ bottom: 12, left: 6, right: 6, top: 12 }}
      onPress={onPress}
    >
      <Animated.View className="bg-fufu-ink rounded-full h-1.5" style={style} />
    </Pressable>
  );
}

// ------------------------------------------------------- autoplay conditions
// Tab screens stay mounted, so "this component exists" doesn't mean "the user
// can see it". These two say whether they can.

function useScreenFocused() {
  const [focused, setFocused] = useState(true);
  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );
  return focused;
}

function useAppActive() {
  const [active, setActive] = useState(AppState.currentState === "active");
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) =>
      setActive(state === "active"),
    );
    return () => subscription.remove();
  }, []);
  return active;
}