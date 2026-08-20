import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { logAudit } from "./audit";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("settings").first();
    return (
      settings ?? {
        pharmacyName: "Favil Chemist & Pharmacy",
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
    await logAudit(ctx, "settings.update", "Updated pharmacy settings");
  },
});
