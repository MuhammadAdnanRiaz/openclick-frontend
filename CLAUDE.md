# OpenClick — CLAUDE.md

Agent guide for the OpenClick codebase. Read this before writing any code.

---

## What This Project Is

OpenClick is a **fully in-browser, in-memory project management tool** — a Git-native ClickUp alternative built for engineering teams. There is no backend, no API, no database, no router. All state lives in a single React context for the lifetime of the browser session. It is a Vite + React 19 SPA.

The fictional workspace is **"Orbital"** — a dev-tools startup with 10 members and 16 seeded tasks in the `Runtime · v0.8` sprint.

---

## Tech Stack

| Concern | Choice |
|---------|--------|
| Framework | React 19 (JSX, no TypeScript) |
| Build tool | Vite 8 |
| State | `useReducer` + React Context (no Zustand, no Redux) |
| Drag and drop | `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` |
| Icons | `lucide-react` (npm package, PascalCase lookup) |
| Fonts | Geist + Geist Mono via Google Fonts CDN |
| Styling | Inline styles + global CSS custom properties (`tokens.css`) |
| Routing | None — screen state via `useState` |

**No new runtime dependencies should be added** without a strong reason. The only exception is `@dnd-kit` which is already installed.

---

## File Structure

```
src/
├── App.jsx                  # Root: auth gate + AppProvider + AppInner
├── main.jsx                 # ReactDOM.createRoot
├── tokens.css               # Full design system: variables, base styles, utility classes
├── data.js                  # Seed data: TASKS, WORKSPACE, PROJECT, STATUSES, VIEWS, AVATAR_COLORS
│
├── store/
│   └── AppContext.jsx        # useReducer store: state, dispatch, derived values, provider
│
├── components/
│   ├── primitives.jsx        # Icon, Avatar, AvatarStack, StatusChip, Priority, BranchPill, PRPill
│   ├── Shell.jsx             # Sidebar, Topbar, ProjectHeader, CommandPalette + shared Popover helpers
│   ├── FilterBar.jsx         # Active filter chips strip (shown when any filter is active)
│   └── NewTaskModal.jsx      # Task creation dialog (modal overlay)
│
└── views/
    ├── AuthView.jsx          # Login / Signup / Forgot Password screens (pre-auth gate)
    ├── BoardView.jsx         # Kanban board with @dnd-kit drag and drop
    ├── ListView.jsx          # Grouped list view by status
    ├── CalendarView.jsx      # Monthly calendar with task dots
    ├── GanttView.jsx         # 30-day timeline / Gantt chart
    └── TaskDetail.jsx        # Right-panel task detail with full inline editing
```

---

## State Architecture

### Provider and hook

```js
// Every component that needs store access:
import { useApp, A } from '../store/AppContext.jsx';
const { state, dispatch, visibleTasks, openTask, allTags } = useApp();
```

### State shape

```js
{
  tasks: Task[],             // mutable copy of SEED_TASKS
  filters: {
    assignee: string[],      // member names
    priority: string[],      // 'urgent' | 'high' | 'normal' | 'low'
    tags:     string[],
  },
  sort: string,              // 'id-asc' | 'due-asc' | 'due-desc' | 'priority-asc' | 'priority-desc'
  ui: {
    view:                 'board' | 'list' | 'calendar' | 'gantt',
    openTaskId:           string | null,
    cmdOpen:              boolean,
    newTaskOpen:          boolean,
    newTaskInitialStatus: string,        // pre-fills status in NewTaskModal
    calendarMonth:        { year, month },
    ganttStartDate:       Date,
  }
}
```

### Derived values (computed in Provider via useMemo)

| Value | Description |
|-------|-------------|
| `visibleTasks` | `tasks` filtered by `filters` then sorted by `sort` |
| `openTask` | `tasks.find(t => t.id === ui.openTaskId)` — null when no panel open |
| `allTags` | Unique sorted tags across all tasks |

**Always use `visibleTasks` in views, not `state.tasks` directly**, so filters/sort apply.

### Reducer actions

All dispatch calls use the exported `A` constant:

```js
import { A } from '../store/AppContext.jsx';

dispatch({ type: A.TASK_CREATE,    payload: { title, status, priority, due, assignees, tags } });
dispatch({ type: A.TASK_UPDATE,    payload: { id: 'ORB-419', patch: { status: 'review' } } });
dispatch({ type: A.TASK_DELETE,    payload: { id: 'ORB-419' } });
dispatch({ type: A.SUBTASK_TOGGLE, payload: { taskId: 'ORB-419', subtaskId: 'st-0' } });
dispatch({ type: A.COMMENT_ADD,    payload: { taskId: 'ORB-419', body: 'comment text' } });
dispatch({ type: A.SET_FILTER,     payload: { priority: ['urgent', 'high'] } });  // merges
dispatch({ type: A.SET_SORT,       payload: 'due-asc' });
dispatch({ type: A.SET_UI,         payload: { view: 'list' } });  // merges into ui slice
```

`SET_FILTER` and `SET_UI` merge their payload — only pass the keys you want to change.

---

## Task Data Shape

```js
{
  id:          'ORB-419',          // auto-generated as ORB-NNN on create
  title:       string,
  description: string | undefined, // added via inline edit in TaskDetail
  status:      'backlog' | 'open' | 'progress' | 'review' | 'merged' | 'blocked' | 'done',
  priority:    'urgent' | 'high' | 'normal' | 'low',
  assignees:   string[],           // member names from WORKSPACE.members
  due:         'Apr 28' | '—',     // "Mon DD" format or '—'
  branch:      string | null,      // e.g. 'feat/scheduler-core'
  pr:          { id: number, state: 'open' | 'draft' | 'merged' } | null,
  comments:    number,             // count; incremented by COMMENT_ADD
  checks:      [done, total],      // synced from subtasks by SUBTASK_TOGGLE
  tags:        string[],
  subtasks:    { id: string, title: string, done: boolean }[],
  commentThread: {
    id:     string,
    type:   'comment' | 'event',
    author: string,
    when:   string,
    body:   string,
    icon?:  string,     // lucide icon name (events only)
    color?: string,     // CSS var (events only)
  }[],
}
```

Due date format: **always `"Mon DD"` (e.g. `"Apr 28"`)** or the literal string `'—'` for no date. Year is always 2026 in the seed data. When converting from `<input type="date">`, format back using the `MONTH_SHORT` array.

---

## Styling Rules

### Never use Tailwind, CSS modules, or styled-components

All styles are **inline style objects** + **CSS custom property tokens** from `tokens.css`.

### Always use design tokens, never raw values

```js
// ✅ Correct
style={{ color: 'var(--fg-muted)', fontSize: 'var(--fs-13)', borderRadius: 'var(--r-md)' }}

// ❌ Wrong
style={{ color: '#A8A8B3', fontSize: 13, borderRadius: 6 }}
```

### Use existing utility classes for standard elements

```jsx
<button className="oc-btn oc-btn--primary">…</button>
<button className="oc-btn oc-btn--secondary oc-btn--sm">…</button>
<button className="oc-btn oc-btn--ghost oc-btn--icon">…</button>
<span className="oc-chip oc-chip--open">…</span>
<input className="oc-input" />
<span className="oc-kbd">⌘K</span>
<span className="t-h1">…</span>
<span className="t-label">…</span>
<span className="t-mono">…</span>
```

### Icon usage

Always use the `Icon` component from `primitives.jsx`. Pass **kebab-case** names (the component converts to PascalCase internally):

```jsx
import { Icon } from '../components/primitives.jsx';

<Icon name="git-branch" size={14} />
<Icon name="check-circle-2" size={13} style={{ color: 'var(--s-merged-500)' }} />
```

Never import lucide icons directly. Never use emoji as icons.

---

## Common Patterns

### Click-outside dismissal (popovers, dropdowns)

Defined locally in Shell.jsx and TaskDetail.jsx — copy the pattern:

```js
function useClickOutside(ref, handler) {
  useEffect(() => {
    function listener(e) {
      if (!ref.current || ref.current.contains(e.target)) return;
      handler();
    }
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler]);
}
```

### Inline popover positioning

```jsx
<div style={{ position: 'relative' }} ref={myRef}>
  <button onClick={() => setOpen(o => !o)}>…</button>
  {open && (
    <div style={{
      position: 'absolute', top: '100%', left: 0, marginTop: 4, zIndex: 200,
      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
      borderRadius: 'var(--r-md)', boxShadow: 'var(--shadow-lg)',
      minWidth: 160, overflow: 'hidden',
      animation: 'oc-scale-in 140ms var(--ease-out)',
    }}>
      …
    </div>
  )}
</div>
```

### Form field with validation (auth screens pattern)

```js
function useField(validator) {
  const [value, setValue] = useState('');
  const [error, setError]  = useState('');
  const [touched, setTouched] = useState(false);
  function check(val) { const e = validator?.(val) ?? ''; setError(e); return !e; }
  return {
    value, error,
    onChange: e => { setValue(e.target.value); if (touched) check(e.target.value); },
    onBlur:   ()  => { setTouched(true); check(value); },
    validate: ()  => { setTouched(true); return check(value); },
  };
}
```

Validate all fields before submit — run each `field.validate()` sequentially (no `&&` short-circuit):

```js
const a = nameField.validate();
const b = emailField.validate();
const c = passwordField.validate();
if (!a || !b || !c) return;
```

### Async submit with loading state

```js
const [loading, setLoading] = useState(false);

async function handleSubmit(e) {
  e.preventDefault();
  if (!field.validate()) return;
  setLoading(true);
  await someAsyncOperation();
  setLoading(false);
}

// In button:
<button disabled={loading} style={{ opacity: loading ? 0.8 : 1 }}>
  {loading ? <><Spinner /> Saving…</> : 'Save'}
</button>
```

### ContentEditable inline editing (title, description)

```jsx
const ref = useRef(null);

// Sync DOM when task changes
useEffect(() => {
  if (ref.current && document.activeElement !== ref.current) {
    ref.current.textContent = task.title;
  }
}, [task.title, task.id]);

<div
  ref={ref}
  contentEditable
  suppressContentEditableWarning
  onBlur={() => {
    const val = ref.current?.textContent.trim();
    if (val && val !== task.title) dispatch({ type: A.TASK_UPDATE, payload: { id: task.id, patch: { title: val } } });
    else ref.current.textContent = task.title;
  }}
/>
```

---

## Screen / Navigation Architecture

There is **no router**. Navigation is handled entirely by state:

- **Auth gate**: `isAuthed` boolean in root `App`. When `false`, renders `<AuthView onAuth={...} />`. When `true`, renders the main app inside `AppProvider`.
- **View switching**: `state.ui.view` → rendered by `AppInner` with conditional rendering.
- **Auth screens**: `screen` state inside `AuthView` → `'login' | 'signup' | 'forgot' | 'sent'`.
- **Task detail**: `state.ui.openTaskId` → `openTask` derived value → renders `<TaskDetail />` as an absolute-positioned right panel.
- **Modals**: `state.ui.newTaskOpen` → renders `<NewTaskModal />` centered with scrim.
- **Command palette**: `state.ui.cmdOpen` → renders `<CommandPalette />`.

---

## Keyboard Shortcuts

Defined in `AppInner` via `useEffect` on `window`:

| Shortcut | Action |
|----------|--------|
| `⌘K` / `Ctrl+K` | Open command palette |
| `Escape` | Close palette → close new task modal → close task detail (priority order) |
| `T` (when no input focused) | Open new task modal |
| `⌘↵` in NewTaskModal | Submit new task |
| `⌘↵` in comment composer | Submit comment |

---

## Adding a New View

1. Create `src/views/MyView.jsx`, import `useApp` from store, use `visibleTasks`.
2. Add to `VIEWS` array in `src/data.js` with a lucide icon name (kebab-case).
3. Add `{ui.view === 'myview' && <MyView />}` in `AppInner` in `App.jsx`.
4. Add `{ g: 'Navigate', icon: '...', label: 'Go to My view', action: () => dispatch(…) }` to `staticItems` in `CommandPalette`.

---

## Adding a New Reducer Action

1. Add the key to `A` in `AppContext.jsx`: `MY_ACTION: 'MY_ACTION'`.
2. Add a `case A.MY_ACTION:` in the reducer returning new state (always immutable — spread arrays and objects).
3. Dispatch from any component: `dispatch({ type: A.MY_ACTION, payload: { … } })`.

---

## Due Date Formatting

The app uses a custom "Mon DD" format (e.g. `"Apr 28"`) — not ISO dates — because it predates any proper date library.

```js
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ISO → display
function formatDue(iso) {
  if (!iso) return '—';
  const [, m, d] = iso.split('-');
  return `${MONTH_SHORT[parseInt(m, 10) - 1]} ${parseInt(d, 10)}`;
}

// Display → ISO (for <input type="date">)
function toIsoDate(due) {
  if (!due || due === '—') return '';
  const [mon, day] = due.split(' ');
  const m = MONTH_SHORT.indexOf(mon);
  return `2026-${String(m + 1).padStart(2, '0')}-${String(parseInt(day)).padStart(2, '0')}`;
}

// Display → ms (for sort)
const MONTH_IDX = { Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5, Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11 };
function parseDueMs(due) {
  if (!due || due === '—') return Infinity;
  const [mon, day] = due.split(' ');
  return new Date(2026, MONTH_IDX[mon] ?? 0, parseInt(day)).getTime();
}
```

---

## Things to Never Do

- **No CSS-in-JS libraries** (styled-components, emotion, etc.)
- **No Tailwind** — all styling via `tokens.css` variables and inline styles
- **No router** (react-router, tanstack-router, etc.)
- **No Zustand / Redux** — all state via the existing AppContext
- **No new npm packages** without a clear reason
- **No raw hex values or pixel numbers** in inline styles — use CSS variables
- **No emoji as icons** — always use `<Icon name="…" />`
- **No direct lucide imports** — always go through `<Icon />`
- **No `import { TASKS } from '../data.js'`** in views — use `visibleTasks` from `useApp()`
- **No `&&` short-circuit when validating multiple form fields** — run all validators first
- **No CSS media queries inside JSX** — use a `<style>` tag or the `className` approach with a global style block at the top of the component if truly needed

---

## Dev Commands

```bash
pnpm dev        # Start dev server (usually http://localhost:5173 or 5174)
pnpm build      # Production build — run this to verify no compile errors
pnpm preview    # Preview prod build
pnpm lint       # ESLint check
```

Always run `pnpm build` after larger changes to confirm zero compile errors before reporting work as done.

---

## Seed Data Reference

**Workspace**: Orbital  
**Members**: Maya Chen, Dev Patel, Rae Wong, Jonas Becker, Priya Kapoor, Alex Kim, Sam Rivera, Noor Hassan, Theo Lin, Izzy Park  
**Spaces**: Engineering (terminal), Design (palette), Ops (activity), Growth (trending-up)  
**Active project**: Runtime · v0.8 — Sprint 24

**16 seeded tasks** across statuses:
- `backlog`: ORB-401
- `open`: ORB-421, ORB-430, ORB-434, ORB-440, ORB-436
- `progress`: ORB-412, ORB-407, ORB-419, ORB-414, ORB-400
- `review`: ORB-418, ORB-428
- `merged`: ORB-425
- `blocked`: ORB-399
- `done`: (none in seed)

**ORB-419** is the featured task — it has real subtasks and a seeded comment thread. Use it for task detail demos.

Next auto-generated ID will be `ORB-443`.
