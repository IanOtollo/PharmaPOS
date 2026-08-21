import { mutation, query, type MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { logAudit } from "./audit";

const roleValidator = v.union(
  v.literal("manager"),
  v.literal("cashier"),
  v.literal("inventory_officer"),
  v.literal("supervisor")
);

async function assertPinAvailable(
  ctx: MutationCtx,
  pin: string | undefined,
  excludeId?: string
) {
  if (!pin) return;

  const settings = await ctx.db.query("settings").first();
  if (pin === (settings?.passcode || "1234")) {
    throw new Error("This PIN matches the admin passcode. Choose a different one.");
  }

  const all = await ctx.db.query("staff").collect();
  const clash = all.find((s) => s.pin === pin && s._id !== excludeId);
  if (clash) {
    throw new Error(`PIN already in use by "${clash.name}". Choose a different one.`);
  }
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("staff").order("asc").collect();
  },
});

export const create = mutation({
  args: { name: v.string(), pin: v.optional(v.string()), role: roleValidator },
  handler: async (ctx, args) => {
    await assertPinAvailable(ctx, args.pin);
    const id = await ctx.db.insert("staff", {
      name: args.name,
      pin: args.pin,
      role: args.role,
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
    role: roleValidator,
  },
  handler: async (ctx, args) => {
    await assertPinAvailable(ctx, args.pin, args.id);
    await ctx.db.patch(args.id, { name: args.name, pin: args.pin, role: args.role });
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
