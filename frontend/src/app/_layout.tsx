import "../../global.css";

import {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/outfit";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
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

  // Restore the persisted session once on mount.
  useEffect(() => {
    void hydrate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && status !== "loading") {
      void SplashScreen.hideAsync();
    }
  }, [fontError, fontsLoaded, status]);

  // Keep the native splash visible while both fonts and session load.
  if ((!fontsLoaded && !fontError) || status === "loading") {
    return null;
  }

  // Always render the Stack — redirects happen inside index.tsx once the
  // navigator is mounted. Redirecting from here (before Stack) causes a
  // blank white screen because there is no navigator context yet.
  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="(customer)" />
        <Stack.Screen name="(staff)" />
        <Stack.Screen name="(rider)" />
        <Stack.Screen name="(admin)" />
      </Stack>
    </QueryClientProvider>
  );
}
