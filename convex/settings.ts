import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("settings").first();
    return (
      settings ?? {
        pharmacyName: "PharmaPOS",
        passcode: "1234",
      }
    );
  },
});

export const update = mutation({
  args: {
    pharmacyName: v.string(),
    passcode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("settings").first();
    if (existing) {
      await ctx.db.patch(existing._id, args);
    } else {
      await ctx.db.insert("settings", args);
    }
  },
});
