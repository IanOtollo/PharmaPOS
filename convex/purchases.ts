import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { logAudit } from "./audit";

function todayPrefix(): string {
  return new Date().toISOString().slice(0, 10).replace(/-/g, "");
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("purchases").order("desc").collect();
  },
});

export const create = mutation({
  args: {
    supplierId: v.id("suppliers"),
    items: v.array(
      v.object({
        productId: v.id("products"),
        quantity: v.number(),
        buyingPrice: v.number(),
      })
    ),
    referenceNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const supplier = await ctx.db.get(args.supplierId);
    if (!supplier) throw new Error("Supplier not found");
    if (args.items.length === 0) throw new Error("Add at least one item");

    const prefix = todayPrefix();
    const allPurchases = await ctx.db.query("purchases").collect();
    const todayCount = allPurchases.filter((p) => p.purchaseNumber.includes(prefix)).length;
    const purchaseNumber = `PO-${prefix}-${String(todayCount + 1).padStart(3, "0")}`;

    let totalCost = 0;
    const items = [];
    for (const item of args.items) {
      const product = await ctx.db.get(item.productId);
      if (!product) throw new Error("Product not found");
      const lineTotal = item.quantity * item.buyingPrice;
      totalCost += lineTotal;
      items.push({
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        buyingPrice: item.buyingPrice,
        lineTotal,
      });
      await ctx.db.patch(item.productId, {
        stock: product.stock + item.quantity,
        costPrice: item.buyingPrice,
      });
    }

    const id = await ctx.db.insert("purchases", {
      purchaseNumber,
      supplierId: args.supplierId,
      supplierName: supplier.name,
      items,
      totalCost,
      referenceNumber: args.referenceNumber,
    });

    await logAudit(
      ctx,
      "purchase.create",
      `Recorded purchase ${purchaseNumber} from ${supplier.name}`
    );

    return { id, purchaseNumber };
  },
});

export const remove = mutation({
  args: { id: v.id("purchases") },
  handler: async (ctx, args) => {
    const purchase = await ctx.db.get(args.id);
    if (!purchase) throw new Error("Purchase not found");

    for (const item of purchase.items) {
      const product = await ctx.db.get(item.productId);
      if (product) {
        await ctx.db.patch(item.productId, {
          stock: Math.max(0, product.stock - item.quantity),
        });
      }
    }

    await ctx.db.delete(args.id);
    await logAudit(
      ctx,
      "purchase.remove",
      `Deleted purchase ${purchase.purchaseNumber} and reversed its stock`
    );
  },
});
