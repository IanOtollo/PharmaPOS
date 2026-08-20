export const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "mpesa", label: "M-Pesa" },
  { value: "card", label: "Card" },
] as const;

export const DEFAULT_CATEGORIES = [
  "Painkillers",
  "Antibiotics",
  "OTC",
  "Supplements",
  "First Aid",
  "Prescription",
];

export const UNITS = [
  "tablets",
  "bottles",
  "strips",
  "pieces",
  "tubes",
  "sachets",
  "vials",
  "boxes",
];

export const VAT_RATE = 0.16;
