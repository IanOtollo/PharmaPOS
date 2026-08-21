import { query } from "./_generated/server";
import { v } from "convex/values";
import { eatDateKey } from "./time";

export const summary = query({
  args: { rangeDays: v.number() },
  handler: async (ctx, args) => {
    const allSales = await ctx.db.query("sales").collect();
    const cutoff = args.rangeDays > 0 ? Date.now() - args.rangeDays * 24 * 60 * 60 * 1000 : 0;
    const sales = allSales.filter(
      (s) => s.status === "completed" && s._creationTime >= cutoff
    );

    const dailyMap = new Map<string, number>();
    for (const s of sales) {
      const day = eatDateKey(s._creationTime);
      dailyMap.set(day, (dailyMap.get(day) ?? 0) + s.totalAmount);
    }
    const daily = Array.from(dailyMap.entries())
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalSales = sales.length;
    const totalItems = sales.reduce(
      (sum, s) => sum + s.items.reduce((n, i) => n + i.quantity, 0),
      0
    );
    const avgSale = totalSales > 0 ? totalRevenue / totalSales : 0;

    const paymentBreakdown: Record<string, number> = {};
    for (const s of sales) {
      paymentBreakdown[s.paymentMethod] =
        (paymentBreakdown[s.paymentMethod] ?? 0) + s.totalAmount;
    }

    const productTotals = new Map<
      string,
      { name: string; quantity: number; revenue: number }
    >();
    const staffTotals = new Map<string, { name: string; revenue: number; sales: number }>();
    const categoryTotals = new Map<string, number>();
    let totalCost = 0;

    const productCache = new Map<string, { category: string; costPrice: number } | null>();
    async function getProduct(id: (typeof sales)[number]["items"][number]["productId"]) {
      const key = String(id);
      if (!productCache.has(key)) {
        const p = await ctx.db.get(id);
        productCache.set(key, p ? { category: p.category, costPrice: p.costPrice } : null);
      }
      return productCache.get(key)!;
    }

    for (const s of sales) {
      const staffKey = s.servedBy?.trim() || "Unassigned";
      const staffCur = staffTotals.get(staffKey) ?? { name: staffKey, revenue: 0, sales: 0 };
      staffCur.revenue += s.totalAmount;
      staffCur.sales += 1;
      staffTotals.set(staffKey, staffCur);

      for (const item of s.items) {
        const cur = productTotals.get(item.productName) ?? {
          name: item.productName,
          quantity: 0,
          revenue: 0,
        };
        cur.quantity += item.quantity;
        cur.revenue += item.lineTotal;
        productTotals.set(item.productName, cur);

        const product = await getProduct(item.productId);
        const category = product?.category ?? "Other";
        categoryTotals.set(category, (categoryTotals.get(category) ?? 0) + item.lineTotal);
        if (product) {
          totalCost += product.costPrice * item.quantity;
        }
      }
    }

    const topProducts = Array.from(productTotals.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const categoryBreakdown = Array.from(categoryTotals.entries())
      .map(([category, revenue]) => ({ category, revenue }))
      .sort((a, b) => b.revenue - a.revenue);

    const staffPerformance = Array.from(staffTotals.values()).sort(
      (a, b) => b.revenue - a.revenue
    );

    const customerTotals = new Map<
      string,
      { name: string; phone: string; revenue: number; visits: number }
    >();
    for (const s of sales) {
      if (!s.customerPhone) continue;
      const cur = customerTotals.get(s.customerPhone) ?? {
        name: s.customerName || "Walk-in customer",
        phone: s.customerPhone,
        revenue: 0,
        visits: 0,
      };
      cur.revenue += s.totalAmount;
      cur.visits += 1;
      customerTotals.set(s.customerPhone, cur);
    }
    const topCustomers = Array.from(customerTotals.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const totalSubtotal = sales.reduce((s, x) => s + x.subtotal, 0);
    const grossProfit = totalSubtotal - totalCost;
    const marginPercent = totalSubtotal > 0 ? (grossProfit / totalSubtotal) * 100 : 0;

    const transactions = sales
      .slice()
      .sort((a, b) => b._creationTime - a._creationTime)
      .map((s) => ({
        id: s._id,
        saleNumber: s.saleNumber,
        date: s._creationTime,
        itemCount: s.items.reduce((n, i) => n + i.quantity, 0),
        paymentMethod: s.paymentMethod,
        servedBy: s.servedBy ?? null,
        totalAmount: s.totalAmount,
      }));

    return {
      daily,
      totalRevenue,
      totalSales,
      totalItems,
      avgSale,
      paymentBreakdown,
      topProducts,
      categoryBreakdown,
      staffPerformance,
      topCustomers,
      grossProfit,
      marginPercent,
      transactions,
    };
  },
});

export const inventoryValuation = query({
  args: {},
  handler: async (ctx) => {
    const products = (await ctx.db.query("products").collect()).filter((p) => p.isActive);
    const costValue = products.reduce((s, p) => s + p.costPrice * p.stock, 0);
    const retailValue = products.reduce((s, p) => s + p.sellingPrice * p.stock, 0);
    return { costValue, retailValue, productCount: products.length };
  },
});

export const supplierReport = query({
  args: { rangeDays: v.number() },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("purchases").collect();
    const cutoff = args.rangeDays > 0 ? Date.now() - args.rangeDays * 24 * 60 * 60 * 1000 : 0;
    const purchases = all.filter((p) => p._creationTime >= cutoff);

    const totals = new Map<string, { name: string; totalCost: number; orders: number }>();
    for (const p of purchases) {
      const cur = totals.get(p.supplierName) ?? {
        name: p.supplierName,
        totalCost: 0,
        orders: 0,
      };
      cur.totalCost += p.totalCost;
      cur.orders += 1;
      totals.set(p.supplierName, cur);
    }

    return Array.from(totals.values()).sort((a, b) => b.totalCost - a.totalCost);
  },
});
