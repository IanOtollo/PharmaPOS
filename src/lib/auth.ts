export const AUTH_SESSION_KEY = "pharmapos_unlocked";
export const CURRENT_STAFF_KEY = "pharmapos_current_staff";
export const CURRENT_ROLE_KEY = "pharmapos_current_role";

export type StaffRole = "manager" | "cashier" | "inventory_officer" | "supervisor";
export type Role = "admin" | StaffRole;

export const STAFF_ROLES: StaffRole[] = [
  "manager",
  "cashier",
  "inventory_officer",
  "supervisor",
];

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrator",
  manager: "Manager",
  cashier: "Cashier",
  inventory_officer: "Inventory Officer",
  supervisor: "Supervisor",
};

// Per the SRS: Manager = sales, inventory and reports.
// Cashier = processing sales and printing receipts.
// Inventory Officer = managing stock and products.
// Supervisor = monitoring transactions and staff activities.
const ROLE_PATHS: Record<StaffRole, string[]> = {
  manager: ["/pos", "/sales", "/inventory", "/reports", "/dashboard"],
  cashier: ["/pos", "/sales"],
  inventory_officer: ["/products", "/inventory", "/purchases", "/suppliers", "/dashboard"],
  supervisor: ["/dashboard", "/sales", "/reports"],
};

export function getRole(): Role {
  if (typeof window === "undefined") return "admin";
  const r = sessionStorage.getItem(CURRENT_ROLE_KEY);
  return r && (STAFF_ROLES as string[]).includes(r) ? (r as StaffRole) : "admin";
}

export function isPathAllowed(role: Role, pathname: string): boolean {
  if (role === "admin") return true;
  const allowed = ROLE_PATHS[role];
  return allowed.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export function defaultPathFor(role: Role): string {
  if (role === "admin") return "/pos";
  return ROLE_PATHS[role][0] ?? "/pos";
}
