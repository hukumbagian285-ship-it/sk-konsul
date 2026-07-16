# Layout Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make sidebar collapsible to icon-only on desktop and restructure template detail page to full-viewport layout.

**Architecture:** Single-file changes to AppLayout.tsx (sidebar toggle + collapsed state in localStorage) and TemplateDetailPage.tsx (remove grid, stack rules above full-height iframe).

**Tech Stack:** React, Tailwind CSS, shadcn/ui, localStorage

## Global Constraints

- Sidebar collapse only affects desktop breakpoint (`md:`); mobile bottom nav unchanged
- Collapsed state persisted in `sk_sidebar_collapsed` localStorage key
- No new dependencies
- Follow existing Tailwind patterns in the codebase

---

### Task 1: Collapsible Sidebar

**Files:**
- Modify: `src/components/AppLayout.tsx`

- [ ] **Add collapse state + toggle button**

```tsx
// Add after the existing imports
const [collapsed, setCollapsed] = React.useState(() => {
  try { return localStorage.getItem("sk_sidebar_collapsed") === "true"; }
  catch { return false; }
});

function toggleSidebar() {
  setCollapsed((c) => {
    const next = !c;
    localStorage.setItem("sk_sidebar_collapsed", String(next));
    return next;
  });
}
```

- [ ] **Update the `<aside>` width classes**

Change `className="hidden w-56 shrink-0 ..."` to:
```tsx
className={`hidden shrink-0 border-r border-border bg-card transition-[width] duration-200 md:flex md:flex-col ${collapsed ? "w-16" : "w-56"}`}
```

- [ ] **Update the header logo area** — hide text when collapsed

```tsx
<div className="flex h-14 items-center gap-2 border-b border-border px-4">
  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-[10px] font-bold text-primary-foreground">SK</div>
  {!collapsed && (
    <div className="leading-tight">
      <p className="text-sm font-semibold">Konsultasi SK</p>
      <p className="text-[10px] text-muted-foreground">Bagian Hukum — Setda</p>
    </div>
  )}
</div>
```

- [ ] **Update NavLink** — keep icon always visible, conditionally show label

In the NavLink component, wrap the `<span>{label}</span>` in `{!collapsed && (...)}`.

- [ ] **Update admin section label**

Change `<p className="px-3 pt-4 pb-1 ...">Admin</p>` to only render when `!collapsed`.

- [ ] **Update user info + logout**

```tsx
<div className="border-t border-border px-3 py-3">
  {!collapsed ? (
    <>
      <p className="text-xs font-medium text-foreground">{user?.nama_lengkap}</p>
      <p className="text-[10px] capitalize text-muted-foreground">{user?.role}</p>
    </>
  ) : (
    <p className="text-center text-xs font-bold text-foreground">{user?.nama_lengkap?.charAt(0)}</p>
  )}
</div>
<button onClick={logout} className="flex items-center justify-center gap-2 border-t border-border px-4 py-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
  <LogOut size={16} />
  {!collapsed && <span>Keluar</span>}
</button>
```

- [ ] **Add collapse toggle button at the bottom of sidebar**

After the logout button:
```tsx
<button
  onClick={toggleSidebar}
  className="flex items-center justify-center gap-2 border-t border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
>
  <ChevronLeft size={16} className={`transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`} />
  {!collapsed && <span>Ciutkan</span>}
</button>
```

- [ ] **Add `ChevronLeft` to lucide-react import**

Add `ChevronLeft` to the import from "lucide-react".

- [ ] **Add `* as React` import**

Add `import * as React from "react";` at the top.

---

### Task 2: Template Detail Full-Page Layout

**Files:**
- Modify: `src/pages/TemplateDetailPage.tsx`

- [ ] **Replace the entire return block**

```tsx
export default function TemplateDetailPage() {
  const { id } = useParams();
  const { data: template, isLoading } = useTemplate(id);

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>;
  if (!template) return <div className="text-center text-muted-foreground">Template tidak ditemukan.</div>;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Link to="/templates" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={14} /> Kembali ke daftar template
      </Link>

      <h1 className="mb-1 font-display text-2xl font-semibold text-foreground">{template.nama_template}</h1>
      {template.deskripsi && <p className="mb-4 text-sm text-muted-foreground">{template.deskripsi}</p>}

      {template.aturan_penulisan && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Aturan Penulisan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-sm text-foreground">{template.aturan_penulisan}</div>
          </CardContent>
        </Card>
      )}

      <Card className="flex-1">
        <CardContent className="h-full p-0">
          <iframe
            src={`https://docs.google.com/document/d/${template.drive_file_id}/preview`}
            className="h-full w-full rounded-lg border-0"
            title="Pratinjau dokumen"
          />
        </CardContent>
      </Card>

      <a
        href={`https://docs.google.com/document/d/${template.drive_file_id}/edit`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline"
      >
        <ExternalLink size={14} /> Buka di Google Docs
      </a>
    </div>
  );
}
```

Wrap the children in `AppLayout.tsx` main tag with `flex flex-col` so the iframe can grow:

Find `<main className="flex-1 px-4 pt-4 pb-24 md:pb-6">` and change to:
```tsx
<main className="flex flex-1 flex-col px-4 pt-4 pb-24 md:pb-6">
```

- [ ] **Commit**

```bash
git add src/components/AppLayout.tsx src/pages/TemplateDetailPage.tsx
git commit -m "feat: collapsible sidebar + full-page template detail"
```
