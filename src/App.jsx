import { useEffect } from 'react';
import { AppProvider, useApp, A } from './store/AppContext.jsx';
import { Sidebar, Topbar, ProjectHeader, CommandPalette } from './components/Shell.jsx';
import { BoardView } from './views/BoardView.jsx';
import { ListView } from './views/ListView.jsx';
import { CalendarView } from './views/CalendarView.jsx';
import { GanttView } from './views/GanttView.jsx';
import { TaskDetail } from './views/TaskDetail.jsx';
import { AuthView } from './views/AuthView.jsx';
import { SettingsView } from './views/SettingsView.jsx';
import { SearchView } from './views/SearchView.jsx';
import { InboxView } from './views/InboxView.jsx';
import { NotificationsView } from './views/NotificationsView.jsx';
import { MyTasksView } from './views/MyTasksView.jsx';
import { ActivityView } from './views/ActivityView.jsx';
import { NewTaskModal } from './components/NewTaskModal.jsx';
import { FilterBar } from './components/FilterBar.jsx';
import { Icon } from './components/primitives.jsx';
import { getStoredAuth, clearAuth, setUnauthorizedHandler } from './api/index.js';
import { setAuthData as storeAuth } from './api/client.js';

// ─── Tweaks panel (theme / density / sidebar — these are still local since ─────
// they're design-canvas controls, not app state)
const TWEAK_DEFAULTS = { theme: 'light', density: 'comfortable', sidebarWidth: 232, sidebarCollapsed: false };

import { useState } from 'react';
function useTweaks() {
  const [tweaks, setTweaks] = useState(TWEAK_DEFAULTS);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if (!e.data || typeof e.data !== 'object') return;
      if (e.data.type === '__activate_edit_mode') setPanelOpen(true);
      else if (e.data.type === '__deactivate_edit_mode') setPanelOpen(false);
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  const setKey = (k, v) => {
    setTweaks(t => {
      const next = { ...t, [k]: v };
      window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [k]: v } }, '*');
      return next;
    });
  };
  return { tweaks, setKey, panelOpen };
}

// ─── Inner app (inside AppProvider so it can useApp) ─────────────────────────
function AppInner({ onLogout }) {
  const { state, dispatch, openTask, visibleTasks } = useApp();
  const { ui, filters } = state;
  const { tweaks, setKey, panelOpen } = useTweaks();

  // Apply theme + density
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tweaks.theme);
    document.documentElement.setAttribute('data-density', tweaks.density);
  }, [tweaks.theme, tweaks.density]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      const inInput = ['INPUT','TEXTAREA','[contenteditable]'].some(sel =>
        e.target.matches?.(sel) || e.target.isContentEditable
      );
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        dispatch({ type: A.SET_UI, payload: { cmdOpen: true } });
      } else if (e.key === 'Escape') {
        if (ui.cmdOpen)       dispatch({ type: A.SET_UI, payload: { cmdOpen: false } });
        else if (ui.sidePanel)    dispatch({ type: A.SET_UI, payload: { sidePanel: null } });
        else if (ui.settingsOpen) dispatch({ type: A.SET_UI, payload: { settingsOpen: false } });
        else if (ui.newTaskOpen)  dispatch({ type: A.SET_UI, payload: { newTaskOpen: false } });
        else if (ui.taskFullPage) dispatch({ type: A.SET_UI, payload: { taskFullPage: false } });
        else if (ui.openTaskId)   dispatch({ type: A.SET_UI, payload: { openTaskId: null, taskFullPage: false } });
      } else if (e.key === 't' && !inInput && !ui.cmdOpen && !ui.newTaskOpen && !ui.openTaskId && !ui.sidePanel) {
        dispatch({ type: A.SET_UI, payload: { newTaskOpen: true, newTaskInitialStatus: 'open' } });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [ui.cmdOpen, ui.newTaskOpen, ui.openTaskId, ui.sidePanel, ui.settingsOpen, dispatch]);

  const hasFilters = filters.assignee.length || filters.priority.length || filters.tags.length;

  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex',
      background: 'var(--bg)', color: 'var(--fg)',
      position: 'relative', overflow: 'hidden',
    }}>
      <Sidebar collapsed={tweaks.sidebarCollapsed} width={tweaks.sidebarWidth} onLogout={onLogout} />

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Topbar
          onOpenCommand={() => dispatch({ type: A.SET_UI, payload: { cmdOpen: true } })}
          onToggleSidebar={() => setKey('sidebarCollapsed', !tweaks.sidebarCollapsed)}
          theme={tweaks.theme}
          onToggleTheme={() => setKey('theme', tweaks.theme === 'dark' ? 'light' : 'dark')}
        />
        <ProjectHeader view={ui.view} onViewChange={v => dispatch({ type: A.SET_UI, payload: { view: v } })} />
        {hasFilters && <FilterBar />}

        {ui.view === 'board'    && <BoardView />}
        {ui.view === 'list'     && <ListView />}
        {ui.view === 'calendar' && <CalendarView />}
        {ui.view === 'gantt'    && <GanttView />}
      </div>

      {/* Task detail overlay */}
      {openTask && (
        <>
          {!ui.taskFullPage && (
            <div
              onClick={() => dispatch({ type: A.SET_UI, payload: { openTaskId: null, taskFullPage: false } })}
              style={{
                position: 'absolute', inset: 0, zIndex: 40,
                background: 'rgba(5,5,10,0.4)', backdropFilter: 'blur(2px)',
                animation: 'oc-fade-in 220ms var(--ease-out)',
              }}
            />
          )}
          <TaskDetail task={openTask} fullPage={ui.taskFullPage} onClose={() => dispatch({ type: A.SET_UI, payload: { openTaskId: null, taskFullPage: false } })} />
        </>
      )}

      <CommandPalette open={ui.cmdOpen} onClose={() => dispatch({ type: A.SET_UI, payload: { cmdOpen: false } })} />

      {ui.newTaskOpen && (
        <NewTaskModal
          initialStatus={ui.newTaskInitialStatus}
          onClose={() => dispatch({ type: A.SET_UI, payload: { newTaskOpen: false } })}
        />
      )}

      {panelOpen && <TweaksPanel tweaks={tweaks} setKey={setKey} />}

      {ui.settingsOpen && <SettingsView tweaks={tweaks} setKey={setKey} />}

      {ui.sidePanel === 'search'        && <SearchView onClose={() => dispatch({ type: A.SET_UI, payload: { sidePanel: null } })} />}
      {ui.sidePanel === 'inbox'         && <InboxView onClose={() => dispatch({ type: A.SET_UI, payload: { sidePanel: null } })} />}
      {ui.sidePanel === 'notifications' && <NotificationsView onClose={() => dispatch({ type: A.SET_UI, payload: { sidePanel: null } })} />}
      {ui.sidePanel === 'mytasks'       && <MyTasksView onClose={() => dispatch({ type: A.SET_UI, payload: { sidePanel: null } })} />}
      {ui.sidePanel === 'activity'      && <ActivityView onClose={() => dispatch({ type: A.SET_UI, payload: { sidePanel: null } })} />}

      {/* Demo hint button */}
      {!openTask && !ui.cmdOpen && !ui.newTaskOpen && (
        <button
          onClick={() => dispatch({ type: A.SET_UI, payload: { openTaskId: 'ORB-419' } })}
          style={{
            position: 'absolute', bottom: 16, left: tweaks.sidebarCollapsed ? 72 : tweaks.sidebarWidth + 16,
            zIndex: 20,
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '0 12px', height: 32,
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)', color: 'var(--fg-muted)',
            fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-12)',
            cursor: 'pointer', boxShadow: 'var(--shadow-sm)',
            transition: 'left var(--dur-base) var(--ease-out)',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--fg)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--fg-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
        >
          <Icon name="maximize-2" size={12} /> Open task detail
          <span className="t-mono-sm" style={{ color: 'var(--fg-subtle)', fontSize: 10 }}>ORB-419</span>
        </button>
      )}
    </div>
  );
}

// ─── Tweaks panel ─────────────────────────────────────────────────────────────
function TweaksPanel({ tweaks, setKey }) {
  return (
    <div style={{
      position: 'fixed', bottom: 16, right: 16, zIndex: 90,
      width: 260, background: 'var(--bg-elevated)',
      border: '1px solid var(--border)', borderRadius: 'var(--r-lg)',
      boxShadow: 'var(--shadow-lg)', padding: 14,
      fontFamily: 'var(--font-sans)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Icon name="sliders-horizontal" size={14} style={{ color: 'var(--accent)' }} />
        <span className="t-h3">Tweaks</span>
      </div>
      <TweakGroup label="Theme">
        <Segmented value={tweaks.theme} onChange={v => setKey('theme', v)}
          options={[{ v: 'dark', label: 'Dark', icon: 'moon' }, { v: 'light', label: 'Light', icon: 'sun' }]} />
      </TweakGroup>
      <TweakGroup label="Density">
        <Segmented value={tweaks.density} onChange={v => setKey('density', v)}
          options={[{ v: 'comfortable', label: 'Comfortable' }, { v: 'compact', label: 'Compact' }]} />
      </TweakGroup>
      <TweakGroup label={`Sidebar width · ${tweaks.sidebarWidth}px`}>
        <input type="range" min={200} max={300} step={4}
          value={tweaks.sidebarWidth}
          onChange={e => setKey('sidebarWidth', parseInt(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--accent)' }} />
      </TweakGroup>
      <TweakGroup label="Sidebar">
        <Segmented
          value={tweaks.sidebarCollapsed ? 'collapsed' : 'expanded'}
          onChange={v => setKey('sidebarCollapsed', v === 'collapsed')}
          options={[{ v: 'expanded', label: 'Expanded' }, { v: 'collapsed', label: 'Collapsed' }]} />
      </TweakGroup>
    </div>
  );
}

function TweakGroup({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div className="t-label" style={{ fontSize: 10, marginBottom: 5 }}>{label}</div>
      {children}
    </div>
  );
}

function Segmented({ value, onChange, options }) {
  return (
    <div style={{ display: 'flex', gap: 2, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-md)', padding: 2 }}>
      {options.map(o => {
        const active = o.v === value;
        return (
          <button key={o.v} onClick={() => onChange(o.v)} style={{
            flex: 1, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            background: active ? 'var(--bg-elevated)' : 'transparent',
            border: 'none', borderRadius: 'var(--r-sm)',
            color: active ? 'var(--fg)' : 'var(--fg-muted)',
            fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: active ? 600 : 500,
            cursor: 'pointer', boxShadow: active ? 'var(--shadow-sm)' : 'none',
          }}>
            {o.icon && <Icon name={o.icon} size={11} />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [authData, setAuthData] = useState(() => getStoredAuth());

  // Apply theme tokens before auth screen renders
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.setAttribute('data-density', 'comfortable');
  }, []);

  // Handle OAuth popup callback — detect ?oauth_result=provider:status, broadcast via localStorage, close popup
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthResult = params.get('oauth_result');
    if (!oauthResult) return;
    localStorage.setItem('oauth_result', oauthResult);
    window.close();
  }, []);

  // Handle OAuth login callbacks — detect ?github_auth= or ?gitlab_auth=
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payload = params.get('github_auth') ?? params.get('gitlab_auth');
    if (!payload) return;
    window.history.replaceState({}, '', window.location.pathname);
    if (payload === 'error') return;
    try {
      const data = JSON.parse(atob(payload));
      storeAuth(data);
      setAuthData({ user: data.user, workspaceId: data.workspace?.id ?? null });
    } catch {
      // malformed payload — ignore
    }
  }, []);

  function handleAuth(data) {
    // data = { user, workspace, access_token, refresh_token } — already stored by api/auth.js
    setAuthData({ user: data.user, workspaceId: data.workspace?.id ?? null });
  }

  function handleLogout() {
    clearAuth();
    setAuthData(null);
  }

  // Wire 401 handler so expired sessions auto-logout
  useEffect(() => {
    setUnauthorizedHandler(handleLogout);
  }, []);

  if (!authData) {
    return <AuthView onAuth={handleAuth} />;
  }

  return (
    <AppProvider authData={authData}>
      <AppInner onLogout={handleLogout} />
    </AppProvider>
  );
}
