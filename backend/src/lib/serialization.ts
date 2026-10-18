import { Prisma } from "../../generated/prisma/client";

/** Converts Prisma Decimal values at the HTTP boundary without changing service values. */
export const serialize = <T>(value: T): T =>
  JSON.parse(
    JSON.stringify(value, (_key, item) =>
      item instanceof Prisma.Decimal ? item.toString() : item,
    ),
  );
