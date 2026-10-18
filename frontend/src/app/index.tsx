import { Redirect, type Href } from "expo-router";

import { DEVELOPMENT_DEFAULT_ROLE } from "@/features/auth/role";

/**
 * Temporary entry point until backend authentication supplies the session and role.
 * Frontend route selection is not authorization; the backend must enforce roles.
 */
export default function Index() {
  if (DEVELOPMENT_DEFAULT_ROLE !== "customer") {
    return null;
  }

  return <Redirect href={"/(customer)/(tabs)" as Href} />;
}
