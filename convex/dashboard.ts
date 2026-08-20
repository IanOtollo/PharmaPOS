import { query } from "./_generated/server";

function isToday(timestamp: number): boolean {
  const d = new Date(timestamp);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export const summary = query({
  args: {},
  handler: async (ctx) => {
    const sales = await ctx.db.query("sales").collect();
    const todaySales = sales.filter(
      (s) => s.status === "completed" && isToday(s._creationTime)
    );

    const revenue = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);
    const salesCount = todaySales.length;
    const itemsSold = todaySales.reduce(
      (sum, s) => sum + s.items.reduce((n, i) => n + i.quantity, 0),
      0
    );
    const avgSale = salesCount > 0 ? revenue / salesCount : 0;

    const productTotals = new Map<string, number>();
    for (const sale of todaySales) {
      for (const item of sale.items) {
        productTotals.set(
          item.productName,
          (productTotals.get(item.productName) ?? 0) + item.quantity
        );
      }
    }
    const topProducts = Array.from(productTotals.entries())
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const paymentBreakdown: Record<string, number> = {};
    for (const sale of todaySales) {
      paymentBreakdown[sale.paymentMethod] =
        (paymentBreakdown[sale.paymentMethod] ?? 0) + 1;
    }

    const products = await ctx.db.query("products").collect();
    const active = products.filter((p) => p.isActive);
    const lowStockCount = active.filter(
      (p) => p.stock > 0 && p.stock <= p.minStock
    ).length;

    const now = Date.now();
    const ninetyDays = 90 * 24 * 60 * 60 * 1000;
    const expiringSoonCount = active.filter((p) => {
      if (!p.expiryDate) return false;
      const t = new Date(p.expiryDate).getTime();
      return t >= now && t - now <= ninetyDays;
    }).length;

    const recentTransactions = sales
      .slice()
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, 5)
      .map((s) => ({
        id: s._id,
        saleNumber: s.saleNumber,
        date: s._creationTime,
        totalAmount: s.totalAmount,
        status: s.status,
      }));

    return {
      revenue,
      salesCount,
      itemsSold,
      avgSale,
      topProducts,
      paymentBreakdown,
      lowStockCount,
      expiringSoonCount,
      productCount: active.length,
      recentTransactions,
    };
  },
});
