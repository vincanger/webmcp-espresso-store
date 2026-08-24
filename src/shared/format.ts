export function formatEur(cents: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export function timeAgo(date: Date | string): string {
  const then = typeof date === "string" ? new Date(date) : date;
  const months =
    (Date.now() - then.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
  if (months < 1) return "this month";
  if (months < 12) return `${Math.round(months)} months ago`;
  const years = months / 12;
  const rounded = Math.round(years);
  if (Math.abs(years - rounded) < 0.15) {
    return rounded === 1 ? "1 year ago" : `${rounded} years ago`;
  }
  const y = Math.floor(years);
  const m = Math.round(months % 12);
  return `${y} ${y === 1 ? "year" : "years"} ${m} ${m === 1 ? "month" : "months"} ago`;
}

export const CATEGORY_LABELS: Record<string, string> = {
  MACHINE: "Machines",
  GRINDER: "Grinders",
  PORTAFILTER: "Portafilters",
  BASKET: "Baskets",
  TAMPER: "Tampers",
  PUCK_SCREEN: "Puck screens",
  DOSING_FUNNEL: "Dosing funnels",
  WDT_TOOL: "WDT tools",
  WATER_FILTER: "Water filters",
  ACCESSORY: "Accessories",
};
