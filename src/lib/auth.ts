export const AUTH_SESSION_KEY = "pharmapos_unlocked";
export const CURRENT_STAFF_KEY = "pharmapos_current_staff";

export type Role = "admin" | "staff";

const STAFF_ALLOWED_PATHS = ["/pos", "/sales"];
export const STAFF_DEFAULT_PATH = "/pos";

export function getRole(): Role {
  if (typeof window === "undefined") return "admin";
  return sessionStorage.getItem(CURRENT_STAFF_KEY) ? "staff" : "admin";
}

export function isPathAllowed(role: Role, pathname: string): boolean {
  if (role === "admin") return true;
  return STAFF_ALLOWED_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}
