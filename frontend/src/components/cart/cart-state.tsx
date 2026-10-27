import { Pressable, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { CatalogImage } from "@/components/catalog/catalog-image";

export function CartSkeleton() {
  return (
    <View className="gap-3">
      {[0, 1].map((item) => (
        <View key={item} className="flex-row gap-3 rounded-[22px] bg-fufu-surface p-[11px]">
          <View className="h-[102px] w-[102px] rounded-2xl bg-[#F4E9DF]" />
          <View className="flex-1 justify-center gap-3">
            <View className="h-[15px] w-[76%] rounded-md bg-[#F4E9DF]" />
            <View className="h-[11px] w-[44%] rounded-md bg-[#F4E9DF]" />
            <View className="h-[13px] w-[56%] rounded-md bg-[#F4E9DF]" />
          </View>
        </View>
      ))}
    </View>
  );
}

type CartEmptyProps = {
  onBrowse: () => void;
};

export function CartEmpty({ onBrowse }: CartEmptyProps) {
  return (
    <Animated.View
      entering={FadeInDown.duration(420)}
      className="items-center gap-2.5 rounded-[26px] border border-fufu-line bg-fufu-surface p-6"
    >
      <View className="h-[84px] w-[84px] overflow-hidden rounded-[42px] bg-fufu-primary-soft">
        <CatalogImage
          accessibilityLabel="A selection of FUFU meals"
          className="h-full w-full"
          fallbackKey="burger"
        />
      </View>
      <Text className="mt-1 font-outfit-bold text-xl text-fufu-ink">Your cart is waiting.</Text>
      <Text className="max-w-[290px] text-center font-outfit text-sm leading-[21px] text-fufu-muted">
        Add something delicious from the menu and we&apos;ll keep it here while you decide.
      </Text>
      <Pressable
        accessibilityRole="button"
        className="mt-1 rounded-lg p-1.5 active:opacity-65 active:scale-[0.97]"
        onPress={onBrowse}
      >
        <Text className="font-outfit-bold text-sm text-fufu-primary-deep">Browse the menu ↗</Text>
      </Pressable>
    </Animated.View>
  );
}
