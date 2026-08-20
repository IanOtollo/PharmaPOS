import { mutation, query, type MutationCtx } from "./_generated/server";
import { v } from "convex/values";

export async function logAudit(
  ctx: MutationCtx,
  action: string,
  description: string,
  performedBy?: string
) {
  await ctx.db.insert("auditLogs", { action, description, performedBy });
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("auditLogs").order("desc").take(100);
  },
});

export const logLogin = mutation({
  args: { performedBy: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await logAudit(
      ctx,
      "auth.login",
      args.performedBy ? `${args.performedBy} logged in` : "Admin logged in",
      args.performedBy
    );
  },
});
