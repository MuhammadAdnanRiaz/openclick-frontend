# OpenClick — Design System

Reference for the visual language used across the frontend. All tokens live in `src/tokens.css`.

---

## Typography

| Token | Value | Usage |
|-------|-------|-------|
| `--font-sans` | Geist, system-ui fallback | All UI text |
| `--font-mono` | Geist Mono, monospace fallback | Code, IDs, timestamps |
| `--fs-10` … `--fs-40` | 10px–40px | Size scale |

Common sizes:
- **Labels / meta**: `--fs-11`, `--fs-12`
- **Body / inputs**: `--fs-13`, `--fs-14`
- **Subheadings**: `--fs-15`, `--fs-16`
- **Headings**: `--fs-20`, `--fs-24`, `--fs-28`

---

## Spacing

| Token | Value |
|-------|-------|
| `--s-1` | 2px |
| `--s-2` | 4px |
| `--s-3` | 6px |
| `--s-4` | 8px |
| `--s-5` | 10px |
| `--s-6` | 12px |
| `--s-7` | 14px |
| `--s-8` | 16px |
| `--s-10` | 20px |
| `--s-12` | 24px |
| `--s-16` | 32px |
| `--s-20` | 40px |
| `--s-24` | 48px |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--r-xs` | 3px | Tiny chips |
| `--r-sm` | 5px | Small tags |
| `--r-md` | 6px | Buttons, inputs |
| `--r-lg` | 8px | Cards, panels |
| `--r-xl` | 12px | Modals, large cards |
| `--r-pill` | 999px | Avatars, badges |

---

## Brand Colors

Electric indigo is the primary accent:

| Token | Value |
|-------|-------|
| `--brand-500` | `#5B5BFF` — primary accent |
| `--brand-400` | `#7878FF` — hover (dark mode) |
| `--brand-600` | `#4747E5` — hover (light mode) |
| `--brand-700` | `#3939B8` — pressed / text links |
| `--brand-100` | `#E5E5FF` |
| `--brand-050` | `#F0F0FF` |

Semantic aliases (use these in components):
- `--accent` → brand-500
- `--accent-hover` → brand-400 (dark) / brand-600 (light)
- `--accent-subtle` → translucent brand tint (backgrounds)
- `--accent-text` → readable accent text

---

## Task Status Colors

| Status | Token | Hex |
|--------|-------|-----|
| Open | `--s-open-500` | `#3B82F6` (blue) |
| In Progress | `--s-progress-500` | `#F59E0B` (amber) |
| In Review | `--s-review-500` | `#8B5CF6` (violet) |
| Merged / Done | `--s-merged-500` | `#10B981` (emerald) |
| Closed | `--s-closed-500` | `#6B7280` (gray) |
| Blocked | `--s-blocked-500` | `#EF4444` (red) |

Background tints (translucent, for badges/rows): `--tint-open`, `--tint-progress`, `--tint-review`, `--tint-merged`, `--tint-closed`, `--tint-blocked`.

---

## Priority Colors

| Priority | Token | Hex |
|----------|-------|-----|
| Urgent | `--p-urgent` | `#EF4444` |
| High | `--p-high` | `#F59E0B` |
| Normal | `--p-normal` | `#3B82F6` |
| Low | `--p-low` | `#6B7280` |

---

## Themes

Default is **light**. Dark mode toggled via `data-theme="dark"` on `<html>`.

### Light mode
| Role | Token | Value |
|------|-------|-------|
| Page background | `--bg` | `#FAFAF7` |
| Surface | `--bg-surface` | `#FFFFFF` |
| Card | `--bg-card` | `#FFFFFF` |
| Hover | `--bg-hover` | `#F4F4F0` |
| Primary text | `--fg` | `#121217` |
| Muted text | `--fg-muted` | `#545461` |
| Subtle text | `--fg-subtle` | `#787886` |
| Border | `--border` | `#E4E4DC` |
| Border subtle | `--border-subtle` | `#EDEDE6` |
| Border strong | `--border-strong` | `#D0D0C7` |

### Dark mode
| Role | Token | Value |
|------|-------|-------|
| Page background | `--bg` | `#0B0B0F` |
| Surface | `--bg-surface` | `#111116` |
| Card | `--bg-card` | `#16161D` |
| Elevated | `--bg-elevated` | `#1D1D26` |
| Hover | `--bg-hover` | `#1A1A22` |
| Primary text | `--fg` | `#F5F5F7` |
| Muted text | `--fg-muted` | `#A8A8B3` |
| Subtle text | `--fg-subtle` | `#6E6E7A` |
| Border | `--border` | `#26262F` |
| Border subtle | `--border-subtle` | `#1D1D26` |
| Border strong | `--border-strong` | `#33333F` |

---

## Density

Controlled via `data-density` on `<html>`:

| Token | Comfortable | Compact |
|-------|------------|---------|
| `--row-h` | 36px | 28px |
| `--row-pad-y` | 8px | 5px |
| `--card-pad` | 12px | 10px |
| `--icon-btn` | 28px | 24px |

---

## Shadows

| Token | Usage |
|-------|-------|
| `--shadow-sm` | Subtle lift (buttons, chips) |
| `--shadow-md` | Dropdowns, tooltips |
| `--shadow-lg` | Modals, overlays |
| `--shadow-pop` | Popovers, command palette |

---

## Animation

| Token | Value | Usage |
|-------|-------|-------|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Most transitions — snappy out |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | Deliberate transitions |
| `--dur-fast` | `120ms` | Hover states, color changes |
| `--dur-base` | `180ms` | Panel slides, dropdowns |
| `--dur-slow` | `280ms` | Page-level transitions |

---

## Button Classes

| Class | Usage |
|-------|-------|
| `.oc-btn.oc-btn--primary` | Primary action — filled brand |
| `.oc-btn.oc-btn--secondary` | Secondary action — outlined |
| `.oc-btn.oc-btn--ghost` | Tertiary / destructive — no background |

---

## Logo

`.oc-logo` — square pill with brand gradient background, white "OC" text.

---

## Key UI Patterns

### Card
```jsx
style={{
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--r-lg)',
  padding: 'var(--card-pad)',
}}
```

### Section label
```jsx
style={{
  fontSize: 'var(--fs-11)',
  fontWeight: 600,
  color: 'var(--fg-subtle)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}}
```

### Inline icon + text
```jsx
<div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
  <Icon name="circle" size={14} style={{ color: 'var(--fg-subtle)' }} />
  <span style={{ fontSize: 'var(--fs-13)', color: 'var(--fg)' }}>Label</span>
</div>
```

### Focus ring
```jsx
boxShadow: 'var(--ring-focus)'  // always use the token, never replicate inline
```
