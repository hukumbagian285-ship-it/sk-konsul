# Task 2: Template Detail Full-Page Layout

## What was implemented
- Restructured `TemplateDetailPage.tsx`: removed grid layout, moved "Aturan Penulisan" card above the iframe, made iframe fill available space with `flex-1`
- Updated `AppLayout.tsx`: changed `<main>` className from `flex-1` to `flex flex-1 flex-col` so the iframe can grow vertically
- Note: "Aturan Penulisan" now only renders when `template.aturan_penulisan` is truthy (no more "Belum ada aturan penulisan." placeholder)

## What was tested
- `npm run build` — compiles and builds successfully (tsc + vite)

## Files changed
- `src/pages/TemplateDetailPage.tsx` — 19 insertions, 28 deletions
- `src/components/AppLayout.tsx` — 1 line changed: `flex-1` → `flex flex-1 flex-col`

## Self-review findings
- Clean build, no type errors
- The "Aturan Penulisan" card placement was moved per brief — now above the iframe instead of sidebar
- The iframe is no longer constrained by `aspect-[4/3]`; it fills via parent `flex-1` chain
- One behavioral change: removed the "Belum ada aturan penulisan." fallback text — if no rules, the card doesn't render at all (matches brief code)

## Any issues
- None
