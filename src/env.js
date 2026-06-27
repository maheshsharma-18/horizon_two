import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    // Corsair's key-encryption-key — encrypts OAuth tokens it stores in
    // corsair_accounts/corsair_integrations. Generate with e.g.
    // `openssl rand -base64 32`. Required by createCorsair().
    CORSAIR_KEK: z.string().min(1),
    // Which tenant's tokens/cache to use. "dev" matches the single-tenant
    // local setup from `pnpm corsair auth --plugin=gmail --tenant=dev`.
    TENANT_ID: z.string().default("dev"),
    // Powers agent chat (Sonnet) + the email priority classifier (Haiku).
    ANTHROPIC_API_KEY: z.string().optional(),
    // Corsair's MCP server URL for the agent-chat bonus feature. Not shown
    // in the reference repo's CLI — check `pnpm corsair --help` and the
    // Corsair dashboard for how to obtain this; the repo only demonstrates
    // direct tRPC calls, not MCP.
    CORSAIR_MCP_URL: z.string().optional(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },
  client: {},
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    CORSAIR_KEK: process.env.CORSAIR_KEK,
    TENANT_ID: process.env.TENANT_ID,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    CORSAIR_MCP_URL: process.env.CORSAIR_MCP_URL,
    NODE_ENV: process.env.NODE_ENV,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
