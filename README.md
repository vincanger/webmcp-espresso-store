# Crema & Co. — a WebMCP espresso store (Wasp demo)

A demo web store built with **Wasp 0.25** whose queries and actions are exposed to AI agents via **WebMCP**. An agent connected to the browser tab can compare espresso machines, check compatibility against your past purchases, visually highlight the spec rows that drove its recommendation, and put the right items in the cart — with the UI updating live through Wasp's automatic query invalidation.

## Prerequisites

- Node ≥ 24, Docker, `npm i -g @wasp.sh/wasp-cli@latest` (Wasp 0.25)
- **Chrome 149+** (151+ recommended) with WebMCP enabled:
  - `chrome://flags/#enable-webmcp-testing` → **Enabled** → Relaunch
    (or launch Chrome with `--enable-features=WebMCP`)
  - `chrome://inspect/#remote-debugging` → allow remote debugging
  - Sanity check in DevTools: `'modelContext' in document` → `true`
- Optional: the [Model Context Tool Inspector](https://chromewebstore.google.com/detail/webmcp-model-context-tool/gbpdfapgefenggkahomfgkhfehlcenpd) extension.

## Setup

```bash
npm install && wasp install
wasp db start
wasp db migrate-dev
wasp db seed devSeed
wasp start
```

The app runs on **http://localhost:3000** (API on :3101 — configured in `vite.config.ts`, `.env.server`, `.env.client`; change these back to Vite/Wasp defaults if 3000/3001 are free on your machine).

**Demo user:** `vince` / `espresso123` — owns a Lelit Mara X V2, a Lagom Casa grinder and a drawer of 58 mm accessories across 3 past orders; has coupon `BARISTA10` (10 %); compare list pre-loaded with the Linea Mini R and the Bianca V3.

## Connecting an agent

`.mcp.json` (repo root, for Claude Code):

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest", "--categoryExperimentalWebmcp", "--autoConnect", "--no-usage-statistics"]
    }
  }
}
```

Claude Desktop: the same `mcpServers` block in `claude_desktop_config.json` (Settings → Developer → Edit Config); use an absolute path to `npx` if Node isn't found. Before recording, set `execute_webmcp_tool` to "always allow" (Claude Code) / "Allow always" (Desktop) so takes aren't interrupted by permission prompts.

Make sure the `localhost:3002` tab is the focused tab in the flagged Chrome — the badge bottom-right shows the live tool count: **16 tools logged in, 3 logged out** (the milestone plan says 17; its own tool table enumerates 16).

## Demo script

Reset state between takes:

```bash
npm run demo:reset
```

Setup: logged in as `vince`, on `/compare`, cart empty, highlights cleared (reload the tab).

**Prompt 1** — *"Upgrading from my Mara X. I make flat whites for two every morning and the counter spot is 32 cm wide. Which of these two?"*

Expected trace: `get_compare_list` → `compare_products` → `get_my_gear` → `check_compatibility` ×2 → `highlight_differences` (≈ widthCm, portafilterFit, priceEur, flowControl, steamBoilerL + note). Expected answer: **Bianca V3** — 29 cm fits the 32 cm spot (Linea Mini is 35.7), every accessory carries over (the LM needs its own €179 portafilter), flow paddle, ~€3,000 less.

**Prompt 2** — *"Bianca in white, plus a water filter that fits it, and use whatever discount I've got."*

Expected trace: `search_products({category:"WATER_FILTER"})` → `check_compatibility(lelit-pla930m vs lelit-bianca-v3)` → `get_my_coupons` → `add_to_cart` ×2 → `apply_coupon` — and **no `checkout`**. Cart drawer opens by itself: Bianca V3 (white) €2,299.00 + PLA930M €29.90, coupon BARISTA10 −€232.89, total **€2,096.01**.

**Prompt 3 (optional)** — *"Place the order."* → `checkout` → confetti, "Order #N placed" banner, cart empties, order appears on `/orders`.

## Development

```bash
npm test            # compatibility engine + seed invariants (Vitest)
npm run demo:reset  # restore vince's canonical demo state
```

The compatibility rules live in `src/shared/compatibility.ts` (pure, fully unit-tested); WebMCP tool registrations in `src/webmcp/WebMCPTools.tsx`.

## Spec sources

Product specs were researched from manufacturer/retailer pages — every product's page links its `sourceUrl`. **Prices are approximate EU street prices incl. VAT, August 2026.** Key sources: lamarzocco.com · lelit.com · profitec-espresso.com · sageappliances.com · option-o.com · df64coffee.com · mahlkoniguk.co.uk · baratza.com · normcorewares.com · coffeedesk.com · caffewerks.com · cremashop.eu · eu.acaia.co · captncoffee.com · home.lamarzoccousa.com · espressocoffeeshop.com · kaffeemacher.de · wholelattelove.com. Product images are pulled from these pages for demo purposes only.
