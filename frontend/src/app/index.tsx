import { Redirect, type Href } from "expo-router";
import { useAuthStore } from "@/features/auth/auth-store";

/**
 * Entry point — runs after the root Stack is mounted, so navigation context
 * is guaranteed to exist before any redirect fires.
 *
 *  authenticated  → customer home (session restored from SecureStore)
 *  unauthenticated → onboarding / login
 */
export default function Index() {
  const status = useAuthStore((s) => s.status);

  if (status === "authenticated") {
    return <Redirect href={"/(customer)/(tabs)" as Href} />;
  }

  return <Redirect href={"/onboarding" as Href} />;
}
