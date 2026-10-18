import { Stack } from "expo-router";

/** Layout boundary for future administrative routes. */
export default function AdminLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
