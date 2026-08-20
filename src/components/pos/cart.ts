import { Id } from "../../../convex/_generated/dataModel";

export type CartLine = {
  productId: Id<"products">;
  productName: string;
  unitPrice: number;
  quantity: number;
  stock: number;
};
