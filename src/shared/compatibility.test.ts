import { describe, expect, it } from "vitest";
import {
  CATALOG,
  DEMO_ORDERS,
  MACHINE_SPEC_KEYS,
} from "../server/catalog.seed";
import { checkAgainstGear, checkPair } from "./compatibility";

const bySlug = (slug: string) => {
  const p = CATALOG.find((p) => p.slug === slug);
  if (!p) throw new Error(`No such product in catalog: ${slug}`);
  return p;
};

// Everything vince owns, from his seeded orders.
const gear = DEMO_ORDERS.flatMap((o) => o.itemSlugs).map(bySlug);

describe("seed catalog invariants (M1)", () => {
  it("has all 31 products", () => {
    expect(CATALOG).toHaveLength(31);
    expect(new Set(CATALOG.map((p) => p.slug)).size).toBe(31);
  });

  it("every MACHINE has the identical spec key set, in MACHINE_SPEC_KEYS order", () => {
    const expectedKeys = MACHINE_SPEC_KEYS.map((k) => k.key);
    const machines = CATALOG.filter((p) => p.category === "MACHINE");
    expect(machines).toHaveLength(6);
    for (const m of machines) {
      expect(Object.keys(m.specs)).toEqual(expectedKeys);
    }
  });

  it("every product has sourceUrl and priceCents > 0", () => {
    for (const p of CATALOG) {
      expect(p.sourceUrl, p.slug).toMatch(/^https:\/\//);
      expect(p.priceCents, p.slug).toBeGreaterThan(0);
    }
  });

  it("machine spec keys are padded to ~40 rows", () => {
    expect(MACHINE_SPEC_KEYS.length).toBeGreaterThanOrEqual(38);
  });
});

describe("compatibility engine (M3, Appendix C.4 expected outcomes)", () => {
  it("Linea Mini R vs vince's gear → INCOMPATIBLE, PLA580M won't seat, fix is LM Home bottomless", () => {
    const result = checkAgainstGear(bySlug("lm-linea-mini-r"), gear, CATALOG);
    expect(result.overall).toBe("INCOMPATIBLE");

    const item = (slug: string) =>
      result.items.find((i) => i.ownedSlug === slug)!;

    expect(item("lelit-pla580m").status).toBe("INCOMPATIBLE"); // R1
    expect(item("lelit-pla580m").fixSlug).toBe("lm-home-bottomless");
    expect(item("normcore-v4-tamper-585").status).toBe("COMPATIBLE"); // R2
    expect(item("normcore-puck-screen-585").status).toBe("COMPATIBLE"); // R2
    expect(item("ims-b70-2tc-h285").status).toBe("COMPATIBLE"); // R2
    expect(item("option-o-lagom-casa").status).toBe("COMPATIBLE"); // R4
    expect(item("normcore-wdt-v3").status).toBe("NOT_APPLICABLE"); // R0
    expect(item("motta-europa-350").status).toBe("NOT_APPLICABLE"); // R0
    expect(item("timemore-black-mirror-nano").status).toBe("NOT_APPLICABLE"); // R0
    expect(item("lelit-mara-x-v2").status).toBe("NOT_APPLICABLE"); // R6

    expect(result.suggestedFixes).toEqual([
      { forOwnedSlug: "lelit-pla580m", fixSlug: "lm-home-bottomless" },
    ]);
  });

  it("Bianca V3 vs vince's gear → COMPATIBLE, nothing incompatible or unknown", () => {
    const result = checkAgainstGear(bySlug("lelit-bianca-v3"), gear, CATALOG);
    expect(result.overall).toBe("COMPATIBLE");
    expect(result.items.some((i) => i.status === "INCOMPATIBLE")).toBe(false);
    expect(result.items.some((i) => i.status === "UNKNOWN")).toBe(false);
    expect(result.suggestedFixes).toEqual([]);
  });

  it("Elizabeth V3 + Normcore E61 bottomless → UNKNOWN", () => {
    const result = checkAgainstGear(
      bySlug("lelit-elizabeth-v3"),
      [bySlug("normcore-e61-58-bottomless")],
      CATALOG,
    );
    expect(result.overall).toBe("UNKNOWN");
    expect(result.items[0].reason).toMatch(/not guaranteed/i);
  });

  it("PLA930M water filter → COMPATIBLE with Bianca, INCOMPATIBLE with Linea Mini", () => {
    const vsBianca = checkAgainstGear(
      bySlug("lelit-pla930m"),
      [bySlug("lelit-bianca-v3")],
      CATALOG,
    );
    expect(vsBianca.overall).toBe("COMPATIBLE");

    const vsLm = checkAgainstGear(
      bySlug("lelit-pla930m"),
      [bySlug("lm-linea-mini-r")],
      CATALOG,
    );
    expect(vsLm.overall).toBe("INCOMPATIBLE");
    expect(vsLm.items[0].reason).toMatch(/Lelit tanks only/);
  });

  it("Baratza Encore vs Bianca → INCOMPATIBLE (R4)", () => {
    const result = checkAgainstGear(
      bySlug("baratza-encore"),
      [bySlug("lelit-bianca-v3")],
      CATALOG,
    );
    expect(result.overall).toBe("INCOMPATIBLE");
    expect(result.items[0].reason).toMatch(/Stepped burr set/);
  });

  it("Bambino Plus vs vince's gear → INCOMPATIBLE with four 54 mm fixes", () => {
    const result = checkAgainstGear(bySlug("sage-bambino-plus"), gear, CATALOG);
    expect(result.overall).toBe("INCOMPATIBLE");
    const fixes = result.suggestedFixes.map((f) => f.fixSlug).sort();
    expect(fixes).toEqual(
      [
        "ims-54-breville-basket",
        "normcore-54-bottomless",
        "normcore-puck-screen-533",
        "normcore-v4-tamper-533",
      ].sort(),
    );
  });

  it("universal accessory (R0) short-circuits every other rule", () => {
    const result = checkPair(
      bySlug("normcore-wdt-v3"),
      bySlug("sage-bambino-plus"),
      CATALOG,
    );
    expect(result.status).toBe("NOT_APPLICABLE");
    expect(result.reason).toBe("Works with any setup.");
  });

  it("R1 works in either order (portafilter as candidate)", () => {
    const result = checkPair(
      bySlug("lelit-pla580m"),
      bySlug("lm-linea-mini-r"),
      CATALOG,
    );
    expect(result.status).toBe("INCOMPATIBLE");
    expect(result.fixSlug).toBe("lm-home-bottomless");
  });
});
