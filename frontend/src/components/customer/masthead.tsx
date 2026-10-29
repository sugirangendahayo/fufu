import { Image } from "expo-image";
import { Text, View } from "react-native";

// The same ingredients as the login screens (assets/images/auth), so the app
// opens and signs in with one visual voice.
const art = {
  chili: require("@/assets/images/chili-a.png"),
  lemon: require("@/assets/images/lemon.png"),
  pepper: require("@/assets/images/pepper.png"),
};

function hello(now = new Date()) {
  const hour = now.getHours();
  if (hour < 5) return "Hey";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/**
 * One small line, one big question, and the only decoration on the screen.
 * (The old greeting was an all-caps eyebrow, a headline and a subtitle: three
 * text layers saying one thing.) The art is anchored to the right edge so it
 * follows the screen width, and the text column is capped at 62% so the two
 * can't collide. Static: it scrolls away with the page.
 */
export function Masthead({ name }: { name?: string }) {
  const greeting = hello();

  return (
    <View className="min-h-[148px] px-5 pt-3">
      <View className="max-w-[62%] gap-1">
        <Text
          className="font-outfit text-[15px] leading-5 text-fufu-muted"
          numberOfLines={1}
        >
          {name ? `${greeting}, ${name}` : greeting}
        </Text>
        <Text
          accessibilityRole="header"
          className="font-outfit-bold text-[32px] leading-[36px] tracking-[-0.8px] text-fufu-ink"
        >
          {"What are you\ncraving?"}
        </Text>
      </View>

      <View
        accessibilityElementsHidden
        className="absolute inset-0"
        importantForAccessibility="no-hide-descendants"
        pointerEvents="none"
      >
        <Image
          className="absolute right-10 top-[9px] h-[138px] w-[58px]"
          contentFit="contain"
          source={art.chili}
        />
        <Image
          className="absolute right-2.5 top-[77px] h-16 w-16"
          contentFit="contain"
          source={art.lemon}
        />
        <Image
          className="absolute right-[84px] top-[105px] h-[31px] w-[38px]"
          contentFit="contain"
          source={art.pepper}
        />
      </View>
    </View>
  );
}