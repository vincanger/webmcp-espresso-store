// Full seed catalog (Appendix C.4). Pure data, no Wasp/Prisma imports — unit-testable.
// Specs from manufacturer/retailer pages (sourceUrl on each product).
// Prices ≈ EU street incl. VAT, Aug 2026.

export type SpecEntry = {
  label: string;
  value: string;
  unit?: string;
  group: string;
};

export type CatalogProduct = {
  slug: string;
  name: string;
  brand: string;
  category:
    | "MACHINE"
    | "GRINDER"
    | "PORTAFILTER"
    | "BASKET"
    | "TAMPER"
    | "PUCK_SCREEN"
    | "DOSING_FUNNEL"
    | "WDT_TOOL"
    | "WATER_FILTER"
    | "ACCESSORY";
  priceCents: number;
  shortBlurb: string;
  imageUrl: string;
  sourceUrl: string;
  colorOptions?: string[];
  basketMm?: number;
  pfStandards?: string[];
  pfMaybeStandards?: string[];
  voltage?: number;
  espressoCapable?: boolean;
  compatibleMachineSlugs?: string[];
  isUniversal?: boolean;
  specs: Record<string, SpecEntry>;
};

import { MACHINE_SPEC_KEYS } from "../shared/machineSpecKeys";

export { MACHINE_SPEC_KEYS };

// Builds a machine's full specs object from partial values, padding every
// missing key with "—" so all machines share the exact same key set.
function machineSpecs(values: Record<string, string>): Record<string, SpecEntry> {
  const specs: Record<string, SpecEntry> = {};
  for (const { key, label, group, unit } of MACHINE_SPEC_KEYS) {
    specs[key] = { label, value: values[key] ?? "—", group, ...(unit ? { unit } : {}) };
  }
  return specs;
}

function simpleSpecs(
  entries: Array<[string, string, string] | [string, string, string, string]>,
): Record<string, SpecEntry> {
  const specs: Record<string, SpecEntry> = {};
  for (const [key, label, value, unit] of entries) {
    specs[key] = { label, value, group: "Specs", ...(unit ? { unit } : {}) };
  }
  return specs;
}

const MACHINES: CatalogProduct[] = [
  {
    slug: "lm-linea-mini-r",
    name: "La Marzocco Linea Mini R",
    brand: "La Marzocco",
    category: "MACHINE",
    priceCents: 529000,
    shortBlurb:
      "The commercial Linea, shrunk for home: saturated brew group, rotary pump, 3 L steam boiler and app control.",
    imageUrl: "/img/products/lm-linea-mini-r.png",
    sourceUrl:
      "https://www.lamarzocco.com/it/en/home-products/espresso-machines/linea-mini-r/",
    colorOptions: ["stainless", "black", "white", "red", "yellow", "light blue"],
    basketMm: 58,
    pfStandards: ["LM58"],
    pfMaybeStandards: [],
    voltage: 230,
    specs: machineSpecs({
      boilerConfig: "Dual boiler: 0.17 L saturated brew + 3.0 L steam",
      brewBoilerL: "0.17 (saturated group)",
      groupType: "La Marzocco saturated group (not E61)",
      portafilterFit: "LM58 — La Marzocco's own 58 mm portafilters only, not E61",
      basketMm: "58",
      pid: "Yes",
      preInfusion: "Pre-brewing, configurable via app",
      flowControl: "Yes (paddle)",
      pumpType: "Rotary",
      steamBoilerL: "3.0",
      simultaneousBrewSteam: "Yes",
      steamWand: "Pro-style, dual-hole tip",
      heatUpMinutes: "~15 min",
      widthCm: "35.7",
      depthCm: "45.3",
      heightCm: "37.7",
      weightKg: "30",
      waterTankL: "2.5",
      plumbable: "Yes",
      wattage: "2100",
      voltage: "230",
      appControl: "Yes (La Marzocco Home app)",
      caseMaterial: "Stainless steel",
      boilerMaterial: "Stainless steel",
      warrantyYears: "2",
      colorOptions: "Stainless, black, white, red, yellow, light blue",
      madeIn: "Florence, Italy",
      priceEur: "5,290",
    }),
  },
  {
    slug: "lelit-bianca-v3",
    name: "Lelit Bianca V3 (PL162T)",
    brand: "Lelit",
    category: "MACHINE",
    priceCents: 229900,
    shortBlurb:
      "Compact dual-boiler E61 with flow-control paddle and a water tank you can move to the side — 29 cm wide.",
    imageUrl: "/img/products/lelit-bianca-v3.jpg",
    sourceUrl: "https://www.lelit.com/product/bianca-pl162t/",
    colorOptions: ["stainless", "black", "white"],
    basketMm: 58,
    pfStandards: ["E61", "LELIT58"],
    pfMaybeStandards: [],
    voltage: 230,
    specs: machineSpecs({
      boilerConfig: "Dual boiler: 0.8 L brew + 1.5 L steam",
      brewBoilerL: "0.8",
      groupType: "E61 group",
      portafilterFit: "E61 58 mm — standard E61 and Lelit 58 portafilters fit",
      basketMm: "58",
      pid: "Yes (LCC)",
      preInfusion: "Yes (via E61 group and paddle)",
      flowControl: "Yes (paddle + Low Flow mode)",
      pumpType: "Rotary",
      brewPressureGauge: "Yes",
      steamBoilerL: "1.5",
      simultaneousBrewSteam: "Yes",
      steamWand: "Multi-directional, no-burn",
      hotWaterSpout: "Yes",
      heatUpMinutes: "~10 min brew-ready, ~20 min fully stable (approx.)",
      widthCm: "29",
      depthCm: "40 (49 with tank behind; tank can sit at the side)",
      heightCm: "40",
      weightKg: "27.2",
      waterTankL: "2.5",
      waterTankPosition: "Rear, movable to either side",
      plumbable: "Yes (kit included)",
      noiseDb: "~61 dB",
      wattage: "1400",
      voltage: "230",
      caseMaterial: "Stainless steel, wood accents",
      boilerMaterial: "Stainless steel",
      display: "LCC display",
      warrantyYears: "2",
      colorOptions: "Stainless, black, white",
      madeIn: "Castegnato, Italy",
      priceEur: "2,299",
    }),
  },
  {
    slug: "lelit-elizabeth-v3",
    name: "Lelit Elizabeth V3 (PL92T)",
    brand: "Lelit",
    category: "MACHINE",
    priceCents: 119900,
    shortBlurb:
      "Dual-boiler workhorse with a compact Lelit 58 ring group — big features, mid-range price.",
    imageUrl: "/img/products/lelit-elizabeth-v3.jpg",
    sourceUrl: "https://www.lelit.com/product/elizabeth-pl92t/",
    colorOptions: ["stainless"],
    basketMm: 58,
    pfStandards: ["LELIT58"],
    pfMaybeStandards: ["E61"],
    voltage: 230,
    specs: machineSpecs({
      boilerConfig: "Dual boiler: 0.3 L brew + 0.6 L steam",
      brewBoilerL: "0.3",
      groupType: "Lelit 58 ring group (not E61)",
      portafilterFit:
        "Lelit 58 — Lelit portafilters fit; third-party E61 reported to fit by some owners, not guaranteed",
      basketMm: "58",
      pid: "Yes (LCC)",
      preInfusion: "Yes (programmable)",
      flowControl: "No",
      pumpType: "Vibration",
      shotTimer: "Yes (on display)",
      steamBoilerL: "0.6",
      simultaneousBrewSteam: "Yes",
      steamWand: "No-burn",
      heatUpMinutes: "~8–15 min (approx.)",
      widthCm: "32",
      depthCm: "38",
      heightCm: "38",
      weightKg: "15.3",
      waterTankL: "2.5",
      plumbable: "No",
      noiseDb: "~45–50 dB",
      wattage: "1400",
      voltage: "230",
      caseMaterial: "Stainless steel",
      boilerMaterial: "Stainless steel",
      display: "LCC display",
      warrantyYears: "2",
      colorOptions: "Stainless",
      madeIn: "Castegnato, Italy",
      priceEur: "1,199",
    }),
  },
  {
    slug: "profitec-go",
    name: "Profitec GO (2.0)",
    brand: "Profitec",
    category: "MACHINE",
    priceCents: 99500,
    shortBlurb:
      "Single-boiler starter machine with PID and an E61-compatible ring group in a 21 cm-wide case.",
    imageUrl: "/img/products/profitec-go.jpg",
    sourceUrl: "https://www.profitec-espresso.com/en/products/go",
    colorOptions: ["black", "red", "yellow", "blue", "stainless"],
    basketMm: 58,
    pfStandards: ["E61"],
    pfMaybeStandards: [],
    voltage: 230,
    specs: machineSpecs({
      boilerConfig: "Single boiler 0.3 L",
      brewBoilerL: "0.3",
      groupType: "Ring group (not E61), accepts E61 portafilters",
      portafilterFit: "E61 58 mm portafilters fit",
      basketMm: "58",
      pid: "Yes",
      preInfusion: "No",
      flowControl: "No",
      pumpType: "Vibration",
      brewPressureGauge: "Yes",
      steamBoilerL: "— (single boiler)",
      simultaneousBrewSteam: "No",
      steamWand: "No-burn",
      heatUpMinutes: "~7 min",
      widthCm: "21",
      depthCm: "36.2",
      heightCm: "38.1",
      weightKg: "12.9",
      waterTankL: "2.8",
      plumbable: "No",
      noiseDb: "~60 dB",
      wattage: "1300",
      voltage: "230",
      caseMaterial: "Powder-coated steel",
      warrantyYears: "2",
      colorOptions: "Black, red, yellow, blue, stainless",
      madeIn: "Milan, Italy",
      priceEur: "995",
    }),
  },
  {
    slug: "lelit-mara-x-v2",
    name: "Lelit Mara X V2 (PL62X)",
    brand: "Lelit",
    category: "MACHINE",
    priceCents: 117900,
    shortBlurb:
      "The cult compact E61 heat exchanger — quiet, clever temperature management, 22.5 cm wide.",
    imageUrl: "/img/products/lelit-mara-x-v2.jpg",
    sourceUrl: "https://www.lelit.com/product/marax-pl62x/",
    colorOptions: ["stainless", "black", "white"],
    basketMm: 58,
    pfStandards: ["E61", "LELIT58"],
    pfMaybeStandards: [],
    voltage: 230,
    specs: machineSpecs({
      boilerConfig: "Heat exchanger, 1.8 L boiler",
      brewBoilerL: "1.8 (heat exchanger)",
      groupType: "E61 group",
      portafilterFit: "E61 58 mm — standard E61 and Lelit 58 portafilters fit",
      basketMm: "58",
      pid: "Yes (hidden, dual-mode)",
      preInfusion: "Yes (mechanical, via E61 group)",
      flowControl: "No",
      pumpType: "Vibration",
      brewPressureGauge: "Yes",
      steamBoilerL: "1.8 (shared heat-exchanger boiler)",
      simultaneousBrewSteam: "Yes",
      steamWand: "No-burn",
      heatUpMinutes: "~24 min",
      widthCm: "22.5",
      depthCm: "41",
      heightCm: "35.5",
      weightKg: "18.5",
      waterTankL: "2.5",
      plumbable: "No",
      noiseDb: "~45–50 dB",
      wattage: "1400",
      voltage: "230",
      caseMaterial: "Stainless steel",
      warrantyYears: "2",
      colorOptions: "Stainless, black, white",
      madeIn: "Castegnato, Italy",
      priceEur: "1,179",
    }),
  },
  {
    slug: "sage-bambino-plus",
    name: "Sage / Breville Bambino Plus",
    brand: "Sage / Breville",
    category: "MACHINE",
    priceCents: 44900,
    shortBlurb:
      "Three-second heat-up thermojet machine with automatic milk texturing — the small-kitchen favourite.",
    imageUrl: "/img/products/sage-bambino-plus.png",
    sourceUrl: "https://www.sageappliances.com/de-de/product/bes500",
    colorOptions: ["stainless", "black truffle", "sea salt", "damson blue"],
    basketMm: 54,
    pfStandards: ["BREVILLE54"],
    pfMaybeStandards: [],
    voltage: 230,
    specs: machineSpecs({
      boilerConfig: "ThermoJet heating system, no boiler",
      brewBoilerL: "— (thermojet)",
      groupType: "54 mm Breville group",
      portafilterFit: "Breville/Sage 54 mm portafilters",
      basketMm: "54",
      pid: "Yes (digital temperature control)",
      preInfusion: "Yes (low-pressure pre-infusion)",
      flowControl: "No",
      pumpType: "Vibration",
      steamBoilerL: "— (thermojet)",
      simultaneousBrewSteam: "No",
      steamWand: "Automatic texturing, adjustable temp & foam",
      heatUpMinutes: "3 s",
      widthCm: "19.5",
      depthCm: "32",
      heightCm: "31",
      weightKg: "4.9",
      waterTankL: "1.9",
      plumbable: "No",
      wattage: "1600",
      voltage: "230",
      autoOff: "Yes",
      caseMaterial: "Brushed stainless steel",
      warrantyYears: "2",
      colorOptions: "Stainless, black truffle, sea salt, damson blue",
      madeIn: "China",
      priceEur: "449",
    }),
  },
];

const GRINDERS: CatalogProduct[] = [
  {
    slug: "option-o-lagom-casa",
    name: "Option-O Lagom Casa",
    brand: "Option-O",
    category: "GRINDER",
    priceCents: 59900,
    shortBlurb:
      "Quiet low-RPM single-doser with 65 mm conical Mizen burrs — espresso to filter with no retention fuss.",
    imageUrl: "/img/products/option-o-lagom-casa.jpg",
    sourceUrl: "https://www.option-o.com/lagom-casa",
    voltage: 230,
    espressoCapable: true,
    specs: simpleSpecs([
      ["burrs", "Burrs", "65 mm conical (Mizen 65CL)"],
      ["dosing", "Dosing", "Single-dose"],
      ["adjustment", "Grind adjustment", "Stepless"],
      ["espressoCapable", "Espresso capable", "Yes"],
      ["rpm", "Burr speed", "~140 RPM"],
      ["dimensions", "Dimensions (W×D×H)", "9 × 21.5 × 27.5 cm"],
      ["weightKg", "Weight", "3.5", "kg"],
      ["priceEur", "Price", "599", "€"],
    ]),
  },
  {
    slug: "df64-gen2",
    name: "DF64 Gen 2",
    brand: "DF64",
    category: "GRINDER",
    priceCents: 39900,
    shortBlurb:
      "The value single-dose flat-burr grinder — 64 mm flats, bellows, stepless adjustment.",
    imageUrl: "/img/products/df64-gen2.png",
    sourceUrl:
      "https://df64coffee.com/products/df64-gen-2-single-dose-coffee-grinder",
    voltage: 230,
    espressoCapable: true,
    specs: simpleSpecs([
      ["burrs", "Burrs", "64 mm flat"],
      ["dosing", "Dosing", "Single-dose, with bellows"],
      ["adjustment", "Grind adjustment", "Stepless"],
      ["espressoCapable", "Espresso capable", "Yes"],
      ["rpm", "Burr speed", "1400 RPM"],
      ["wattage", "Power", "250", "W"],
      ["weightKg", "Weight", "~7", "kg"],
      ["priceEur", "Price", "399", "€"],
    ]),
  },
  {
    slug: "mahlkonig-x54",
    name: "Mahlkönig X54 Allround",
    brand: "Mahlkönig",
    category: "GRINDER",
    priceCents: 44900,
    shortBlurb:
      "Commercial-brand home grinder with 54 mm flats, stepless dial and a 250 g hopper.",
    imageUrl: "/img/products/mahlkonig-x54.png",
    sourceUrl:
      "https://www.mahlkoniguk.co.uk/product/mahlkonig-x54-allround-home-grinder",
    voltage: 230,
    espressoCapable: true,
    specs: simpleSpecs([
      ["burrs", "Burrs", "54 mm flat"],
      ["dosing", "Dosing", "250 g hopper"],
      ["adjustment", "Grind adjustment", "Stepless"],
      ["espressoCapable", "Espresso capable", "Yes"],
      ["wattage", "Power", "120", "W"],
      ["weightKg", "Weight", "5.1", "kg"],
      ["priceEur", "Price", "449", "€"],
    ]),
  },
  {
    slug: "comandante-c40-mk4",
    name: "Comandante C40 MK4 Nitro Blade",
    brand: "Comandante",
    category: "GRINDER",
    priceCents: 21900,
    shortBlurb:
      "The reference hand grinder; ~30 µm stepped clicks — Red Clix (+€38, approx.) recommended for espresso.",
    imageUrl: "/img/products/comandante-c40-mk4.png",
    sourceUrl: "https://kaffeemacher.de/en/products/comandante-handmuhle",
    espressoCapable: true,
    specs: simpleSpecs([
      ["burrs", "Burrs", "39 mm conical, Nitro Blade steel"],
      ["dosing", "Dosing", "Hand grinder, single-dose"],
      ["adjustment", "Grind adjustment", "Stepped (~30 µm per click)"],
      ["espressoCapable", "Espresso capable", "Yes (Red Clix upgrade recommended)"],
      ["priceEur", "Price", "219", "€"],
    ]),
  },
  {
    slug: "baratza-encore",
    name: "Baratza Encore",
    brand: "Baratza",
    category: "GRINDER",
    priceCents: 17900,
    shortBlurb:
      "The classic filter-coffee grinder — 40 stepped settings, not fine or precise enough for unpressurised espresso.",
    imageUrl: "/img/products/baratza-encore.png",
    sourceUrl: "https://www.baratza.com/en-us/product/encore-zcg485",
    voltage: 230,
    espressoCapable: false,
    specs: simpleSpecs([
      ["burrs", "Burrs", "40 mm conical"],
      ["dosing", "Dosing", "Hopper"],
      ["adjustment", "Grind adjustment", "Stepped, 40 settings"],
      ["espressoCapable", "Espresso capable", "No — marketed for filter brewing"],
      ["priceEur", "Price", "179", "€"],
    ]),
  },
];

const PORTAFILTERS: CatalogProduct[] = [
  {
    slug: "lelit-pla580m",
    name: "Lelit PLA580M bottomless portafilter, maple",
    brand: "Lelit",
    category: "PORTAFILTER",
    priceCents: 7900,
    shortBlurb:
      "Lelit's 58 mm bottomless with maple handle, IMS 18–21 g basket included. Fits E61 and Lelit 58 groups.",
    imageUrl: "/img/products/lelit-pla580m.jpg",
    sourceUrl: "https://www.lelit.com/product/wooden-handle-filterholders/",
    basketMm: 58,
    pfStandards: ["E61", "LELIT58"],
    specs: simpleSpecs([
      ["standard", "Fits", "E61 / Lelit 58 groups"],
      ["basketMm", "Basket size", "58", "mm"],
      ["style", "Style", "Bottomless (naked)"],
      ["handle", "Handle", "Maple wood"],
      ["included", "Included", "IMS 18–21 g precision basket"],
      ["priceEur", "Price", "79", "€"],
    ]),
  },
  {
    slug: "normcore-e61-58-bottomless",
    name: "Normcore 58 mm E61 bottomless portafilter",
    brand: "Normcore",
    category: "PORTAFILTER",
    priceCents: 5900,
    shortBlurb:
      "Affordable 58 mm E61 bottomless. Fits Bianca, Mara X, Profitec GO; Elizabeth fit is owner-reported only.",
    imageUrl: "/img/products/normcore-e61-58-bottomless.jpg",
    sourceUrl: "https://www.normcorewares.com/",
    basketMm: 58,
    pfStandards: ["E61"],
    specs: simpleSpecs([
      ["standard", "Fits", "E61 groups"],
      ["basketMm", "Basket size", "58", "mm"],
      ["style", "Style", "Bottomless (naked)"],
      ["priceEur", "Price", "59", "€"],
    ]),
  },
  {
    slug: "lm-home-bottomless",
    name: "La Marzocco Home bottomless portafilter (walnut)",
    brand: "La Marzocco",
    category: "PORTAFILTER",
    priceCents: 17900,
    shortBlurb:
      "La Marzocco's own naked portafilter for LM58 groups — Linea Mini, Micra, GS3. Price approx. for EU.",
    imageUrl: "/img/products/lm-home-bottomless.png",
    sourceUrl: "https://home.lamarzoccousa.com/product/bottomless-portafilter/",
    basketMm: 58,
    pfStandards: ["LM58"],
    specs: simpleSpecs([
      ["standard", "Fits", "LM58 groups (Linea Mini, Micra, GS3)"],
      ["basketMm", "Basket size", "58", "mm"],
      ["style", "Style", "Bottomless (naked)"],
      ["handle", "Handle", "Walnut wood"],
      ["priceEur", "Price", "179 (approx.)", "€"],
    ]),
  },
  {
    slug: "profitec-modular-bottomless",
    name: "Profitec modular bottomless portafilter (04PR5805)",
    brand: "Profitec",
    category: "PORTAFILTER",
    priceCents: 5900,
    shortBlurb:
      "Profitec's modular naked portafilter for the GO, Pro series and most E61 groups.",
    imageUrl: "/img/products/profitec-modular-bottomless.jpg",
    sourceUrl:
      "https://www.espressocoffeeshop.com/en/accessories/1512-profitec-portafiltro-senza-fondo-modulare.html",
    basketMm: 58,
    pfStandards: ["E61"],
    specs: simpleSpecs([
      ["standard", "Fits", "E61 groups (GO, Pro series)"],
      ["basketMm", "Basket size", "58", "mm"],
      ["style", "Style", "Bottomless (naked), modular"],
      ["priceEur", "Price", "59", "€"],
    ]),
  },
  {
    slug: "normcore-54-bottomless",
    name: "Normcore 54 mm bottomless portafilter (Breville/Sage)",
    brand: "Normcore",
    category: "PORTAFILTER",
    priceCents: 5900,
    shortBlurb:
      "54 mm naked portafilter for Sage/Breville Bambino, Bambino Plus and Barista series.",
    imageUrl: "/img/products/normcore-54-bottomless.jpg",
    sourceUrl:
      "https://www.normcorewares.com/products/normcore-54mm-bottomless-portafilter-with-handle-fits-breville-sage",
    basketMm: 54,
    pfStandards: ["BREVILLE54"],
    specs: simpleSpecs([
      ["standard", "Fits", "Breville/Sage 54 mm groups"],
      ["basketMm", "Basket size", "54", "mm"],
      ["style", "Style", "Bottomless (naked)"],
      ["priceEur", "Price", "59", "€"],
    ]),
  },
];

const ACCESSORIES: CatalogProduct[] = [
  {
    slug: "ims-b70-2tc-h285",
    name: "IMS B70 2TC H28.5 E precision basket",
    brand: "IMS",
    category: "BASKET",
    priceCents: 2200,
    shortBlurb: "58 mm precision basket, 18–22 g dose range.",
    imageUrl: "/img/products/ims-b70-2tc-h285.jpg",
    sourceUrl:
      "https://www.coffeedesk.com/product/2606/Ims-B70-2Tc-H28-5-E-Precision-Filter",
    basketMm: 58,
    specs: simpleSpecs([
      ["size", "Size", "58", "mm"],
      ["dose", "Dose range", "18–22 g"],
      ["height", "Height", "28.5", "mm"],
      ["priceEur", "Price", "22", "€"],
    ]),
  },
  {
    slug: "vst-18g-ridgeless",
    name: "VST 18 g precision ridgeless basket",
    brand: "VST",
    category: "BASKET",
    priceCents: 4900,
    shortBlurb: "The competition-standard 58 mm precision basket, 18 g, ridgeless.",
    imageUrl: "/img/products/vst-18g-ridgeless.jpg",
    sourceUrl:
      "https://www.coffeedesk.com/product/2282/Vst-18G-Precision-Ridgeless-Filter-Basket",
    basketMm: 58,
    specs: simpleSpecs([
      ["size", "Size", "58", "mm"],
      ["dose", "Dose", "18 g (±1 g)"],
      ["style", "Style", "Ridgeless"],
      ["priceEur", "Price", "49", "€"],
    ]),
  },
  {
    slug: "ims-54-breville-basket",
    name: "IMS B62.52TH28E precision basket (54 mm Breville)",
    brand: "IMS",
    category: "BASKET",
    priceCents: 3100,
    shortBlurb: "54 mm precision basket for Breville/Sage portafilters, 18–22 g.",
    imageUrl: "/img/products/ims-54-breville-basket.png",
    sourceUrl:
      "https://caffewerks.com/products/b62-52th28e-ims-precision-18-22-g-filter-basket-compatible-with-54mm-breville",
    basketMm: 54,
    specs: simpleSpecs([
      ["size", "Size", "54 mm (Breville/Sage)"],
      ["dose", "Dose range", "18–22 g"],
      ["priceEur", "Price", "31", "€"],
    ]),
  },
  {
    slug: "normcore-v4-tamper-585",
    name: "Normcore V4 spring tamper 58.5 mm",
    brand: "Normcore",
    category: "TAMPER",
    priceCents: 5500,
    shortBlurb: "Spring-loaded 58.5 mm tamper for consistent pressure on 58 mm baskets.",
    imageUrl: "/img/products/normcore-v4-tamper-585.jpg",
    sourceUrl: "https://www.normcorewares.com/",
    basketMm: 58,
    specs: simpleSpecs([
      ["size", "Size", "58.5 mm (for 58 mm baskets)"],
      ["type", "Type", "Spring-loaded, constant pressure"],
      ["priceEur", "Price", "55", "€"],
    ]),
  },
  {
    slug: "normcore-v4-tamper-533",
    name: "Normcore V4 spring tamper 53.3 mm",
    brand: "Normcore",
    category: "TAMPER",
    priceCents: 5500,
    shortBlurb: "Spring-loaded 53.3 mm tamper for Breville/Sage 54 mm baskets.",
    imageUrl: "/img/products/normcore-v4-tamper-533.jpg",
    sourceUrl: "https://www.normcorewares.com/",
    basketMm: 54,
    specs: simpleSpecs([
      ["size", "Size", "53.3 mm (for 54 mm Breville/Sage baskets)"],
      ["type", "Type", "Spring-loaded, constant pressure"],
      ["priceEur", "Price", "55", "€"],
    ]),
  },
  {
    slug: "normcore-puck-screen-585",
    name: "Normcore puck screen 58.5 mm",
    brand: "Normcore",
    category: "PUCK_SCREEN",
    priceCents: 1500,
    shortBlurb: "316 stainless mesh puck screen for 58 mm baskets.",
    imageUrl: "/img/products/normcore-puck-screen-585.jpg",
    sourceUrl: "https://www.normcorewares.com/",
    basketMm: 58,
    specs: simpleSpecs([
      ["size", "Size", "58.5 mm (for 58 mm baskets)"],
      ["material", "Material", "316 stainless steel"],
      ["priceEur", "Price", "15", "€"],
    ]),
  },
  {
    slug: "normcore-puck-screen-533",
    name: "Normcore puck screen 53.3 mm",
    brand: "Normcore",
    category: "PUCK_SCREEN",
    priceCents: 1500,
    shortBlurb: "Puck screen sized for Breville/Sage 54 mm baskets.",
    imageUrl: "/img/products/normcore-puck-screen-533.jpg",
    sourceUrl: "https://www.normcorewares.com/",
    basketMm: 54,
    specs: simpleSpecs([
      ["size", "Size", "53.3 mm (for 54 mm Breville/Sage baskets)"],
      ["material", "Material", "Stainless steel"],
      ["priceEur", "Price", "15", "€"],
    ]),
  },
  {
    slug: "normcore-dosing-funnel-58",
    name: "Normcore magnetic dosing funnel V2, 58 mm",
    brand: "Normcore",
    category: "DOSING_FUNNEL",
    priceCents: 2600,
    shortBlurb: "Magnetic dosing funnel that keeps grounds in 58 mm baskets.",
    imageUrl: "/img/products/normcore-dosing-funnel-58.jpg",
    sourceUrl: "https://www.normcorewares.com/",
    basketMm: 58,
    specs: simpleSpecs([
      ["size", "Size", "58", "mm"],
      ["mount", "Mount", "Magnetic"],
      ["priceEur", "Price", "26", "€"],
    ]),
  },
  {
    slug: "normcore-wdt-v3",
    name: "Normcore WDT distribution tool V3",
    brand: "Normcore",
    category: "WDT_TOOL",
    priceCents: 3700,
    shortBlurb: "Needle distribution tool — works with any basket size.",
    imageUrl: "/img/products/normcore-wdt-v3.jpg",
    sourceUrl: "https://www.normcorewares.com/",
    isUniversal: true,
    specs: simpleSpecs([
      ["fit", "Fits", "Any basket size (universal)"],
      ["needles", "Needles", "Fine, replaceable"],
      ["priceEur", "Price", "37", "€"],
    ]),
  },
  {
    slug: "lelit-pla930m",
    name: "Lelit PLA930M water softener filter (2-pack)",
    brand: "Lelit",
    category: "WATER_FILTER",
    priceCents: 2990,
    shortBlurb:
      "In-tank resin softener cartridges, 2 × 70 L — drop-in for Lelit tanks (Bianca, Elizabeth, Mara X).",
    imageUrl: "/img/products/lelit-pla930m.png",
    sourceUrl:
      "https://www.lelit.com/en-us/product/water-softener-filters-pdccl05mlt0zxx1",
    compatibleMachineSlugs: ["lelit-bianca-v3", "lelit-elizabeth-v3", "lelit-mara-x-v2"],
    specs: simpleSpecs([
      ["type", "Type", "In-tank resin softener cartridge"],
      ["capacity", "Capacity", "2 × 70 L"],
      ["fits", "Fits", "Lelit water tanks (Bianca, Elizabeth, Mara X)"],
      ["priceEur", "Price", "29.90", "€"],
    ]),
  },
  {
    slug: "motta-europa-500",
    name: "Motta Europa milk pitcher 500 ml",
    brand: "Motta",
    category: "ACCESSORY",
    priceCents: 3500,
    shortBlurb: "The classic Italian steaming pitcher, 500 ml.",
    imageUrl: "/img/products/motta-europa-500.jpg",
    sourceUrl: "https://www.cremashop.eu/en/products/motta/milk-jug-europa/778",
    isUniversal: true,
    specs: simpleSpecs([
      ["capacity", "Capacity", "500 ml"],
      ["material", "Material", "Stainless steel"],
      ["priceEur", "Price", "35", "€"],
    ]),
  },
  {
    slug: "motta-europa-350",
    name: "Motta Europa milk pitcher 350 ml",
    brand: "Motta",
    category: "ACCESSORY",
    priceCents: 3200,
    shortBlurb: "The classic Italian steaming pitcher, 350 ml — flat-white sized.",
    imageUrl: "/img/products/motta-europa-350.jpg",
    sourceUrl: "https://www.cremashop.eu/en/products/motta/milk-jug-europa/778",
    isUniversal: true,
    specs: simpleSpecs([
      ["capacity", "Capacity", "350 ml"],
      ["material", "Material", "Stainless steel"],
      ["priceEur", "Price", "32", "€"],
    ]),
  },
  {
    slug: "acaia-lunar-2021",
    name: "Acaia Lunar (2021)",
    brand: "Acaia",
    category: "ACCESSORY",
    priceCents: 30900,
    shortBlurb: "Water-resistant espresso scale with flow-rate display and app.",
    imageUrl: "/img/products/acaia-lunar-2021.jpg",
    sourceUrl: "https://eu.acaia.co/products/lunar_2021",
    isUniversal: true,
    specs: simpleSpecs([
      ["readability", "Readability", "0.01 g"],
      ["waterResistant", "Water resistant", "Yes"],
      ["priceEur", "Price", "309", "€"],
    ]),
  },
  {
    slug: "timemore-black-mirror-nano",
    name: "Timemore Black Mirror Nano scale",
    brand: "Timemore",
    category: "ACCESSORY",
    priceCents: 9900,
    shortBlurb: "Compact espresso scale with auto-timing modes.",
    imageUrl: "/img/products/timemore-black-mirror-nano.jpg",
    sourceUrl:
      "https://captncoffee.com/en/products/timemore-black-mirror-nano-digitale-waage",
    isUniversal: true,
    specs: simpleSpecs([
      ["readability", "Readability", "0.1 g"],
      ["timer", "Timer", "Auto-timing modes"],
      ["priceEur", "Price", "99", "€"],
    ]),
  },
  {
    slug: "motta-knock-box",
    name: "Motta stainless knock box",
    brand: "Motta",
    category: "ACCESSORY",
    priceCents: 4500,
    shortBlurb: "Stainless steel knock box for spent pucks.",
    imageUrl: "/img/products/motta-knock-box.png",
    sourceUrl: "https://www.cremashop.eu/en/products/motta/milk-jug-europa/778",
    isUniversal: true,
    specs: simpleSpecs([
      ["material", "Material", "Stainless steel"],
      ["priceEur", "Price", "45", "€"],
    ]),
  },
];

export const CATALOG: CatalogProduct[] = [
  ...MACHINES,
  ...GRINDERS,
  ...PORTAFILTERS,
  ...ACCESSORIES,
];

// Demo user's order history (Appendix C.4), oldest first.
export const DEMO_ORDERS: Array<{ monthsAgo: number; itemSlugs: string[] }> = [
  { monthsAgo: 36, itemSlugs: ["lelit-mara-x-v2", "motta-europa-350"] },
  {
    monthsAgo: 14,
    itemSlugs: [
      "option-o-lagom-casa",
      "normcore-v4-tamper-585",
      "normcore-puck-screen-585",
      "normcore-wdt-v3",
    ],
  },
  {
    monthsAgo: 8,
    itemSlugs: ["lelit-pla580m", "ims-b70-2tc-h285", "timemore-black-mirror-nano"],
  },
];

export const DEMO_COMPARE_LIST = ["lm-linea-mini-r", "lelit-bianca-v3"];
