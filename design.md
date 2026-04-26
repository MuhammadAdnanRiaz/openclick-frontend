# OpenClick — Design System

Reference for the visual language used across the frontend. All tokens live in `src/tokens.css`.

---

## Typography

### Font families
| Token | Value |
|-------|-------|
| `--font-sans` | Geist, ui-sans-serif, system-ui fallback |
| `--font-mono` | Geist Mono, ui-monospace fallback |

Base: `font-size: var(--fs-14)`, `line-height: 1.45`, `antialiased`. Font features: `cv11`, `ss01`, `ss03`.

### Size scale
| Token | Value |
|-------|-------|
| `--fs-10` | 10px |
| `--fs-11` | 11px |
| `--fs-12` | 12px |
| `--fs-13` | 13px |
| `--fs-14` | 14px (base) |
| `--fs-15` | 15px |
| `--fs-16` | 16px |
| `--fs-18` | 18px |
| `--fs-20` | 20px |
| `--fs-24` | 24px |
| `--fs-28` | 28px |
| `--fs-32` | 32px |
| `--fs-40` | 40px |

### Typography utility classes
| Class | Description |
|-------|-------------|
| `.t-display` | 28px / 700 / -0.02em — page-level hero text |
| `.t-h1` | 20px / 600 / -0.015em |
| `.t-h2` | 16px / 600 / -0.01em |
| `.t-h3` | 14px / 600 |
| `.t-body` | 14px / 400 / lh 1.5 |
| `.t-small` | 13px / 400 / fg-muted |
| `.t-caption` | 12px / 400 / fg-muted |
| `.t-micro` | 11px / 500 / fg-muted |
| `.t-label` | 11px / 600 / uppercase / 0.06em tracking / fg-subtle |
| `.t-mono` | Geist Mono / 12px / 500 / no ligatures |
| `.t-mono-sm` | Geist Mono / 11px / 500 |
| `.t-muted` | color: fg-muted |
| `.t-subtle` | color: fg-subtle |
| `.t-fg` | color: fg |

---

## Spacing

| Token | Value |
|-------|-------|
| `--s-0` | 0 |
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
| `--s-14` | 28px |
| `--s-16` | 32px |
| `--s-20` | 40px |
| `--s-24` | 48px |
| `--s-32` | 64px |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--r-xs` | 3px | Kbd badges |
| `--r-sm` | 5px | Chips, tags |
| `--r-md` | 6px | Buttons, inputs |
| `--r-lg` | 8px | Cards, panels |
| `--r-xl` | 12px | Modals, large cards |
| `--r-pill` | 999px | Avatars, badges |

---

## Brand Colors

Electric indigo accent:

| Token | Value |
|-------|-------|
| `--brand-500` | `#5B5BFF` — primary accent |
| `--brand-400` | `#7878FF` — hover in dark mode |
| `--brand-600` | `#4747E5` — hover in light mode |
| `--brand-700` | `#3939B8` — pressed / text links in light mode |
| `--brand-100` | `#E5E5FF` |
| `--brand-050` | `#F0F0FF` |

Semantic aliases (always prefer these in components):

| Token | Dark | Light |
|-------|------|-------|
| `--accent` | brand-500 | brand-500 |
| `--accent-hover` | brand-400 | brand-600 |
| `--accent-subtle` | rgba(91,91,255,0.16) | rgba(91,91,255,0.10) |
| `--accent-text` | `#C4C4FF` | brand-700 |

---

## Task Status Colors

| Status | Token | Hex |
|--------|-------|-----|
| Open | `--s-open-500` | `#3B82F6` |
| In Progress | `--s-progress-500` | `#F59E0B` |
| In Review | `--s-review-500` | `#8B5CF6` |
| Merged / Done | `--s-merged-500` | `#10B981` |
| Closed | `--s-closed-500` | `#6B7280` |
| Blocked | `--s-blocked-500` | `#EF4444` |

Translucent tints (theme-aware, for chip backgrounds): `--tint-open`, `--tint-progress`, `--tint-review`, `--tint-merged`, `--tint-closed`, `--tint-blocked`.

---

## Priority Colors

| Priority | Token | Hex |
|----------|-------|-----|
| Urgent | `--p-urgent` | `#EF4444` |
| High | `--p-high` | `#F59E0B` |
| Normal | `--p-normal` | `#3B82F6` |
| Low | `--p-low` | `#6B7280` (`.oc-pri--low` renders as transparent + inset border) |

---

## Themes

CSS default (`:root`) is **dark**. `App.jsx` sets `data-theme="light"` on mount, making light the effective app default. Toggle dark mode by setting `data-theme="dark"` on `<html>`.

### Full token table (both themes)

| Token | Light | Dark |
|-------|-------|------|
| `--bg` | `#FAFAF7` | `#0B0B0F` |
| `--bg-sunken` | `#F2F2EE` | `#07070A` |
| `--bg-surface` | `#FFFFFF` | `#111116` |
| `--bg-card` | `#FFFFFF` | `#16161D` |
| `--bg-elevated` | `#FFFFFF` | `#1D1D26` |
| `--bg-hover` | `#F4F4F0` | `#1A1A22` |
| `--bg-press` | `#ECECE6` | `#22222C` |
| `--bg-selected` | rgba(91,91,255,0.10) | rgba(91,91,255,0.14) |
| `--fg` | `#121217` | `#F5F5F7` |
| `--fg-muted` | `#545461` | `#A8A8B3` |
| `--fg-subtle` | `#787886` | `#6E6E7A` |
| `--fg-faint` | `#A8A8B3` | `#4A4A55` |
| `--fg-inverse` | `#FFFFFF` | `#0B0B0F` |
| `--border` | `#E4E4DC` | `#26262F` |
| `--border-subtle` | `#EDEDE6` | `#1D1D26` |
| `--border-strong` | `#D0D0C7` | `#33333F` |
| `--border-focus` | brand-500 | brand-500 |
| `--ring-focus` | `0 0 0 2px bg, 0 0 0 4px brand-500` | same |

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
| `--shadow-sm` | Subtle lift — buttons, chips |
| `--shadow-md` | Dropdowns, tooltips |
| `--shadow-lg` | Modals, overlays |
| `--shadow-pop` | Popovers, command palette |

---

## Animation

| Token | Value | Usage |
|-------|-------|-------|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Most transitions — snappy deceleration |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | Deliberate transitions |
| `--dur-fast` | `120ms` | Hover states, color changes |
| `--dur-base` | `180ms` | Panel slides, dropdowns |
| `--dur-slow` | `280ms` | Page-level transitions |

### Named keyframes
| Name | Effect |
|------|--------|
| `oc-fade-in` | opacity 0→1 |
| `oc-scale-in` | opacity 0→1 + scale 0.98→1 + translateY -6→0 |
| `oc-slide-in-r` | translateX 16→0 + opacity 0→1 |

---

## Global Component Classes

### Buttons — `.oc-btn`
Base: `height: 28px`, `padding: 0 10px`, `border-radius: var(--r-md)`, `font-size: var(--fs-13)`.

| Modifier | Description |
|----------|-------------|
| `.oc-btn--primary` | Filled brand-500 background, white text |
| `.oc-btn--secondary` | bg-card background, border |
| `.oc-btn--ghost` | No background, fg-muted text |
| `.oc-btn--lg` | height 34px, padding 0 14px, fs-14 |
| `.oc-btn--sm` | height 24px, padding 0 8px, fs-12, r-sm |
| `.oc-btn--icon` | Square — width `var(--icon-btn)`, no horizontal padding |

### Status chips — `.oc-chip`
Base: `height: 20px`, `padding: 0 7px`, `border-radius: var(--r-sm)`, `font-size: var(--fs-11)`.

| Modifier | Colors |
|----------|--------|
| `.oc-chip--open` | tint-open bg / s-open-500 text |
| `.oc-chip--progress` | tint-progress bg / s-progress-500 text |
| `.oc-chip--review` | tint-review bg / s-review-500 text |
| `.oc-chip--merged` | tint-merged bg / s-merged-500 text |
| `.oc-chip--closed` | tint-closed bg / fg-muted text |
| `.oc-chip--blocked` | tint-blocked bg / s-blocked-500 text |
| `.oc-chip--outline` | transparent bg / border / fg-muted text |

### Priority dot — `.oc-pri`
8×8px circle, `border-radius: 999px`.

| Modifier | Color |
|----------|-------|
| `.oc-pri--urgent` | p-urgent |
| `.oc-pri--high` | p-high |
| `.oc-pri--normal` | p-normal |
| `.oc-pri--low` | transparent with border |

### Card — `.oc-card`
`background: var(--bg-card)`, `border: 1px solid var(--border-subtle)`, `border-radius: var(--r-lg)`, `padding: var(--card-pad)`.

### Avatar — `.oc-avatar`
22×22px circle, white text, `font-size: var(--fs-10)`, `font-weight: 600`.

| Modifier | Size |
|----------|------|
| `.oc-avatar--lg` | 28×28px / fs-11 |
| `.oc-avatar--sm` | 18×18px / 9px |
| `.oc-avatar-stack` | Overlapping stack — each avatar offset -6px with bg-card ring |

### Input — `.oc-input`
`height: 28px`, `padding: 0 10px`, `bg-card` background, `border: 1px solid var(--border)`, `border-radius: var(--r-md)`, `font-size: var(--fs-13)`. Focus: brand-500 border + accent-subtle ring.

### Keyboard badge — `.oc-kbd`
18px height, Geist Mono / 10px, bg-card background with border, `border-radius: var(--r-xs)`.

### Dividers
| Class | Description |
|-------|-------------|
| `.oc-divider-h` | Full-width 1px horizontal line, border-subtle color |
| `.oc-divider-v` | 1px vertical line, stretches to container height |
| `.oc-hairline` | Alias — same as divider-h |

### Branch badge — `.oc-branch`
18px height, Geist Mono / fs-11, `accent-subtle` background, `accent-text` color. Use for git branch names.

### PR badge — `.oc-pr`
18px height, Geist Mono / fs-11.

| Modifier | Colors |
|----------|--------|
| `.oc-pr--open` | tint-open / s-open-500 |
| `.oc-pr--draft` | tint-closed / fg-muted |
| `.oc-pr--merged` | tint-merged / s-merged-500 |

### Logo — `.oc-logo`
22×22px, `border-radius: var(--r-md)`, `background: var(--fg)`, `color: var(--bg)` — inverts with theme. Geist Mono / fs-12 / 700.

---

## Key Inline Patterns

### Card (inline)
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
  letterSpacing: '0.06em',
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
boxShadow: 'var(--ring-focus)'  // never replicate inline
```

---

## Global Defaults

- `box-sizing: border-box` on all elements
- Custom scrollbar: 10px, `var(--border)` thumb with 2px `var(--bg)` gap
- `::selection`: brand-500 background, white text
