import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("categories").collect();
  },
});

export const ensure = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("categories")
      .collect()
      .then((all) => all.find((c) => c.name === args.name));
    if (existing) return existing._id;
    return await ctx.db.insert("categories", {
      name: args.name,
      productCount: 0,
    });
  },
});
