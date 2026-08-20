import { query, type MutationCtx } from "./_generated/server";

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
