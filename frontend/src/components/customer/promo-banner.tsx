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
    <View className="bg-[#2C211A] mx-5 rounded-[24px] h-[214px] overflow-hidden">
      <View className="top-[-8px] right-[-18px] bottom-[-18px] absolute w-[61%]">
        <Image
          accessibilityLabel="FUFU delivery rider"
          className="h-full w-full"
          contentFit="contain"
          source={require("@/assets/images/scooter-man.png")}
        />
      </View>
      <View className="z-10 gap-2.5 p-5 w-[55%]">
        <Text className="font-outfit-bold text-[10px] text-fufu-butter tracking-[1.5px]">
          FUFU PICK
        </Text>
        <Text className="font-outfit-bold text-[25px] text-fufu-white leading-[29px] tracking-[-0.5px]">
          {title}
        </Text>
        {subtitle ? (
          <Text className="font-outfit text-[rgba(255,255,255,0.72)] text-xs leading-[17px]" numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
        <Text className="font-outfit-bold text-[15px] text-fufu-butter">
          {formatRwf(price)}
        </Text>
        <Pressable
          accessibilityRole="button"
          className="self-start bg-fufu-primary active:opacity-80 mt-1 px-3.5 py-2.5 rounded-full active:scale-[0.97]"
          onPress={onPress}
        >
          <Text className="font-outfit-semibold text-fufu-white text-xs">View menu</Text>
        </Pressable>
      </View>
    </View>
  );
}
