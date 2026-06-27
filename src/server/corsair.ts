import "dotenv/config";
import { createCorsair } from "corsair";
import { gmail } from "@corsair-dev/gmail";
import { googlecalendar } from "@corsair-dev/googlecalendar";
import { conn } from "./db";
import { env } from "@/env";

// Verbatim from corsairdev/google-demo's src/server/corsair.ts. This is the
// one place the `corsair` package is configured — every Gmail/Calendar call
// in the app goes through `getTenant()` (server/lib/tenant.ts), which wraps
// this instance.
export const corsair = createCorsair({
  plugins: [gmail(), googlecalendar()],
  database: conn,
  kek: env.CORSAIR_KEK,
  multiTenancy: true,
});
