import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { logAudit } from "./audit";
import { generateCustomerNumber } from "./customers";

function todayPrefix(): string {
  return new Date().toISOString().slice(0, 10).replace(/-/g, "");
}

export const completeSale = mutation({
  args: {
    items: v.array(
      v.object({
        productId: v.id("products"),
        productName: v.string(),
        quantity: v.number(),
        unitPrice: v.number(),
        lineTotal: v.number(),
      })
    ),
    subtotal: v.number(),
    discountAmount: v.optional(v.number()),
    vatAmount: v.number(),
    totalAmount: v.number(),
    paymentMethod: v.string(),
    mpesaRef: v.optional(v.string()),
    amountReceived: v.optional(v.number()),
    customerName: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    servedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    for (const item of args.items) {
      const product = await ctx.db.get(item.productId);
      if (!product || product.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for ${item.productName}. Available: ${product?.stock ?? 0}`
        );
      }
    }

    const prefix = todayPrefix();
    const allSales = await ctx.db.query("sales").collect();
    const todayCount = allSales.filter((s) =>
      s.saleNumber.includes(prefix)
    ).length;
    const saleNumber = `POS-${prefix}-${String(todayCount + 1).padStart(3, "0")}`;

    for (const item of args.items) {
      const product = await ctx.db.get(item.productId);
      await ctx.db.patch(item.productId, {
        stock: product!.stock - item.quantity,
      });
    }

    const changeGiven =
      args.amountReceived !== undefined
        ? Math.max(0, args.amountReceived - args.totalAmount)
        : undefined;

    const saleId = await ctx.db.insert("sales", {
      saleNumber,
      items: args.items,
      subtotal: args.subtotal,
      discountAmount: args.discountAmount,
      vatAmount: args.vatAmount,
      totalAmount: args.totalAmount,
      paymentMethod: args.paymentMethod,
      mpesaRef: args.mpesaRef,
      amountReceived: args.amountReceived,
      changeGiven,
      customerName: args.customerName,
      customerPhone: args.customerPhone,
      servedBy: args.servedBy,
      status: "completed",
    });

    if (args.customerPhone?.trim()) {
      const phone = args.customerPhone.trim();
      const existing = await ctx.db
        .query("customers")
        .withIndex("by_phone", (q) => q.eq("phone", phone))
        .first();
      if (!existing) {
        const customerNumber = await generateCustomerNumber(ctx);
        await ctx.db.insert("customers", {
          customerNumber,
          name: args.customerName?.trim() || "Walk-in customer",
          phone,
          creditBalance: 0,
        });
      }
    }

    return { saleId, saleNumber };
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("sales").order("desc").collect();
  },
});

export const get = query({
  args: { id: v.id("sales") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const voidSale = mutation({
  args: { id: v.id("sales"), reason: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const sale = await ctx.db.get(args.id);
    if (!sale) throw new Error("Sale not found");
    if (sale.status === "voided") throw new Error("Sale already voided");

    for (const item of sale.items) {
      const product = await ctx.db.get(item.productId);
      if (product) {
        await ctx.db.patch(item.productId, {
          stock: product.stock + item.quantity,
        });
      }
    }

    await ctx.db.patch(args.id, { status: "voided", voidReason: args.reason });
    await logAudit(
      ctx,
      "sale.void",
      `Voided sale ${sale.saleNumber}${args.reason ? ` — ${args.reason}` : ""}`
    );
  },
});

export const remove = mutation({
  args: { id: v.id("sales") },
  handler: async (ctx, args) => {
    const sale = await ctx.db.get(args.id);
    if (!sale) throw new Error("Sale not found");
    await ctx.db.delete(args.id);
    await logAudit(ctx, "sale.remove", `Deleted sale ${sale.saleNumber}`);
  },
});
