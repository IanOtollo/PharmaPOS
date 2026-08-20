import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("categories").order("asc").collect();
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

export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const name = args.name.trim();
    if (!name) throw new Error("Category name is required");
    const existing = await ctx.db
      .query("categories")
      .collect()
      .then((all) => all.find((c) => c.name.toLowerCase() === name.toLowerCase()));
    if (existing) throw new Error(`Category "${name}" already exists`);
    return await ctx.db.insert("categories", { name, productCount: 0 });
  },
});

export const remove = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
