# Take log (M6)

## Harness-verified takes — 2026-08-21

Five cold takes of the **Prompt 1 + Prompt 2 tool traces**, executed through the
browser's real WebMCP API (`document.modelContext.executeTool`, the same call
path `chrome-devtools-mcp` uses), in headless Chrome 151 with
`--enable-features=WebMCP`. Database reset to the canonical demo state between
takes; page reloaded cold each take.

Checks per take: compare list = LM+Bianca · ≥10 differing rows ·
9 gear items · LM INCOMPATIBLE with `lm-home-bottomless` fix ·
Bianca COMPATIBLE · highlight collapses table to ≤6 full-opacity rows with
note banner · water filter found by category search · PLA930M fits Bianca ·
BARISTA10 available · cart total €2,096.01 · drawer auto-opened.

| Take | Result | Trace |
|---|---|---|
| 1 | ✅ 11/11 checks | get_compare_list → compare_products → get_my_gear → check_compatibility ×2 → highlight_differences → clear_highlights → search_products → check_compatibility → get_my_coupons → add_to_cart ×2 → apply_coupon |
| 2 | ✅ 11/11 checks | (same) |
| 3 | ✅ 11/11 checks | (same) |
| 4 | ✅ 11/11 checks | (same) |
| 5 | ✅ 11/11 checks | (same) |

**5/5 passed** (requirement: ≥3/5). `checkout` was never called during
Prompt 1/2 — it was exercised separately and produced the confetti, banner,
empty cart and a new order visible in `get_my_gear`.

## Agent-driven takes (to run before recording)

The takes above verify the tools, data, math and UI deterministically; they do
not exercise an LLM's tool *choice*. Before recording, run Prompt 1 and
Prompt 2 verbatim from a fresh Claude Code session against the flagged Chrome
tab (logged in as `vince`, `npm run demo:reset` between takes) and append the
results here:

| Take | Prompt 1 | Prompt 2 | Notes |
|---|---|---|---|
| 1 | | | |
| 2 | | | |
| 3 | | | |
| 4 | | | |
| 5 | | | |

If the agent skips `highlight_differences` or over-calls
`get_product_details`, tighten the tool descriptions in
`src/webmcp/WebMCPTools.tsx` — never script the behavior.
