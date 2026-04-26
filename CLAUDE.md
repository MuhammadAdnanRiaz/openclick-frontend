# OpenClick Frontend — CLAUDE.md

Agent guide for the OpenClick frontend. Read this before writing any code.

---

## What This Project Is

OpenClick frontend is a **React 19 SPA** for a Git-native project management tool. No router library — navigation is pure state. Deployed on Vercel.

- **Live**: `https://openclick.adnanriaz.dev`
- **Backend API**: `https://openclick.backend.adnanriaz.dev/api/v1`
- **Design tokens**: `src/tokens.css`

---

## Tech Stack

| Concern | Choice |
|---------|--------|
| Framework | React 19 |
| Build tool | Vite 8 |
| Language | JavaScript (JSX) — no TypeScript |
| Styling | Inline styles + CSS custom properties (no CSS-in-JS library) |
| Icons | `lucide-react` |
| Drag & drop | `@dnd-kit/core` + `@dnd-kit/sortable` |
| State | React Context + `useReducer` (`src/store/AppContext.jsx`) |
| Routing | None — views are rendered conditionally from UI state |
| Package manager | npm |

---

## Project Structure

```
src/
├── main.jsx                    # React root mount
├── App.jsx                     # Root component — auth gate, OAuth callback handling, theme
├── tokens.css                  # All CSS custom properties (design tokens)
├── data.js                     # Static/mock data fallbacks
│
├── api/
│   ├── client.js               # apiFetch, token storage, auto-refresh on 401
│   ├── index.js                # Re-exports all api modules
│   ├── auth.js                 # login, signup, oauth, refresh, logout
│   ├── tasks.js
│   ├── subtasks.js
│   ├── comments.js
│   ├── search.js
│   ├── activity.js
│   ├── inbox.js
│   ├── notifications.js
│   ├── users.js
│   ├── workspace.js
│   ├── members.js
│   ├── spaces.js
│   ├── billing.js
│   └── integrations.js
│
├── store/
│   └── AppContext.jsx          # Global state — workspace, tasks, UI flags, filters
│
├── components/
│   ├── primitives.jsx          # Icon, Badge, Avatar, Tooltip — shared atoms
│   ├── Shell.jsx               # Sidebar, Topbar, ProjectHeader, CommandPalette
│   ├── FilterBar.jsx           # Active filter chips
│   └── NewTaskModal.jsx        # Quick-create task modal
│
└── views/
    ├── AuthView.jsx            # Login, signup, forgot password, OAuth buttons
    ├── BoardView.jsx           # Kanban board
    ├── ListView.jsx            # Table/list view
    ├── CalendarView.jsx        # Calendar view
    ├── GanttView.jsx           # Gantt/timeline view
    ├── TaskDetail.jsx          # Task side panel + full-page mode
    ├── SettingsView.jsx        # All settings sections (profile, workspace, integrations, billing…)
    ├── SearchView.jsx          # Global search side panel
    ├── InboxView.jsx           # Inbox side panel
    ├── NotificationsView.jsx   # Notifications side panel
    ├── MyTasksView.jsx         # My tasks side panel
    └── ActivityView.jsx        # Activity feed side panel
```

---

## State Management

All global state lives in `AppContext.jsx` — a single `useReducer` store.

```jsx
import { useApp, A } from '../store/AppContext.jsx';

const { state, dispatch } = useApp();

// Open settings on integrations tab
dispatch({ type: A.SET_UI, payload: { settingsOpen: true, settingsSection: 'integrations' } });
```

Key state slices:
- `state.workspaceId` — active workspace
- `state.tasks` — task list
- `state.ui` — all UI flags: `settingsOpen`, `settingsSection`, `cmdOpen`, `openTaskId`, `sidePanel`, `view`, etc.
- `state.filters` — assignee, priority, tags

---

## Auth & Token Flow

Tokens are stored in `localStorage` via `src/api/client.js`:

| Key | Value |
|-----|-------|
| `oc_access_token` | JWT access token |
| `oc_refresh_token` | JWT refresh token |
| `oc_user` | JSON-serialised user object |
| `oc_workspace_id` | Active workspace ID |

`apiFetch` auto-retries with a refreshed token on 401. On refresh failure it calls `clearAuth()` and fires the unauthorized handler → logout.

`getStoredAuth()` requires `token` + `user` (workspaceId is optional — OAuth users may not have one initially).

---

## OAuth Login Flow

### GitHub
1. Button calls `redirectToGitHub()` → redirects to `github.com/login/oauth/authorize?...&state=auth`
2. GitHub redirects to backend `GET /auth/github/callback`
3. Backend redirects to `https://openclick.adnanriaz.dev/?github_auth=<base64url>`
4. `App.jsx` detects `?github_auth=` on mount → decodes payload → calls `storeAuth()` + `setAuthData()` → cleans URL

### GitLab
1. Button calls `redirectToGitLab()` → fetches `GET /auth/gitlab/url` from backend → redirects to returned URL
2. GitLab redirects to backend `GET /auth/gitlab/callback`
3. Backend redirects to `https://openclick.adnanriaz.dev/?gitlab_auth=<base64url>`
4. Same handling as GitHub — both `?github_auth` and `?gitlab_auth` handled by the same `useEffect` in `App.jsx`

### Integration connect OAuth (settings page)
- Uses popup window via `window.open()`
- Popup lands on `/?oauth_result=<provider>:success|error`
- `App.jsx` writes result to `localStorage`, popup closes
- `IntegrationsSection` listens via `storage` event, refreshes list, shows toast

---

## Routing

There is no router. Views are rendered conditionally from `state.ui`:

```jsx
// In AppInner (App.jsx)
{ui.view === 'board'    && <BoardView />}
{ui.view === 'list'     && <ListView />}
{ui.settingsOpen        && <SettingsView />}
{ui.sidePanel === 'search' && <SearchView />}
```

To navigate: dispatch a `SET_UI` action.

---

## Styling

All styles are inline (`style={{ ... }}`). No CSS modules, no Tailwind.

Use CSS custom properties from `tokens.css` — never hardcode colors, spacing, or radii:

```jsx
// ✅ Correct
style={{ color: 'var(--fg-muted)', borderRadius: 'var(--r-md)', padding: 'var(--s-4)' }}

// ❌ Wrong
style={{ color: '#888', borderRadius: '6px', padding: '8px' }}
```

Default theme is **light**. Dark mode is toggled via `data-theme="dark"` on `<html>`.

---

## Environment Variables (Vercel)

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend base URL including `/api/v1` — e.g. `https://openclick.backend.adnanriaz.dev/api/v1` |
| `VITE_GITHUB_CLIENT_ID` | GitHub OAuth App client ID (public — used to build GitHub auth URL client-side) |

---

## Deployment (Vercel)

- **Repo**: `git@github.com:MuhammadAdnanRiaz/openclick-frontend.git`
- **Branch**: `main` — every push auto-deploys
- **Framework preset**: Vite
- **Build command**: `npm run build`
- **Output directory**: `dist`

---

## Dev Commands

```bash
npm install      # Install dependencies
npm run dev      # Dev server at http://localhost:5173
npm run build    # Production build → dist/
npm run preview  # Preview production build locally
npm run lint     # ESLint
```

---

## Things to Never Do

- **Never use a router library** — navigation is state-driven via `dispatch({ type: A.SET_UI, ... })`
- **Never hardcode colors, spacing, or radii** — always use `var(--token-name)` from `tokens.css`
- **Never fetch data outside of `useEffect`** — all API calls go inside effects or event handlers
- **Never store sensitive data** beyond what's in `client.js` — no tokens in component state
- **Never construct the GitLab OAuth URL on the frontend** — always fetch it from `GET /auth/gitlab/url`
- **Never use `window.opener.postMessage`** for OAuth popups — `noopener` is set; use `localStorage` + `storage` event instead
