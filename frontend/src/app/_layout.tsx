import "../../global.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/outfit";

import { Redirect, Stack, type Href } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { OUTFIT } from "@/theme/fonts";
import { useAuthStore } from "@/features/auth/auth-store";

void SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    [OUTFIT.regular]:   Outfit_400Regular,
    [OUTFIT.medium]:    Outfit_500Medium,
    [OUTFIT.semibold]:  Outfit_600SemiBold,
    [OUTFIT.bold]:      Outfit_700Bold,
    [OUTFIT.extraBold]: Outfit_800ExtraBold,
  });

  const { status, hydrate } = useAuthStore();

  // Restore session from SecureStore on first mount.
  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if ((fontsLoaded || fontError) && status !== "loading") {
      void SplashScreen.hideAsync();
    }
  }, [fontError, fontsLoaded, status]);

  // Keep the splash visible while fonts and session are both loading.
  if ((!fontsLoaded && !fontError) || status === "loading") {
    return null;
  }

  // Already authenticated → go straight to the customer area.
  // The customer layout will handle role-based routing if needed later.
  const navigation =
    status === "authenticated" ? (
      <Redirect href={"/(customer)/(tabs)" as Href} />
    ) : (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="(customer)" />
        <Stack.Screen name="(staff)" />
        <Stack.Screen name="(rider)" />
        <Stack.Screen name="(admin)" />
      </Stack>
    );

  return (
    <QueryClientProvider client={queryClient}>{navigation}</QueryClientProvider>
  );
}
