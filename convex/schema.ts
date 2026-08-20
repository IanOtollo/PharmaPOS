import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  products: defineTable({
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
    isActive: v.boolean(),
  })
    .index("by_sku", ["sku"])
    .index("by_category", ["category"])
    .index("by_name", ["name"])
    .searchIndex("search_name", { searchField: "name" }),

  sales: defineTable({
    saleNumber: v.string(),
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
    vatAmount: v.number(),
    totalAmount: v.number(),
    paymentMethod: v.string(),
    mpesaRef: v.optional(v.string()),
    customerName: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    status: v.string(),
    servedBy: v.optional(v.string()),
    notes: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_saleNumber", ["saleNumber"]),

  categories: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    productCount: v.number(),
  }),

  stockAdjustments: defineTable({
    productId: v.id("products"),
    productName: v.string(),
    type: v.string(),
    quantityChange: v.number(),
    previousStock: v.number(),
    newStock: v.number(),
    reason: v.optional(v.string()),
  }),

  settings: defineTable({
    pharmacyName: v.string(),
    passcode: v.optional(v.string()),
  }),

  staff: defineTable({
    name: v.string(),
    pin: v.optional(v.string()),
  }),
});
