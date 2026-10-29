import { cssInterop } from "nativewind";
import { Image as ExpoImage } from "expo-image";

/**
 * Expo Image is a native component rather than a core React Native primitive.
 * Registering the interop once makes NativeWind className dimensions work on
 * iOS, Android, and web instead of rendering a zero-sized image.
 */
export const Image = cssInterop(ExpoImage, { className: "style" });
