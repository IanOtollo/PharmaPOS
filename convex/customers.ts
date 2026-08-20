import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("customers").order("desc").collect();
  },
});

export const search = query({
  args: { term: v.string() },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("customers").order("desc").collect();
    if (!args.term.trim()) return all;
    const t = args.term.trim().toLowerCase();
    return all.filter(
      (c) => c.name.toLowerCase().includes(t) || (c.phone ?? "").includes(t)
    );
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("customers", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("customers"),
    name: v.string(),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    await ctx.db.patch(id, rest);
  },
});

export const remove = mutation({
  args: { id: v.id("customers") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const purchaseHistory = query({
  args: { phone: v.string() },
  handler: async (ctx, args) => {
    const sales = await ctx.db.query("sales").order("desc").collect();
    return sales.filter((s) => s.customerPhone === args.phone);
  },
});
