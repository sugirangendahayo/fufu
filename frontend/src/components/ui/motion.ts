import { Easing } from "react-native-reanimated";

/**
 * One timing for every state change in the customer app (a chip filling, the
 * add button turning into a check). The same 140ms ease-out the auth screens and
 * the tab bar use, so the whole app moves at one speed.
 */
export const TIMING = { duration: 140, easing: Easing.out(Easing.cubic) } as const;