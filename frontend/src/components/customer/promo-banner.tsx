import { Image } from "@/components/ui/image";
import { Pressable, Text, View } from "react-native";
import type { DecimalValue } from "@/features/catalog/types";
import { formatRwf } from "@/utils/catalog";

type PromoBannerProps = {
  fallbackKey: string;
  imageUrl?: string | null;
  onPress: () => void;
  price: DecimalValue;
  subtitle?: string | null;
  title: string;
};

export function PromoBanner({
  fallbackKey,
  imageUrl,
  onPress,
  price,
  subtitle,
  title,
}: PromoBannerProps) {
  return (
    <View className="bg-[#FCE4C9] mx-5 rounded-[24px] h-[214px] overflow-hidden">
      <View className="top-[-8px] right-[-18px] bottom-[-18px] absolute w-[61%]">
        <Image
          accessibilityLabel="FUFU delivery rider"
          className="right-[-8px] bottom-[-8px] absolute w-[96%] h-[96%]"
          contentFit="contain"
          source={require("@/assets/images/scooter-man.png")}
        />
      </View>
      <View className="z-10 justify-center gap-2.5 p-5 w-[55%] h-full">
        <Text className="font-outfit-bold text-[#2B2B2B] text-[25px] leading-[29px] tracking-[-0.5px]">
          The Fastest In Food{" "}
          <Text className="text-[#EF4444]">Delivery</Text>
        </Text>

        <Pressable
          accessibilityRole="button"
          className="self-start bg-[#EF4444] active:opacity-80 mt-1 px-5 py-2.5 rounded-full active:scale-[0.97]"
          onPress={onPress}
        >
          <Text className="font-outfit-semibold text-fufu-white text-xs">
            Order Now
          </Text>
        </Pressable>
      </View>
    </View>
  );
}