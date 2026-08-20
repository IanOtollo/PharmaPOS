import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let products = await ctx.db.query("products").order("desc").collect();
    products = products.filter((p) => p.isActive);
    if (args.category && args.category !== "All") {
      products = products.filter((p) => p.category === args.category);
    }
    return products;
  },
});

export const search = query({
  args: {
    term: v.string(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.term.trim()) {
      let products = await ctx.db.query("products").order("desc").collect();
      products = products.filter((p) => p.isActive);
      if (args.category && args.category !== "All") {
        products = products.filter((p) => p.category === args.category);
      }
      return products;
    }
    let results = await ctx.db
      .query("products")
      .withSearchIndex("search_name", (q) => q.search("name", args.term))
      .collect();
    results = results.filter((p) => p.isActive);
    if (args.category && args.category !== "All") {
      results = results.filter((p) => p.category === args.category);
    }
    return results;
  },
});

export const get = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    genericName: v.optional(v.string()),
    category: v.string(),
    sku: v.string(),
    barcode: v.optional(v.string()),
    costPrice: v.number(),
    sellingPrice: v.number(),
    stock: v.number(),
    minStock: v.number(),
    unit: v.string(),
    expiryDate: v.optional(v.string()),
    batchNumber: v.optional(v.string()),
    requiresPrescription: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("products")
      .withIndex("by_sku", (q) => q.eq("sku", args.sku))
      .first();
    if (existing) {
      throw new Error(`SKU "${args.sku}" already exists`);
    }
    const id = await ctx.db.insert("products", {
      ...args,
      isActive: true,
    });
    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("products"),
    name: v.string(),
    genericName: v.optional(v.string()),
    category: v.string(),
    sku: v.string(),
    barcode: v.optional(v.string()),
    costPrice: v.number(),
    sellingPrice: v.number(),
    stock: v.number(),
    minStock: v.number(),
    unit: v.string(),
    expiryDate: v.optional(v.string()),
    batchNumber: v.optional(v.string()),
    requiresPrescription: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    const existing = await ctx.db
      .query("products")
      .withIndex("by_sku", (q) => q.eq("sku", rest.sku))
      .first();
    if (existing && existing._id !== id) {
      throw new Error(`SKU "${rest.sku}" already exists`);
    }
    await ctx.db.patch(id, rest);
  },
});

export const remove = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isActive: false });
  },
});

export const generateSku = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    const prefix = args.category.slice(0, 3).toUpperCase() || "GEN";
    const all = await ctx.db.query("products").collect();
    const count = all.filter((p) => p.sku.startsWith(prefix)).length;
    return `${prefix}-${String(count + 1).padStart(4, "0")}`;
  },
});
