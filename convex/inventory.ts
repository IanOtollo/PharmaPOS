import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const stockTable = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    return products.filter((p) => p.isActive);
  },
});

export const expiryAlerts = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    const now = Date.now();
    const ninetyDays = 90 * 24 * 60 * 60 * 1000;

    const withExpiry = products.filter((p) => p.isActive && p.expiryDate);
    const expiring = withExpiry.filter((p) => {
      const t = new Date(p.expiryDate!).getTime();
      return t >= now && t - now <= ninetyDays;
    });
    const expired = withExpiry.filter((p) => {
      const t = new Date(p.expiryDate!).getTime();
      return t < now;
    });

    return { expiring, expired };
  },
});

export const adjustStock = mutation({
  args: {
    productId: v.id("products"),
    type: v.string(),
    quantityChange: v.number(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Product not found");

    const newStock = product.stock + args.quantityChange;
    if (newStock < 0) throw new Error("Stock cannot go below zero");

    await ctx.db.patch(args.productId, { stock: newStock });

    await ctx.db.insert("stockAdjustments", {
      productId: args.productId,
      productName: product.name,
      type: args.type,
      quantityChange: args.quantityChange,
      previousStock: product.stock,
      newStock,
      reason: args.reason,
    });
  },
});

export const adjustmentHistory = query({
  args: { productId: v.optional(v.id("products")) },
  handler: async (ctx, args) => {
    let all = await ctx.db.query("stockAdjustments").order("desc").collect();
    if (args.productId) {
      all = all.filter((a) => a.productId === args.productId);
    }
    return all;
  },
});
