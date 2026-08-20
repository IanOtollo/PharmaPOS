import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("staff").order("asc").collect();
  },
});

export const create = mutation({
  args: { name: v.string(), pin: v.optional(v.string()) },
  handler: async (ctx, args) => {
    return await ctx.db.insert("staff", { name: args.name, pin: args.pin });
  },
});

export const remove = mutation({
  args: { id: v.id("staff") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
