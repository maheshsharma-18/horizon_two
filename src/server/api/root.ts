import { calendarRouter } from "@/server/api/routers/calendar";
import { gmailRouter } from "@/server/api/routers/gmail";
import { insightsRouter } from "@/server/api/routers/insights";
import { onboardingRouter } from "@/server/api/routers/onboarding";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

export const appRouter = createTRPCRouter({
  gmail: gmailRouter,
  calendar: calendarRouter,
  insights: insightsRouter,
  onboarding: onboardingRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
