import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { FUFU } from "@/theme/colors";

// ---------------------------------------------------------------- phases
export type Phase = "pending" | "error" | "empty" | "ready";

/** One place that decides which of the four states a query is in. */
export const phaseOf = (
  query: { isError: boolean; isPending: boolean },
  count: number,
): Phase =>
  query.isPending
    ? "pending"
    : query.isError
      ? "error"
      : count > 0
        ? "ready"
        : "empty";

/**
 * pending -> skeleton, error -> message + retry, empty -> message, ready ->
 * children. Replaces the nested ternaries each section repeated. The skeleton
 * is passed in so it can match the content's shape.
 */
export function CatalogBoundary({
  children,
  emptyMessage,
  errorMessage,
  onRetry,
  phase,
  skeleton,
}: {
  children: ReactNode;
  emptyMessage: string;
  errorMessage: string;
  onRetry: () => void;
  phase: Phase;
  skeleton: ReactNode;
}) {
  if (phase === "pending") return <>{skeleton}</>;
  if (phase === "error") {
    return (
      <View className="px-5">
        <CatalogError message={errorMessage} onRetry={onRetry} />
      </View>
    );
  }
  if (phase === "empty") {
    return (
      <View className="px-5">
        <CatalogEmpty message={emptyMessage} />
      </View>
    );
  }
  return <>{children}</>;
}

// ------------------------------------------------------------- skeletons
// Each skeleton has the shape of what replaces it, so nothing jumps on load.
// They don't shimmer: a looping animation is a timer, and a still block is calmer.

export function ChipsSkeleton() {
  return (
    <View className="flex-row gap-2 px-5">
      {[88, 72, 96, 80].map((width, index) => (
        <View
          className="h-10 rounded-full bg-fufu-primary-soft"
          key={index}
          style={{ width }}
        />
      ))}
    </View>
  );
}

export function GridSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <View className="px-5">
      {Array.from({ length: rows }).map((_, row) => (
        <View className="mb-5 flex-row gap-3" key={row}>
          {[0, 1].map((column) => (
            <View className="min-w-0 flex-1" key={column}>
              <View className="aspect-square rounded-[22px] bg-fufu-primary-soft" />
              <View className="mt-3 h-3.5 w-4/5 rounded-md bg-fufu-line" />
              <View className="mt-2 h-3 w-2/5 rounded-md bg-fufu-line" />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

export function RowsSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <View className="gap-5 px-5">
      {Array.from({ length: rows }).map((_, index) => (
        <View className="flex-row items-center gap-4" key={index}>
          <View className="h-[88px] w-[88px] rounded-[20px] bg-fufu-primary-soft" />
          <View className="flex-1 gap-2">
            <View className="h-4 w-3/5 rounded-md bg-fufu-line" />
            <View className="h-3 w-4/5 rounded-md bg-fufu-line" />
            <View className="h-3 w-2/5 rounded-md bg-fufu-line" />
          </View>
        </View>
      ))}
    </View>
  );
}

/** Legacy shape (`rows` tiles side by side), restyled; new code uses the ones above. */
export function CatalogSkeleton({ rows = 1 }: { rows?: number }) {
  return (
    <View className="flex-row gap-3">
      {Array.from({ length: rows }).map((_, index) => (
        <View className="min-w-0 flex-1" key={index}>
          <View className="aspect-square rounded-[22px] bg-fufu-primary-soft" />
          <View className="mt-3 h-3.5 w-4/5 rounded-md bg-fufu-line" />
          <View className="mt-2 h-3 w-2/5 rounded-md bg-fufu-line" />
        </View>
      ))}
    </View>
  );
}

// ----------------------------------------------------------- states
export function CatalogLoading({ label = "Loading the menu…" }) {
  return (
    <View accessibilityLabel={label} className="items-center gap-2.5 py-7">
      <ActivityIndicator color={FUFU.primary} />
      <Text className="font-outfit text-sm text-fufu-muted">{label}</Text>
    </View>
  );
}

export function CatalogError({
  message = "We couldn't load this part of the menu.",
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  return (
    <View className="gap-3 rounded-[20px] bg-fufu-primary-soft p-4">
      <Text className="font-outfit-semibold text-[15px] leading-5 text-fufu-ink">
        {message}
      </Text>
      <Pressable
        accessibilityRole="button"
        className="h-10 justify-center self-start rounded-full bg-fufu-ink px-4 active:opacity-80"
        onPress={onRetry}
      >
        <Text className="font-outfit-semibold text-[13px] text-fufu-white">
          Try again
        </Text>
      </Pressable>
    </View>
  );
}

export function CatalogEmpty({
  message = "There are no items here yet.",
}: {
  message?: string;
}) {
  return (
    <Text className="py-4 font-outfit text-[14px] leading-5 text-fufu-muted">
      {message}
    </Text>
  );
}

// ------------------------------------------------------------ messages
/** Inline banner. No bottom margin of its own: the caller decides spacing. */
export function NoticeBanner({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <View
      accessibilityRole="alert"
      className="rounded-2xl bg-fufu-ink px-4 py-3"
    >
      <Text className="font-outfit-medium text-[13px] leading-[18px] text-fufu-white">
        {message}
      </Text>
    </View>
  );
}

/**
 * A message that floats above the tab bar instead of sitting in the feed. Inline,
 * it inserted ~50pt between sections the moment an add failed, shoving
 * everything below it down, and it appeared nowhere near the card that failed.
 * Here it overlays, so nothing moves. `bottom` is useTabBarInset().
 */
export function Toast({
  bottom,
  message,
}: {
  bottom: number;
  message: string | null;
}) {
  if (!message) return null;

  return (
    <Animated.View
      className="absolute inset-x-5"
      entering={FadeInDown.duration(180)}
      exiting={FadeOutDown.duration(140)}
      pointerEvents="none"
      style={{ bottom }}
    >
      <NoticeBanner message={message} />
    </Animated.View>
  );
}