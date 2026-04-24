# OpenClick — Design System Reference

Complete design documentation. Source of truth for all visual decisions. Read before designing or building any new UI.

---

## Design Philosophy

**Dark-first, light-equal.** The default theme is dark (`#0B0B0F` background). A light theme (`#FAFAF7`) exists and must always work equally well — design for both.

**Flat + functional.** No gradients except for subtle brand accents. No decorative shadows. Shadows exist to communicate elevation, not decoration.

**Monospace as identity.** IDs, branches, commit SHAs, keyboard shortcuts, and metrics always use Geist Mono. It signals "this is data" vs "this is content."

**Content-dense but breathable.** Engineering tools require density. The 8px spacing grid maintains rhythm without cramping. Two density modes (`comfortable`, `compact`) let users choose.

**Git-native vocabulary.** Branches, PRs, commits, and status states are first-class UI citizens, not metadata footnotes.

---

## Fonts

Loaded from Google Fonts CDN in `tokens.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&family=Geist+Mono:wght@400;500;600&display=swap');
```

| Variable | Value | Usage |
|----------|-------|-------|
| `--font-sans` | `'Geist', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif` | All UI text |
| `--font-mono` | `'Geist Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace` | IDs, branches, SHAs, code, kbd |

---

## Type Scale

All sizes are defined as CSS variables and must be used via variable names, never raw numbers.

| Variable | Value | Class | Usage |
|----------|-------|-------|-------|
| `--fs-10` | 10px | — | Avatar initials, micro labels |
| `--fs-11` | 11px | `.t-micro`, `.t-mono-sm`, `.t-label` | Timestamps, uppercase labels |
| `--fs-12` | 12px | `.t-caption`, `.t-mono` | Secondary text, metadata |
| `--fs-13` | 13px | `.t-small` | Body secondary, list rows |
| `--fs-14` | 14px | `.t-body` | Primary body text, base size |
| `--fs-15` | 15px | — | Search input |
| `--fs-16` | 16px | `.t-h2` | Section headings |
| `--fs-18` | 18px | — | Occasional emphasis |
| `--fs-20` | 20px | `.t-h1` | Page headings |
| `--fs-24` | 24px | — | Task titles |
| `--fs-28` | 28px | `.t-display` | Modal/panel display headings |
| `--fs-32` | 32px | — | Marketing/auth large headings |
| `--fs-40` | 40px | — | Hero / landing display text |

### Typography utility classes

```css
.t-display  /* 28px / 700 / -0.02em / lh 1.1 */
.t-h1       /* 20px / 600 / -0.015em / lh 1.2 */
.t-h2       /* 16px / 600 / -0.01em / lh 1.3 */
.t-h3       /* 14px / 600 / lh 1.35 */
.t-body     /* 14px / 400 / lh 1.5 */
.t-small    /* 13px / 400 / lh 1.45 / fg-muted */
.t-caption  /* 12px / 400 / fg-muted */
.t-micro    /* 11px / 500 / fg-muted */
.t-label    /* 11px / 600 / UPPERCASE / tracking 0.06em / fg-subtle */
.t-mono     /* 12px / 500 / Geist Mono */
.t-mono-sm  /* 11px / 500 / Geist Mono */
.t-muted    /* color: var(--fg-muted) */
.t-subtle   /* color: var(--fg-subtle) */
.t-fg       /* color: var(--fg) */
```

---

## Color System

### Brand (Electric Indigo)

| Token | Hex | Usage |
|-------|-----|-------|
| `--brand-050` | `#F0F0FF` | Lightest tint (light mode backgrounds) |
| `--brand-100` | `#E5E5FF` | Light tint |
| `--brand-400` | `#7878FF` | Hover state of primary buttons |
| `--brand-500` | `#5B5BFF` | **Primary accent** — buttons, focus rings, active states |
| `--brand-600` | `#4747E5` | Hover (light mode) |
| `--brand-700` | `#3939B8` | Pressed / text on light |

### Dark theme surfaces (default)

| Token | Value | Description |
|-------|-------|-------------|
| `--bg` | `#0B0B0F` | Page background |
| `--bg-sunken` | `#07070A` | Inset areas, sidebar |
| `--bg-surface` | `#111116` | Sidebar, secondary surfaces |
| `--bg-card` | `#16161D` | Cards, inputs |
| `--bg-elevated` | `#1D1D26` | Modals, dropdowns, popovers |
| `--bg-hover` | `#1A1A22` | Hover state on rows/items |
| `--bg-press` | `#22222C` | Active/pressed state |
| `--bg-selected` | `rgba(91,91,255,0.14)` | Selected items, active nav |

### Dark theme foreground

| Token | Value | Description |
|-------|-------|-------------|
| `--fg` | `#F5F5F7` | Primary text |
| `--fg-muted` | `#A8A8B3` | Secondary text, placeholders |
| `--fg-subtle` | `#6E6E7A` | Tertiary text, dividers |
| `--fg-faint` | `#4A4A55` | Barely visible hints |
| `--fg-inverse` | `#0B0B0F` | Text on light backgrounds |

### Dark theme borders

| Token | Value | Usage |
|-------|-------|-------|
| `--border` | `#26262F` | Standard borders |
| `--border-subtle` | `#1D1D26` | Dividers, hairlines |
| `--border-strong` | `#33333F` | Hover/emphasis borders |
| `--border-focus` | `var(--brand-500)` | Focus state border |

### Dark theme accent aliases

| Token | Value |
|-------|-------|
| `--accent` | `var(--brand-500)` — `#5B5BFF` |
| `--accent-hover` | `var(--brand-400)` — `#7878FF` |
| `--accent-subtle` | `rgba(91, 91, 255, 0.16)` |
| `--accent-text` | `#C4C4FF` |

### Light theme overrides (`[data-theme="light"]`)

| Token | Value |
|-------|-------|
| `--bg` | `#FAFAF7` |
| `--bg-surface` | `#FFFFFF` |
| `--bg-card` | `#FFFFFF` |
| `--bg-elevated` | `#FFFFFF` |
| `--fg` | `#121217` |
| `--fg-muted` | `#545461` |
| `--accent-text` | `var(--brand-700)` — `#3939B8` |
| Shadows | Lighter, less opacity |

### Status colors

Used across chips, dots, Kanban columns, calendar events, Gantt bars.

| Status | Token | Hex | Tint token |
|--------|-------|-----|-----------|
| Open | `--s-open-500` | `#3B82F6` | `--tint-open` |
| In Progress | `--s-progress-500` | `#F59E0B` | `--tint-progress` |
| In Review | `--s-review-500` | `#8B5CF6` | `--tint-review` |
| Merged / Done | `--s-merged-500` | `#10B981` | `--tint-merged` |
| Backlog / Closed | `--s-closed-500` | `#6B7280` | `--tint-closed` |
| Blocked | `--s-blocked-500` | `#EF4444` | `--tint-blocked` |

**Tints** are `rgba(…, 0.16–0.20)` — used as chip backgrounds and Gantt bar fills.

### Priority colors

| Priority | Token | Hex |
|----------|-------|-----|
| Urgent | `--p-urgent` | `#EF4444` |
| High | `--p-high` | `#F59E0B` |
| Normal | `--p-normal` | `#3B82F6` |
| Low | `--p-low` | `#6B7280` (ring, no fill) |

### Avatar colors

10 colors in order, assigned by `hashStr(name) % 10`:

```js
['#5B5BFF','#10B981','#F59E0B','#EF4444','#8B5CF6',
 '#EC4899','#06B6D4','#F97316','#84CC16','#14B8A6']
```

---

## Spacing Scale

Based on a 2px unit. Use CSS variables, not raw pixels.

| Variable | Value | Common use |
|----------|-------|-----------|
| `--s-1` | 2px | Micro gaps |
| `--s-2` | 4px | Icon-text gap, tight grouping |
| `--s-3` | 6px | Chip padding, small gaps |
| `--s-4` | 8px | Standard gap, list item padding |
| `--s-5` | 10px | Button padding |
| `--s-6` | 12px | Card padding (compact) |
| `--s-8` | 16px | Card padding (comfortable), section gaps |
| `--s-10` | 20px | Larger section spacing |
| `--s-12` | 24px | Major section dividers |
| `--s-16` | 32px | Page-level spacing |
| `--s-20` | 40px | Auth screen vertical rhythm |
| `--s-24` | 48px | Large layout gaps |
| `--s-32` | 64px | Hero spacing |

---

## Border Radius Scale

| Variable | Value | Usage |
|----------|-------|-------|
| `--r-xs` | 3px | Code spans, kbd chips |
| `--r-sm` | 5px | Chips, filter tags |
| `--r-md` | 6px | Buttons, inputs, dropdowns |
| `--r-lg` | 8px | Cards, popovers |
| `--r-xl` | 12px | Modals, command palette |
| `--r-pill` | 999px | Avatars, badges, pills |

---

## Shadow System

| Variable | Dark value | Light value | Usage |
|----------|-----------|-------------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.4)` | `0 1px 2px rgba(15,15,30,0.06)` | Subtle lift, hint buttons |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.35) + 1px white ring` | Lighter | Cards, popovers |
| `--shadow-lg` | `0 16px 48px rgba(0,0,0,0.55) + 1px white ring` | Lighter | Modals, task detail panel |
| `--shadow-pop` | `0 12px 32px rgba(0,0,0,0.5) + 1px white ring` | Lighter | Command palette, dropdowns |

---

## Animation

### Timing

| Variable | Value | Use for |
|----------|-------|---------|
| `--dur-fast` | 120ms | Hover state transitions (colors, borders) |
| `--dur-base` | 180ms | Standard UI transitions |
| `--dur-slow` | 280ms | Panels sliding in, modals appearing |

### Easing

| Variable | Value | Use for |
|----------|-------|---------|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Everything entering the screen |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | Panels, drawers, smooth transitions |

### Keyframes (defined in `tokens.css`)

| Name | Description | Usage |
|------|-------------|-------|
| `oc-fade-in` | `opacity: 0 → 1` | Scrim overlays, page-level fades |
| `oc-scale-in` | `scale(0.98) + translateY(-6px) → normal` | Modals, dropdowns, command palette |
| `oc-slide-in-r` | `translateX(16px) → 0` | Task detail panel from right |

### Keyframes (defined inline in `AuthView.jsx`)

| Name | Description | Usage |
|------|-------------|-------|
| `oc-auth-in` | `scale(0.97) + translateY(8px) → normal` | Auth screen transitions |
| `oc-spin` | `rotate(0 → 360deg)` | Loading spinners |

### Rules

- Hover/border/color transitions: always use `transition: … var(--dur-fast)` — never hardcode `150ms`.
- Panel/modal enter: `animation: oc-slide-in-r 280ms var(--ease-out)` or `oc-scale-in 180ms var(--ease-out)`.
- Never animate `width`, `height`, or `left`/`top` — use `transform`.
- Use `opacity + transform` only.
- Respect `prefers-reduced-motion` for non-essential animations.

---

## Focus Ring

```css
--ring-focus: 0 0 0 2px var(--bg), 0 0 0 4px var(--brand-500);
```

Applied via `.oc-btn:focus-visible { box-shadow: var(--ring-focus); }`. Use this pattern for any custom interactive element.

---

## Component Class Reference

### Buttons

```
.oc-btn              Base: 28px height, 10px h-pad, --r-md, Geist 13px/500
.oc-btn--primary     Brand background, white text
.oc-btn--secondary   Card background, standard border
.oc-btn--ghost       Transparent, fg-muted text
.oc-btn--lg          34px height, 14px font
.oc-btn--sm          24px height, 12px font
.oc-btn--icon        Square: width = height = var(--icon-btn)
```

`--icon-btn` is `28px` in comfortable density, `24px` in compact.

### Status chips

```
.oc-chip             Base chip: 20px h, 7px h-pad, --r-sm, 11px/500
.oc-chip--open
.oc-chip--progress
.oc-chip--review
.oc-chip--merged
.oc-chip--closed
.oc-chip--blocked
.oc-chip--outline    Transparent bg, standard border, fg-muted
```

### Priority dots

```
.oc-pri              8px × 8px filled circle
.oc-pri--urgent      Red fill
.oc-pri--high        Amber fill
.oc-pri--normal      Blue fill
.oc-pri--low         Transparent + border ring (no fill)
```

### Avatars

```
.oc-avatar           22px circle, 10px initials
.oc-avatar--lg       28px circle, 11px initials
.oc-avatar--sm       18px circle, 9px initials
.oc-avatar-stack     Stacked group, −6px overlap, 2px bg border between
```

### Git UI

```
.oc-branch           Branch pill: accent-subtle bg, accent-text, Geist Mono 11px
.oc-pr               PR pill: Geist Mono 11px
.oc-pr--open         Blue tint + text
.oc-pr--draft        Closed tint + muted text
.oc-pr--merged       Green tint + text
```

### Logo

```
.oc-logo             22px × 22px square, fg background, bg text, --r-md, Geist Mono 700
```

### Misc

```
.oc-input            Input: 28px h, card bg, standard border, focus: brand border + ring
.oc-kbd              Keyboard key: card bg, border, Geist Mono 10px
.oc-card             Card: card bg, subtle border, --r-lg, --card-pad
.oc-divider-h        1px horizontal hairline, border-subtle
.oc-divider-v        1px vertical hairline, border-subtle
```

---

## Density System

Two modes controlled by `data-density` attribute on `<html>`:

| Token | Comfortable | Compact |
|-------|-------------|---------|
| `--row-h` | 36px | 28px |
| `--row-pad-y` | 8px | 5px |
| `--card-pad` | 12px | 10px |
| `--icon-btn` | 28px | 24px |

The TweaksPanel in the app lets users switch between these in real time.

---

## Layout Structure

### Main app layout (post-auth)

```
┌─────────────────────────────────────────────────┐
│ Sidebar (var width, collapsible)                 │
│ ┌───────────────────────────────────────────────┐│
│ │ Topbar (48px fixed height)                    ││
│ │ ProjectHeader (dynamic, includes view tabs)   ││
│ │ FilterBar (conditional, shown when filtered)  ││
│ │ ─────────────────────────────────────────── ││
│ │ Active view (flex: 1, overflow: auto)         ││
│ └───────────────────────────────────────────────┘│
│                                                   │
│ [Task detail panel] (absolute right, z:50, 720px)│
│ [Command palette]   (absolute center, z:100)      │
│ [New task modal]    (fixed center, z:110)         │
└─────────────────────────────────────────────────┘
```

### Z-index stack

| Layer | Z-index | Element |
|-------|---------|---------|
| Base | 0 | Views, cards |
| Sticky | 2 | Gantt left column |
| Task detail scrim | 40 | Backdrop for task panel |
| Task detail panel | 50 | Right slide-in panel |
| Popovers / dropdowns | 50–200 | Filter popover, picker menus |
| Command palette scrim | 100 | Backdrop |
| Command palette | 100 | Centered dialog |
| New task modal | 110 | Full-screen modal |

---

## View-Specific Design

### Board (Kanban)

- Columns: one per status (backlog → open → progress → review → merged → blocked)
- Column header: status dot + label + count badge + "+" button
- Card: white/elevated bg, subtle border, drag handle (grip-vertical, shows on hover), priority dot, task ID in mono, title, avatar stack, due pill, checks pill
- Drag state: card gets `rotate(1.5deg)` + slight shadow via `DragOverlay`
- Drop target column: `bg-hover` tint when `isOver`

### List

- Grouped by status, each group collapsible
- Row: 36px (comfortable), task ID in mono, title, assignees, due, priority dot, comments + checks counters
- "Add task" row at bottom of each group

### Calendar

- 7-column grid, 6 rows (42 cells always)
- Out-of-month cells: `bg-sunken` background
- Today: accent circle on date number
- Task entries: colored left-border pill with ID + truncated title
- Max 3 tasks per cell, "+N more" overflow

### Gantt / Timeline

- Left sticky panel: 280px, task names with priority + ID
- Right timeline: 30 days × 28px/day
- Day headers: letter (S/M/T/W/T/F/S) + number, today gets accent circle
- Weekend columns: `bg-sunken` background
- Today line: vertical `--accent` line with box-shadow glow
- Task bars: `color-mix(in oklab, status-color 22%, bg)` fill + 3px left border in status color
- Month/year labels in a secondary header row above day labels

### Task Detail

- Right panel: 720px wide, `position: absolute` top/right/bottom, slide in from right
- Two-column body: main scroll area (flex: 1) + right meta panel (240px)
- Sections: Title (contentEditable), action row (status/priority/due/assignees pickers), description (contentEditable), subtasks, tags, git panel (branch + PR), activity + comment thread
- Each picker: self-contained component with own `useRef` + `useClickOutside`
- Comment composer: textarea expands on focus, ⌘↵ to submit

---

## Auth Screen Design

### Layout

- Split: left brand panel (480px, hidden below 768px) + right form panel (flex 1)
- Mobile: full-width form only
- Brand panel background: `bg-surface` + subtle 32px dot grid + radial accent glow at top-left

### Brand panel contents

1. Wordmark (`.oc-logo` + "OpenClick")
2. Hero headline: 28px / 700 / -0.025em
3. Supporting copy: 14px / fg-muted
4. Mini Kanban board preview (live design system rendering)
5. Feature list: 4 items with indigo icon badges
6. Social proof footer: stacked avatars + member count

### Form panel

- Max-width 400px, centered
- Logo repeated for mobile (brand panel hidden)
- Heading: 24px / 700 / -0.02em
- Inputs: 40px height (touch-friendly), `--r-lg` radius, focus: brand border + 3px ring
- Error messages: below each field, `role="alert"`, `--s-blocked-500` red, alert-circle icon
- Validate on blur, re-validate on change once touched
- Password: show/hide eye toggle (tabIndex: -1)
- Password strength meter: 4-segment bar (length, uppercase, number, symbol)
- Submit: full-width, 40px, disabled + loading spinner during async

### Screen transitions

- Each screen mounts with `animation: oc-auth-in 220ms var(--ease-out)`
- No sliding — just scale + fade per screen

---

## Icon Usage

All icons come from `lucide-react` via the `Icon` component in `primitives.jsx`.

```jsx
<Icon name="git-branch" size={14} />
<Icon name="check" size={11} strokeWidth={3} style={{ color: '#fff' }} />
```

**Pass kebab-case names** — the component converts to PascalCase internally via `name.split('-').map(cap).join('')`.

Default `strokeWidth` is `2` globally. Override to `1.75` for sidebar items (lighter), `2.2–2.4` for emphasis.

### Commonly used icons in this project

| Name | Usage |
|------|-------|
| `git-branch` | Branches, development section |
| `git-pull-request` | Open PRs |
| `git-merge` | Merged PRs |
| `git-commit-horizontal` | Commits |
| `kanban` | Board view tab |
| `list` | List view tab |
| `calendar` | Calendar view tab |
| `gantt-chart` | Timeline view tab |
| `check-square` | Subtasks section |
| `check` | Checkbox tick, completion |
| `check-circle-2` | CI success events |
| `x` | Close, remove |
| `plus` | Add |
| `more-horizontal` | Overflow menu |
| `filter` | Filter button |
| `arrow-up-down` | Sort button |
| `search` | Search, command palette trigger |
| `chevron-right/left/down` | Navigation, tree expansion |
| `alert-circle` | Form errors, warnings |
| `eye` / `eye-off` | Password toggle |
| `trash-2` | Delete action |
| `tag` | Tags section |
| `link` | Copy link, related tasks |
| `arrow-up-right` | Open full page |
| `align-left` | Description section |
| `message-square` | Comments / activity |
| `key-round` | Forgot password |
| `mail-check` | Reset link sent |
| `user-plus` | Assign (empty state) |
| `zap` | Speed / command features |
| `users` | Team / members |

---

## Data Visualization Conventions

### Progress bars

- Track: `bg-card`, 4px height, `border-radius: 999`
- Fill: `--accent` or status color, `transition: width 300ms`
- Text: percentage in `t-mono-sm`

### Check counters (subtask pills)

Format: `done/total` (e.g. `2/4`) in `t-mono-sm` / fg-subtle

### Activity events vs comments

- **Comment**: Avatar + name + timestamp + message bubble (card bg)
- **Event**: Small icon circle (24px) + descriptive text + timestamp (no bubble)

---

## Responsive Behavior

Currently the app is **desktop-first** — it does not have full mobile support in the main views. Only the auth screens are mobile-responsive.

### Auth screens breakpoint

```css
@media (max-width: 768px) {
  .auth-brand { display: none !important; }
}
```

The rest of the app (sidebar, board, list, etc.) assumes a minimum viewport of ~1024px.

---

## Extending the Design System

### Adding a new status

1. Add to `STATUSES` in `data.js` with `label`, `cls` (matching `.oc-chip--xxx`), and `dot` (CSS variable or hex).
2. Add `.oc-chip--xxx` and `--tint-xxx` in `tokens.css`.
3. Add a `--s-xxx-500` color token in `:root`.

### Adding a new view

Follow the existing view pattern:
- Full-height flex container: `style={{ flex: 1, minHeight: 0, overflow: 'auto', background: 'var(--bg)' }}`
- Use `visibleTasks` from `useApp()`
- Row hover: `onMouseEnter/Leave` toggling `background: var(--bg-hover)`
- Click to open task: `dispatch({ type: A.SET_UI, payload: { openTaskId: t.id } })`

### Adding a new component

- Inline styles only, tokens everywhere
- Hover states via `onMouseEnter/Leave` or `useState(hovered)`
- Accessible: `aria-label` on icon-only buttons, `role="alert"` on errors, `htmlFor` on labels
- Always test in both dark and light themes (`data-theme="dark"` and `data-theme="light"`)
