// The identical, ordered key set every MACHINE's `specs` must have (C.3, padded to 40).
// Shared: the server builds compare rows from it, the client uses it for the
// highlight_differences tool's spec_keys enum.

export type SpecGroup = "Brewing" | "Steam" | "Practical" | "Other";

export const MACHINE_SPEC_KEYS: Array<{
  key: string;
  label: string;
  group: SpecGroup;
  unit?: string;
}> = [
  // Brewing
  { key: "boilerConfig", label: "Boiler configuration", group: "Brewing" },
  { key: "brewBoilerL", label: "Brew boiler", group: "Brewing", unit: "L" },
  { key: "groupType", label: "Group type", group: "Brewing" },
  { key: "portafilterFit", label: "Portafilter fit", group: "Brewing" },
  { key: "basketMm", label: "Basket size", group: "Brewing", unit: "mm" },
  { key: "pid", label: "PID temperature control", group: "Brewing" },
  { key: "preInfusion", label: "Pre-infusion", group: "Brewing" },
  { key: "flowControl", label: "Flow control", group: "Brewing" },
  { key: "pumpType", label: "Pump type", group: "Brewing" },
  { key: "brewPressureGauge", label: "Brew pressure gauge", group: "Brewing" },
  { key: "shotTimer", label: "Shot timer", group: "Brewing" },
  // Steam
  { key: "steamBoilerL", label: "Steam boiler", group: "Steam", unit: "L" },
  {
    key: "simultaneousBrewSteam",
    label: "Simultaneous brew + steam",
    group: "Steam",
  },
  { key: "steamWand", label: "Steam wand", group: "Steam" },
  { key: "hotWaterSpout", label: "Hot water spout", group: "Steam" },
  // Practical
  { key: "heatUpMinutes", label: "Heat-up time", group: "Practical" },
  { key: "widthCm", label: "Width", group: "Practical", unit: "cm" },
  { key: "depthCm", label: "Depth", group: "Practical", unit: "cm" },
  { key: "heightCm", label: "Height", group: "Practical", unit: "cm" },
  { key: "weightKg", label: "Weight", group: "Practical", unit: "kg" },
  { key: "waterTankL", label: "Water tank", group: "Practical", unit: "L" },
  { key: "waterTankPosition", label: "Water tank position", group: "Practical" },
  { key: "plumbable", label: "Plumbable", group: "Practical" },
  { key: "noiseDb", label: "Noise level", group: "Practical" },
  { key: "wattage", label: "Power", group: "Practical", unit: "W" },
  { key: "voltage", label: "Voltage", group: "Practical", unit: "V" },
  { key: "cupClearanceCm", label: "Cup clearance", group: "Practical", unit: "cm" },
  { key: "dripTray", label: "Drip tray", group: "Practical" },
  { key: "ecoMode", label: "Eco / standby mode", group: "Practical" },
  { key: "autoOff", label: "Auto-off", group: "Practical" },
  { key: "appControl", label: "App control", group: "Practical" },
  { key: "caseMaterial", label: "Case material", group: "Practical" },
  { key: "boilerMaterial", label: "Boiler material", group: "Practical" },
  { key: "powerCableM", label: "Power cable length", group: "Practical", unit: "m" },
  // Other
  { key: "display", label: "Display", group: "Other" },
  { key: "warrantyYears", label: "Warranty", group: "Other", unit: "years" },
  { key: "colorOptions", label: "Color options", group: "Other" },
  { key: "madeIn", label: "Made in", group: "Other" },
  { key: "certification", label: "Certification", group: "Other" },
  { key: "priceEur", label: "Price", group: "Other", unit: "€" },
];

export const MACHINE_SPEC_KEY_NAMES = MACHINE_SPEC_KEYS.map((k) => k.key);
