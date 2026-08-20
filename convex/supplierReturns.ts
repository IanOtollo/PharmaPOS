import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { logAudit } from "./audit";

function todayPrefix(): string {
  return new Date().toISOString().slice(0, 10).replace(/-/g, "");
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("supplierReturns").order("desc").collect();
  },
});

export const create = mutation({
  args: {
    supplierId: v.id("suppliers"),
    items: v.array(
      v.object({
        productId: v.id("products"),
        quantity: v.number(),
      })
    ),
    reason: v.string(),
    performedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const supplier = await ctx.db.get(args.supplierId);
    if (!supplier) throw new Error("Supplier not found");
    if (args.items.length === 0) throw new Error("Add at least one item");
    if (!args.reason.trim()) throw new Error("A reason is required");

    const prefix = todayPrefix();
    const all = await ctx.db.query("supplierReturns").collect();
    const todayCount = all.filter((r) => r.returnNumber.includes(prefix)).length;
    const returnNumber = `SR-${prefix}-${String(todayCount + 1).padStart(3, "0")}`;

    const items = [];
    for (const item of args.items) {
      const product = await ctx.db.get(item.productId);
      if (!product) throw new Error("Product not found");
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }
      items.push({
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
      });
      await ctx.db.patch(item.productId, { stock: product.stock - item.quantity });
    }

    await ctx.db.insert("supplierReturns", {
      returnNumber,
      supplierId: args.supplierId,
      supplierName: supplier.name,
      items,
      reason: args.reason.trim(),
      performedBy: args.performedBy,
    });

    await logAudit(
      ctx,
      "supplierReturn.create",
      `Returned goods to ${supplier.name} (${returnNumber}) — ${args.reason.trim()}`,
      args.performedBy
    );

    return { returnNumber };
  },
});

export const remove = mutation({
  args: { id: v.id("supplierReturns") },
  handler: async (ctx, args) => {
    const ret = await ctx.db.get(args.id);
    if (!ret) throw new Error("Return not found");

    for (const item of ret.items) {
      const product = await ctx.db.get(item.productId);
      if (product) {
        await ctx.db.patch(item.productId, { stock: product.stock + item.quantity });
      }
    }

    await ctx.db.delete(args.id);
    await logAudit(
      ctx,
      "supplierReturn.remove",
      `Deleted return ${ret.returnNumber} and restored its stock`
    );
  },
});
