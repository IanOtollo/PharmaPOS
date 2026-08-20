import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { logAudit } from "./audit";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("staff").order("asc").collect();
  },
});

export const create = mutation({
  args: { name: v.string(), pin: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("staff", { name: args.name, pin: args.pin });
    await logAudit(ctx, "staff.create", `Added staff member "${args.name}"`);
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("staff") },
  handler: async (ctx, args) => {
    const staff = await ctx.db.get(args.id);
    await ctx.db.delete(args.id);
    await logAudit(ctx, "staff.remove", `Removed staff member "${staff?.name ?? args.id}"`);
  },
});
