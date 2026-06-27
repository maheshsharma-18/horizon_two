import { z } from "zod";
import { eq } from "drizzle-orm";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { underpinOnboardingProfile } from "@/server/db/schema";
import { env } from "@/env";

const workflowProfileEnum = z.enum([
  "business",
  "founder",
  "student",
  "recruiter",
  "sales",
  "developer",
  "personal",
]);

export const onboardingRouter = createTRPCRouter({
  getProfile: publicProcedure.query(async ({ ctx }) => {
    const [profile] = await ctx.db
      .select()
      .from(underpinOnboardingProfile)
      .where(eq(underpinOnboardingProfile.tenantId, env.TENANT_ID))
      .limit(1);
    return profile ?? null;
  }),

  saveProfile: publicProcedure
    .input(
      z.object({
        workflowProfile: workflowProfileEnum,
        aiDrafting: z.boolean(),
        smartPriority: z.boolean(),
        realtimeNotifications: z.boolean(),
        autonomousScheduling: z.boolean(),
        keyboardShortcuts: z.boolean(),
        mcpAgentChat: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .insert(underpinOnboardingProfile)
        .values({ tenantId: env.TENANT_ID, ...input })
        .onConflictDoUpdate({
          target: underpinOnboardingProfile.tenantId,
          set: input,
        });
      return { ok: true };
    }),

  complete: publicProcedure.mutation(async ({ ctx }) => {
    await ctx.db
      .update(underpinOnboardingProfile)
      .set({ completedAt: new Date() })
      .where(eq(underpinOnboardingProfile.tenantId, env.TENANT_ID));
    return { ok: true };
  }),
});
