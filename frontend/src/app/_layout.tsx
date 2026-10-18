import "../global.css";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(customer)" />
      <Stack.Screen name="(staff)" />
      <Stack.Screen name="(rider)" />
      <Stack.Screen name="(admin)" />
    </Stack>
  );
}
