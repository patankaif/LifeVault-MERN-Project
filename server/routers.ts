import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { sendDeletionOTP, verifyAndDeleteAccount, checkDeletionOTPStatus } from "./account-deletion.js";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  account: router({
    sendDeletionOTP: protectedProcedure.mutation(async ({ ctx }) => {
      return await sendDeletionOTP(ctx.user.id);
    }),
    
    verifyAndDelete: protectedProcedure
      .input(otp => otp)
      .mutation(async ({ ctx, input }) => {
        return await verifyAndDeleteAccount(ctx.user.id, input);
      }),
      
    checkDeletionStatus: protectedProcedure.query(async ({ ctx }) => {
      return await checkDeletionOTPStatus(ctx.user.id);
    }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
