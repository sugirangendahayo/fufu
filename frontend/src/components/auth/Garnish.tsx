import { Image } from "@/components/ui/image";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";

/**
 * Scattered ingredient art for the auth screens: transparent PNGs in
 * assets/images/, drawn with the light from the top-left and the shadow
 * baked toward the bottom-right.
 *
 * To use real photos instead, overwrite a PNG with a transparent-background
 * cut-out of the same name (keep the light and shadow direction) and, if its
 * aspect ratio changed, update `aspect` below.
 *
 * Each screen gets its own composition (an `Art`), so login and signup feel
 * like siblings, not clones.
 *
 *   x, w    fractions of the window width (w is then multiplied by `scale`)
 *   y       fraction of the art zone's height
 *   follow  how much of the scroll the piece follows. 0 = pinned to the
 *           screen, 1 = moves with the sheet. The sheet is opaque and always
 *           rises faster than a piece, so it covers pieces as it goes, and a
 *           lower `follow` reads as further away.
 */
export type Piece = {
  source: number;
  x: number;
  y: number;
  w: number;
  aspect: number;
  follow: number;
};

/** Rests on the sheet's top edge and moves 1:1 with it. */
export type Front = {
  source: number;
  aspect: number;
  w: number;
  right: number;
  top: number;
};

export type Art = {
  /** Art zone height as a share of the window height, clamped to [min, max]. */
  ratio: number;
  min: number;
  max: number;
  /** Multiplies every back piece's width. */
  scale: number;
  back: Piece[];
  front?: Front;
};

export const LOGIN_ART: Art = {
  ratio: 0.34,
  min: 230,
  max: 330,
  scale: 1,
  back: [
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
  ],
  front: {
    source: require("@/assets/images/chili-c.png"),
    aspect: 2.6256,
    w: 0.3282,
    right: -0.025,
    top: -0.56,
  },
};

export const SIGNUP_ART: Art = {
  ratio: 0.2,
  min: 150,
  max: 220,
  scale: 0.78,
  back: [
    {
      source: require("@/assets/images/scallion.png"),
      x: 0.5,
      y: 0,
      w: 0.3026,
      aspect: 0.6657,
      follow: 0.18,
    },
    {
      source: require("@/assets/images/chili-b.png"),
      x: 0.625,
      y: 0.2,
      w: 0.1487,
      aspect: 0.3932,
      follow: 0.32,
    },
    {
      source: require("@/assets/images/chili-a.png"),
      x: 0.775,
      y: 0.03,
      w: 0.1744,
      aspect: 0.4204,
      follow: 0.45,
    },
    {
      source: require("@/assets/images/lemon.png"),
      x: 0.83,
      y: 0.64,
      w: 0.2256,
      aspect: 1,
      follow: 0.28,
    },
    {
      source: require("@/assets/images/ring-a.png"),
      x: 0.545,
      y: 0.68,
      w: 0.1128,
      aspect: 1,
      follow: 0.5,
    },
    {
      source: require("@/assets/images/pepper.png"),
      x: 0.45,
      y: 0.72,
      w: 0.1282,
      aspect: 1.2346,
      follow: 0.6,
    },
  ],
};

function BackPiece({
  piece,
  scale,
  scrollY,
  width,
  height,
}: {
  piece: Piece;
  scale: number;
  scrollY: SharedValue<number>;
  width: number;
  height: number;
}) {
  const w = piece.w * width * scale;
  const h = w / piece.aspect;
  // Clamped at 0 so pulling down past the top doesn't drag the art with it.
  const parallax = useAnimatedStyle(() => ({
    transform: [{ translateY: -Math.max(scrollY.value, 0) * piece.follow }],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      className="absolute"
      style={[
        {
          height: h,
          left: piece.x * width,
          top: piece.y * height,
          width: w,
        },
        parallax,
      ]}
    >
      <Image
        source={piece.source}
        contentFit="contain"
        className="absolute inset-0"
      />
    </Animated.View>
  );
}

/** Everything that sits BEHIND the sheet. Every piece reads the one scrollY. */
export function Garnish({
  art,
  scrollY,
  width,
  height,
}: {
  art: Art;
  scrollY: SharedValue<number>;
  width: number;
  height: number;
}) {
  return (
    <View pointerEvents="none" className="absolute left-0 top-0" style={{ height, width }}>
      {art.back.map((piece, index) => (
        <BackPiece
          key={index}
          piece={piece}
          scale={art.scale}
          scrollY={scrollY}
          width={width}
          height={height}
        />
      ))}
    </View>
  );
}

/** Render as the first child of the sheet; it overlaps the sheet's top edge. */
export function FrontPiece({ front, width }: { front: Front; width: number }) {
  const w = front.w * width;
  const h = w / front.aspect;
  return (
    <View
      pointerEvents="none"
      className="absolute"
      style={{
        height: h,
        right: front.right * width,
        top: front.top * h,
        width: w,
      }}
    >
      <Image
        source={front.source}
        contentFit="contain"
        className="absolute inset-0"
      />
    </View>
  );
}
