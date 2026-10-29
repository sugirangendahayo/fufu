import type { ReactNode } from "react";
import Svg, { Circle, Path } from "react-native-svg";

type GlyphProps = {
  color: string;
  size?: number;
  strokeWidth?: number;
};

/**
 * The few plain UI marks the screens need (search, plus, check, close,
 * chevron), drawn on Lineicons' 24px grid with the same round caps so they sit
 * beside the tab-bar icons without a seam. They replace text glyphs (+ x v) and
 * SymbolView: a text glyph is drawn by whatever fallback font the platform
 * picks, so it can't be sized or tinted consistently, and SymbolView draws SF
 * Symbols on iOS and Material Symbols on Android. react-native-svg is already
 * in the project: it's Lineicons' peer dependency.
 */
function Glyph({ children, size = 20 }: { children: ReactNode; size?: number }) {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size}>
      {children}
    </Svg>
  );
}

export function SearchGlyph({ color, size, strokeWidth = 1.75 }: GlyphProps) {
  return (
    <Glyph size={size}>
      <Circle cx={11} cy={11} r={6.5} stroke={color} strokeWidth={strokeWidth} />
      <Path
        d="M16 16l4.5 4.5"
        stroke={color}
        strokeLinecap="round"
        strokeWidth={strokeWidth}
      />
    </Glyph>
  );
}

export function PlusGlyph({ color, size, strokeWidth = 1.75 }: GlyphProps) {
  return (
    <Glyph size={size}>
      <Path
        d="M12 5v14M5 12h14"
        stroke={color}
        strokeLinecap="round"
        strokeWidth={strokeWidth}
      />
    </Glyph>
  );
}

export function CheckGlyph({ color, size, strokeWidth = 1.75 }: GlyphProps) {
  return (
    <Glyph size={size}>
      <Path
        d="M5 12.5l4.5 4.5L19 7.5"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
    </Glyph>
  );
}

export function CloseGlyph({ color, size, strokeWidth = 1.75 }: GlyphProps) {
  return (
    <Glyph size={size}>
      <Path
        d="M6 6l12 12M18 6L6 18"
        stroke={color}
        strokeLinecap="round"
        strokeWidth={strokeWidth}
      />
    </Glyph>
  );
}

export function ChevronDownGlyph({ color, size, strokeWidth = 1.75 }: GlyphProps) {
  return (
    <Glyph size={size}>
      <Path
        d="M6 9.5l6 6 6-6"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
    </Glyph>
  );
}