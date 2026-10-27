import type { ReactNode } from "react";
import { useWindowDimensions, View } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthShell } from "@/components/auth/auth-shell";
import { FrontPiece, Garnish, type Art } from "@/components/auth/Garnish";

export const GUTTER = 24;

export function AuthSheet({
  art,
  topLeft,
  children,
}: {
  art: Art;
  topLeft: ReactNode;
  children: ReactNode;
}) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });
  const artHeight = Math.round(
    Math.min(Math.max(height * art.ratio, art.min), art.max),
  );

  return (
    <AuthShell>
      <View className="flex-1">
        <Garnish art={art} scrollY={scrollY} width={width} height={artHeight} />
        <Animated.ScrollView
          alwaysBounceVertical={false}
          contentContainerClassName="grow"
          keyboardShouldPersistTaps="handled"
          onScroll={onScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          className="flex-1"
        >
          <View className="p-6" style={{ height: artHeight }}>
            {topLeft}
          </View>
          <View
            className="grow rounded-t-[28px] bg-white px-6 pt-7 shadow-2xl"
            style={{ paddingBottom: GUTTER + insets.bottom }}
          >
            {art.front ? <FrontPiece front={art.front} width={width} /> : null}
            {children}
          </View>
        </Animated.ScrollView>
      </View>
    </AuthShell>
  );
}
