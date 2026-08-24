// Pure compatibility rules engine (R0–R6). No Wasp/Prisma imports — unit-testable.

export type CompatStatus =
  | "COMPATIBLE"
  | "INCOMPATIBLE"
  | "UNKNOWN"
  | "NOT_APPLICABLE";

export type CompatResult = {
  status: CompatStatus;
  reason: string;
  fixSlug?: string;
};

// Minimal product shape the engine needs. Prisma's Product satisfies this.
export type CompatProduct = {
  slug: string;
  name: string;
  brand: string;
  category: string;
  priceCents: number;
  basketMm?: number | null;
  pfStandards?: string[];
  pfMaybeStandards?: string[];
  voltage?: number | null;
  espressoCapable?: boolean | null;
  compatibleMachineSlugs?: string[];
  isUniversal?: boolean;
};

const BASKET_SIZED_CATEGORIES = [
  "BASKET",
  "TAMPER",
  "PUCK_SCREEN",
  "DOSING_FUNNEL",
];

const STATUS_SEVERITY: Record<CompatStatus, number> = {
  INCOMPATIBLE: 3,
  UNKNOWN: 2,
  COMPATIBLE: 1,
  NOT_APPLICABLE: 0,
};

function intersect(a: string[] | undefined, b: string[] | undefined): string[] {
  if (!a || !b) return [];
  return a.filter((x) => b.includes(x));
}

// Returns [machine, other] if the pair matches (machineCategory, otherCategory)
// in either order, else null.
function pairAs(
  a: CompatProduct,
  b: CompatProduct,
  catA: string,
  catsB: string[],
): [CompatProduct, CompatProduct] | null {
  if (a.category === catA && catsB.includes(b.category)) return [a, b];
  if (b.category === catA && catsB.includes(a.category)) return [b, a];
  return null;
}

export function checkPair(
  candidate: CompatProduct,
  owned: CompatProduct,
  catalog: CompatProduct[],
): CompatResult {
  // R0 — universal accessories work with anything.
  if (candidate.isUniversal || owned.isUniversal) {
    return { status: "NOT_APPLICABLE", reason: "Works with any setup." };
  }

  // R1 — machine vs portafilter (either order).
  const machinePf = pairAs(candidate, owned, "MACHINE", ["PORTAFILTER"]);
  if (machinePf) {
    const [machine, portafilter] = machinePf;
    const accepts = machine.pfStandards ?? [];
    const maybe = machine.pfMaybeStandards ?? [];
    const provides = portafilter.pfStandards ?? [];
    if (intersect(accepts, provides).length > 0) {
      return {
        status: "COMPATIBLE",
        reason: `${portafilter.name} seats the ${machine.name}'s ${accepts.join("/")} group properly.`,
      };
    }
    if (intersect(maybe, provides).length > 0) {
      return {
        status: "UNKNOWN",
        reason: `Reported to fit by some owners, not guaranteed by ${portafilter.brand}; ${machine.brand}'s own portafilter is the safe choice.`,
      };
    }
    const fix = catalog
      .filter(
        (p) =>
          p.category === "PORTAFILTER" &&
          intersect(p.pfStandards, accepts).length > 0,
      )
      .sort((a, b) => a.priceCents - b.priceCents)[0];
    return {
      status: "INCOMPATIBLE",
      reason: `${portafilter.name} is an ${provides.join("/")} portafilter; the ${machine.name} takes ${accepts.join("/")} — it won't seat properly.`,
      ...(fix ? { fixSlug: fix.slug } : {}),
    };
  }

  // R2 — machine or portafilter vs basket-sized tool (either order).
  const sized =
    pairAs(candidate, owned, "MACHINE", BASKET_SIZED_CATEGORIES) ??
    pairAs(candidate, owned, "PORTAFILTER", BASKET_SIZED_CATEGORIES);
  if (sized) {
    const [holder, tool] = sized;
    if (holder.basketMm != null && tool.basketMm != null) {
      if (holder.basketMm === tool.basketMm) {
        return {
          status: "COMPATIBLE",
          reason: `${tool.name} matches the ${holder.name}'s ${holder.basketMm} mm basket size.`,
        };
      }
      const fix = catalog
        .filter(
          (p) => p.category === tool.category && p.basketMm === holder.basketMm,
        )
        .sort((a, b) => a.priceCents - b.priceCents)[0];
      return {
        status: "INCOMPATIBLE",
        reason: `${tool.name} is sized for ${tool.basketMm} mm baskets but the ${holder.name} uses ${holder.basketMm} mm.`,
        ...(fix ? { fixSlug: fix.slug } : {}),
      };
    }
  }

  // R3 — machine vs water filter (either order).
  const filterPair = pairAs(candidate, owned, "MACHINE", ["WATER_FILTER"]);
  if (filterPair) {
    const [machine, filter] = filterPair;
    if ((filter.compatibleMachineSlugs ?? []).includes(machine.slug)) {
      return {
        status: "COMPATIBLE",
        reason: `${filter.name} is a drop-in cartridge for the ${machine.name}'s water tank.`,
      };
    }
    return {
      status: "INCOMPATIBLE",
      reason: `Drop-in cartridge for ${filter.brand} tanks only.`,
    };
  }

  // R4 — machine vs grinder (either order).
  const grinderPair = pairAs(candidate, owned, "MACHINE", ["GRINDER"]);
  if (grinderPair) {
    const [, grinder] = grinderPair;
    if (grinder.espressoCapable) {
      return {
        status: "COMPATIBLE",
        reason: `${grinder.name} grinds fine enough for unpressurised espresso.`,
      };
    }
    return {
      status: "INCOMPATIBLE",
      reason: "Stepped burr set can't go fine enough for unpressurised espresso.",
    };
  }

  // R5 — both mains-powered, different voltage.
  if (
    candidate.voltage != null &&
    owned.voltage != null &&
    candidate.voltage !== owned.voltage
  ) {
    return { status: "INCOMPATIBLE", reason: "Different voltage." };
  }

  // R6 — anything else (incl. machine vs machine).
  return {
    status: "NOT_APPLICABLE",
    reason: "These products don't interact.",
  };
}

export type GearCheck = {
  overall: CompatStatus;
  items: Array<{ ownedSlug: string; ownedName: string } & CompatResult>;
  suggestedFixes: Array<{ forOwnedSlug: string; fixSlug: string }>;
};

export function checkAgainstGear(
  candidate: CompatProduct,
  gear: CompatProduct[],
  catalog: CompatProduct[],
): GearCheck {
  const items = gear.map((owned) => ({
    ownedSlug: owned.slug,
    ownedName: owned.name,
    ...checkPair(candidate, owned, catalog),
  }));
  const overall = items.reduce<CompatStatus>(
    (acc, item) =>
      STATUS_SEVERITY[item.status] > STATUS_SEVERITY[acc] ? item.status : acc,
    "NOT_APPLICABLE",
  );
  const suggestedFixes = items
    .filter((i) => i.fixSlug)
    .map((i) => ({ forOwnedSlug: i.ownedSlug, fixSlug: i.fixSlug! }));
  return { overall, items, suggestedFixes };
}
