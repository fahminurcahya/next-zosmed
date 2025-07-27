import { postRouter } from "@/server/api/routers/post";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { workflowRouter } from "./routers/workflow";
import { automationRouter } from "./routers/automation";
import { userRouter } from "./routers/user";
import { integrationRouter } from "./routers/integration";
import { instagramConnectRouter } from "./routers/instagram-connect";
import { subscriptionRouter } from "./routers/subscription";
import { workflowExecutionRouter } from "./routers/workflow-execution";
import { waitinglistRouter } from "./routers/waiting-list";
import { emailQueueRouter } from "./routers/email-queue";
import { discountRouter } from "./routers/discount";
import { plansRouter } from "./routers/plans";
import { billingRouter } from "./routers/billing";
import { planAdminRouter } from "./routers/plan-admin";
import { onboardingRouter } from "./routers/onboarding";
import { paymentMethodRouter } from "./routers/payment-method";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  workflow: workflowRouter,
  automation: automationRouter,
  user: userRouter,
  integration: integrationRouter,
  instagramConnect: instagramConnectRouter,
  subscription: subscriptionRouter,
  workflowExecution: workflowExecutionRouter,
  waitingList: waitinglistRouter,
  emailQueue: emailQueueRouter,
  discount: discountRouter,
  planAdmin: planAdminRouter,
  plans: plansRouter,
  billing: billingRouter,
  onboarding: onboardingRouter,
  paymentMethod: paymentMethodRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
