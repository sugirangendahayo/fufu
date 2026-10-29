import { Image } from "@/components/ui/image";
import { useState } from "react";
import { isUsableImageUrl } from "@/utils/catalog";

const fallbackImages = {
  burger: require("@/assets/images/Discount Burger with 45% Off Badge.png"),
  chicken: require("@/assets/images/Tasty & Fresh Burger Badge.png"),
  pizza: require("@/assets/images/Photorealistic Fast-Food Feast Collage.png"),
  snacks: require("@/assets/images/Colorful Fast-Food Sticker Collage.png"),
  general: require("@/assets/images/Photorealistic Fast-Food Feast Collage.png"),
} as const;

function fallbackFor(key = "") {
  const normalized = key.toLowerCase();

  if (/(burger|beef|wrap)/.test(normalized)) return fallbackImages.burger;
  if (/(chicken|wing|tender)/.test(normalized)) return fallbackImages.chicken;
  if (/(pizza|cheese|dessert|brownie|cake|ice-cream)/.test(normalized)) {
    return fallbackImages.pizza;
  }
  if (/(snack|side|fries|ring|drink|cola|lemonade)/.test(normalized)) {
    return fallbackImages.snacks;
  }

  return fallbackImages.general;
}

type CatalogImageProps = {
  accessibilityLabel?: string;
  className?: string;
  contentFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  fallbackKey?: string;
  uri?: string | null;
};

export function CatalogImage({
  accessibilityLabel,
  className = "h-full w-full",
  contentFit = "contain",
  fallbackKey,
  uri,
}: CatalogImageProps) {
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const remoteUri =
    isUsableImageUrl(uri) && failedUri !== uri ? uri : undefined;

  return (
    <Image
      accessibilityLabel={accessibilityLabel}
      cachePolicy="disk"
      className={className}
      contentFit={contentFit}
      onError={remoteUri ? () => setFailedUri(uri ?? null) : undefined}
      recyclingKey={remoteUri ?? fallbackKey}
      source={remoteUri ?? fallbackFor(fallbackKey)}
      transition={180}
    />
  );
}
