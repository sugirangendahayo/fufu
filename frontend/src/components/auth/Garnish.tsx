import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";

/**
 * Scattered ingredient art for the auth screens: transparent PNGs in
 * assets/images/auth/, drawn with the light from the top-left and the shadow
 * baked toward the bottom-right.
 *
 * To use real photos instead, overwrite a PNG with a transparent-background
 * cut-out of the same name (keep the light and shadow direction) and, if its
 * aspect ratio changed, update `aspect` below.
 *
 *   x, w    fractions of the window width
 *   y       fraction of the art zone's height
 *   follow  how much of the scroll the piece follows. 0 = pinned to the
 *           screen, 1 = moves with the sheet. The sheet is opaque and always
 *           rises faster than a piece, so it covers pieces as it goes, and a
 *           lower `follow` reads as further away.
 */
type Piece = {
  source: number;
  x: number;
  y: number;
  w: number;
  aspect: number;
  follow: number;
};

const BACK: Piece[] = [
  {
    source: require("@/assets/images/scallion.png"),
    x: 0.31,
    y: 0,
    w: 0.3026,
    aspect: 0.6657,
    follow: 0.18,
  },
  {
    source: require("@/assets/images/chili-b.png"),
    x: 0.575,
    y: 0.12,
    w: 0.1487,
    aspect: 0.3932,
    follow: 0.32,
  },
  {
    source: require("@/assets/images/chili-a.png"),
    x: 0.815,
    y: 0.02,
    w: 0.1744,
    aspect: 0.4204,
    follow: 0.45,
  },
  {
    source: require("@/assets/images/ring-a.png"),
    x: 0.455,
    y: 0.6,
    w: 0.1128,
    aspect: 1,
    follow: 0.5,
  },
  {
    source: require("@/assets/images/ring-b.png"),
    x: 0.9,
    y: 0.58,
    w: 0.0821,
    aspect: 1,
    follow: 0.55,
  },
  {
    source: require("@/assets/images/pepper.png"),
    x: 0.66,
    y: 0.7,
    w: 0.1282,
    aspect: 1.2346,
    follow: 0.6,
  },
  {
    source: require("@/assets/images/lemon.png"),
    x: 0.15,
    y: 0.7,
    w: 0.2256,
    aspect: 1,
    follow: 0.28,
  },
];

// Rests on the sheet's top edge and moves 1:1 with it, so it never needs
// animating: its depth comes from the pieces behind it lagging.
const FRONT = {
  source: require("@/assets/images/chili-c.png"),
  aspect: 2.6256,
  w: 0.3282,
  right: -0.025,
  top: -0.56,
};

function BackPiece({
  piece,
  scrollY,
  width,
  height,
}: {
  piece: Piece;
  scrollY: SharedValue<number>;
  width: number;
  height: number;
}) {
  const w = piece.w * width;
  const h = w / piece.aspect;
  // Clamped at 0 so pulling down past the top doesn't drag the art with it.
  const parallax = useAnimatedStyle(() => ({
    transform: [{ translateY: -Math.max(scrollY.value, 0) * piece.follow }],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          height: h,
          left: piece.x * width,
          position: "absolute",
          top: piece.y * height,
          width: w,
        },
        parallax,
      ]}
    >
      <Image
        source={piece.source}
        contentFit="contain"
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

/** Everything that sits BEHIND the sheet. Every piece reads the one scrollY. */
export function Garnish({
  scrollY,
  width,
  height,
}: {
  scrollY: SharedValue<number>;
  width: number;
  height: number;
}) {
  return (
    <View pointerEvents="none" style={[styles.layer, { height, width }]}>
      {BACK.map((piece, index) => (
        <BackPiece
          key={index}
          piece={piece}
          scrollY={scrollY}
          width={width}
          height={height}
        />
      ))}
    </View>
  );
}

/** Render as the first child of the sheet; it overlaps the sheet's top edge. */
export function FrontPiece({ width }: { width: number }) {
  const w = FRONT.w * width;
  const h = w / FRONT.aspect;
  return (
    <View
      pointerEvents="none"
      style={{
        height: h,
        position: "absolute",
        right: FRONT.right * width,
        top: FRONT.top * h,
        width: w,
      }}
    >
      <Image
        source={FRONT.source}
        contentFit="contain"
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  layer: { left: 0, position: "absolute", top: 0 },
});