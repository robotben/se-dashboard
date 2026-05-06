# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (Vite, http://localhost:5173)
npm run build    # Production build
npm run preview  # Preview production build
```

There is no test runner or linter configured.

## Architecture

Single-page React app (Vite + React 18) with no routing — the entire dashboard lives in two source files:

- `src/main.jsx` — Entry point. Renders a `Root` component that gates access via `src/Login.jsx`. Once authenticated (`authed` state flips to `true`), renders `<App />`.
- `src/Login.jsx` — Password prompt. Password is hardcoded as `VimeoP0w3r!` (client-side only, no backend).
- `src/App.jsx` — The entire dashboard (~1400+ lines). All components, data, and logic live here.

### App.jsx structure

**Data layer**: All data is hardcoded as static JS objects near the top of the file (`WIN_RATE_KPIS`, `DIFFERENTIAL_DATA`, `KEYWORD_DATA`, `HEATMAP_DATA`, `SE_STAGE_DATA`). The app also accepts CSV uploads — `parseCSV` / `parseCSVToObjects` parse uploaded files client-side, and the parsed data overrides the static fallbacks.

**Styling**: All styles are inline. No CSS files, no Tailwind, no CSS modules. Two color systems exist side-by-side: `COLORS`/`V`/`C` — all are Vimeo brand palette constants. Use `C.*` for new component styles (it's the most semantic alias); `V.*` for raw palette values; `COLORS.*` is the legacy alias.

**Shared components** (defined in App.jsx before the tabs):
- `Card` — bordered container with hover effect and optional left accent color
- `SectionLabel` — small uppercase label
- `ExportActions` — copy/download icon buttons (used with `handleExport`)
- `CustomTooltip` — Recharts tooltip with formatted values

**Tab components** (each is a named `const` in App.jsx):
- `AttachmentRateTab` — regional SE attachment stats with a sortable table
- `WinRateTab` — SE vs. no-SE win rate KPIs, deal-size differential bar chart
- `PovImpactTab` — POV/proof-of-concept win rate and cycle time
- `TechnicalFitTab` — technical fit scoring win rates and heatmap
- `LossAnalysisTab` — lost deal analysis

The main `App` component at the bottom manages `activeTab` state and the tab switcher nav. Tab order: `['Revenue Impact', 'Win Rate', 'Attachment Rate', 'POV Analysis', 'Technical Fit', 'Loss Analysis']`.

**NLP keyword extraction**: `extractKeywords` in App.jsx tokenizes deal notes into unigrams and bigrams, filtering against a large `STOP_WORDS` set. Used in the keyword frequency analysis cards.

**Chart library**: Recharts (`recharts` v2). All charts use `ResponsiveContainer` for responsive sizing.

**Export**: `handleExport` (in the main `App` component) uses `html2canvas` (loaded via CDN in `index.html`) to screenshot card elements by DOM id, then either copies to clipboard or downloads as PNG.
