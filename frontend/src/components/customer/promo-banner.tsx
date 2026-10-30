import { Pressable, Text, View } from "react-native";
import type { DecimalValue } from "@/features/catalog/types";
import { CatalogImage } from "@/components/catalog/catalog-image";
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
    <View className="mx-5 h-[214px] overflow-hidden rounded-[24px] bg-[#2C211A]">
      <View className="absolute bottom-[-18px] right-[-18px] top-[-8px] w-[61%]">
        <CatalogImage
          accessibilityLabel={title}
          className="h-full w-full"
          contentFit="contain"
          fallbackKey={fallbackKey}
          uri={imageUrl}
        />
      </View>
      <View className="z-10 w-[55%] gap-2.5 p-5">
        <Text className="font-outfit-bold text-[10px] tracking-[1.5px] text-fufu-butter">
          FUFU PICK
        </Text>
        <Text className="font-outfit-bold text-[25px] leading-[29px] tracking-[-0.5px] text-fufu-white">
          {title}
        </Text>
        {subtitle ? (
          <Text className="font-outfit text-xs leading-[17px] text-[rgba(255,255,255,0.72)]" numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
        <Text className="font-outfit-bold text-[15px] text-fufu-butter">
          {formatRwf(price)}
        </Text>
        <Pressable
          accessibilityRole="button"
          className="mt-1 self-start rounded-full bg-fufu-primary px-3.5 py-2.5 active:scale-[0.97] active:opacity-80"
          onPress={onPress}
        >
          <Text className="font-outfit-semibold text-xs text-fufu-white">View menu</Text>
        </Pressable>
      </View>
    </View>
  );
}
