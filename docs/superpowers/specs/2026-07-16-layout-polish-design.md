# Layout Polish — Collapsible Sidebar + Template Detail Full Page

## Overview
Two UI improvements: (1) sidebar desktop collapsible to icon-only, (2) template detail page fills viewport with rules above full-height iframe.

## Changes

### 1. Collapsible Sidebar (AppLayout.tsx)
- **Desktop only** — no change to mobile bottom nav
- Toggle button (chevron-left/right) at bottom of sidebar
- Expanded: current `w-56`, all labels visible
- Collapsed: `w-16`, only icons, user info shows just avatar initial, logout icon-only
- State persisted in localStorage (`sk_sidebar_collapsed`)

### 2. Template Detail Page (TemplateDetailPage.tsx)
- Remove `max-w-4xl` constraint
- Remove grid layout (`lg:grid-cols-[1fr_320px]`)
- Remove right sidebar card ("Aturan Penulisan")
- Move aturan_penulisan into a card wrapper above the iframe preview
- Iframe: full width, responsive height (min-h-[70vh] or aspect ratio)
- Layout: title → deskripsi → rules card → iframe

### 3. Mobile
- Bottom nav unchanged (already working)
- Template detail: same stacked layout works naturally on mobile
