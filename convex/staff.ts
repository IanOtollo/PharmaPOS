import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { logAudit } from "./audit";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("staff").order("asc").collect();
  },
});

export const create = mutation({
  args: { name: v.string(), pin: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("staff", {
      name: args.name,
      pin: args.pin,
      isActive: true,
    });
    await logAudit(ctx, "staff.create", `Added staff member "${args.name}"`);
    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("staff"),
    name: v.string(),
    pin: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { name: args.name, pin: args.pin });
    await logAudit(ctx, "staff.update", `Updated staff member "${args.name}"`);
  },
});

export const setActive = mutation({
  args: { id: v.id("staff"), isActive: v.boolean() },
  handler: async (ctx, args) => {
    const staff = await ctx.db.get(args.id);
    await ctx.db.patch(args.id, { isActive: args.isActive });
    await logAudit(
      ctx,
      args.isActive ? "staff.activate" : "staff.deactivate",
      `${args.isActive ? "Activated" : "Deactivated"} staff member "${staff?.name ?? args.id}"`
    );
  },
});

export const remove = mutation({
  args: { id: v.id("staff") },
  handler: async (ctx, args) => {
    const staff = await ctx.db.get(args.id);
    await ctx.db.delete(args.id);
    await logAudit(ctx, "staff.remove", `Removed staff member "${staff?.name ?? args.id}"`);
  },
});
