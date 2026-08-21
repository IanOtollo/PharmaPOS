// Convex functions run in UTC. This pharmacy operates in Kenya (EAT, UTC+3),
// so "today" must be computed in EAT rather than the server's UTC day —
// otherwise the app's day boundary lags up to 3 hours behind the real one
// every midnight-to-3am EAT window.
const EAT_OFFSET_MS = 3 * 60 * 60 * 1000;

export function eatDateKey(timestamp: number): string {
  return new Date(timestamp + EAT_OFFSET_MS).toISOString().slice(0, 10);
}

export function isSameEatDay(timestamp: number, reference: number = Date.now()): boolean {
  return eatDateKey(timestamp) === eatDateKey(reference);
}
