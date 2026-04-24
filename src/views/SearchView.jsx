import { useState, useEffect, useRef, useMemo } from 'react';
import { Icon, Avatar, StatusChip } from '../components/primitives.jsx';
import { useApp, A } from '../store/AppContext.jsx';
import { WORKSPACE } from '../data.js';

const RECENT = [
  { icon: 'hash', label: 'ORB-419 · Scheduler core implementation', type: 'task', taskId: 'ORB-419' },
  { icon: 'hash', label: 'ORB-412 · Realtime event bus', type: 'task', taskId: 'ORB-412' },
  { icon: 'tag', label: 'performance', type: 'tag' },
  { icon: 'user', label: 'Dev Patel', type: 'member' },
];

const QUICK_ACTIONS = [
  { icon: 'plus-circle', label: 'Create new task', kbd: 'T', action: 'create' },
  { icon: 'kanban',      label: 'Go to Board',     kbd: 'G B', action: 'board' },
  { icon: 'list',        label: 'Go to List',       kbd: 'G L', action: 'list' },
  { icon: 'settings',    label: 'Open settings',    kbd: '', action: 'settings' },
];

const TABS = ['All', 'Tasks', 'Members', 'Tags'];

export function SearchView({ onClose }) {
  const { state, dispatch } = useApp();
  const [q, setQ] = useState('');
  const [tab, setTab] = useState('All');
  const inputRef = useRef(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 20); }, []);

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const allTags = useMemo(() => [...new Set(state.tasks.flatMap(t => t.tags))].sort(), [state.tasks]);

  const taskResults = useMemo(() => {
    if (!q) return [];
    const lq = q.toLowerCase();
    return state.tasks.filter(t =>
      t.title.toLowerCase().includes(lq) ||
      t.id.toLowerCase().includes(lq) ||
      t.tags.some(tag => tag.toLowerCase().includes(lq))
    );
  }, [q, state.tasks]);

  const memberResults = useMemo(() => {
    if (!q) return [];
    const lq = q.toLowerCase();
    return WORKSPACE.members.filter(m => m.toLowerCase().includes(lq));
  }, [q]);

  const tagResults = useMemo(() => {
    if (!q) return [];
    const lq = q.toLowerCase();
    return allTags.filter(t => t.toLowerCase().includes(lq));
  }, [q, allTags]);

  function openTask(taskId) {
    dispatch({ type: A.SET_UI, payload: { openTaskId: taskId, sidePanel: null } });
    onClose();
  }

  function doQuickAction(action) {
    if (action === 'create') dispatch({ type: A.SET_UI, payload: { newTaskOpen: true, newTaskInitialStatus: 'open', sidePanel: null } });
    else if (action === 'board')    dispatch({ type: A.SET_UI, payload: { view: 'board', sidePanel: null } });
    else if (action === 'list')     dispatch({ type: A.SET_UI, payload: { view: 'list', sidePanel: null } });
    else if (action === 'settings') dispatch({ type: A.SET_UI, payload: { settingsOpen: true, sidePanel: null } });
    onClose();
  }

  const showTasks   = (tab === 'All' || tab === 'Tasks')   && taskResults.length > 0;
  const showMembers = (tab === 'All' || tab === 'Members') && memberResults.length > 0;
  const showTags    = (tab === 'All' || tab === 'Tags')    && tagResults.length > 0;
  const hasResults  = showTasks || showMembers || showTags;

  const PRIORITY_COLORS = { urgent: 'var(--s-blocked-500)', high: '#fb923c', normal: 'var(--fg-muted)', low: 'var(--fg-subtle)' };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute', inset: 0, zIndex: 100,
        background: 'rgba(5,5,10,0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: '8vh', animation: 'oc-fade-in 160ms var(--ease-out)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 680, maxWidth: '92%',
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-xl)', boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden', animation: 'oc-scale-in 160ms var(--ease-out)',
          maxHeight: '76vh', display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Input row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}>
          <Icon name="search" size={18} style={{ color: 'var(--fg-muted)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={q}
            onChange={e => { setQ(e.target.value); setTab('All'); }}
            placeholder="Search tasks, members, tags…"
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--fg)', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-16)' }}
          />
          {q && (
            <button onClick={() => setQ('')} className="oc-btn oc-btn--ghost oc-btn--icon" style={{ flexShrink: 0 }}>
              <Icon name="x" size={14} />
            </button>
          )}
          <span className="oc-kbd" style={{ flexShrink: 0 }}>esc</span>
        </div>

        {/* Tabs (shown when there's a query) */}
        {q && (
          <div style={{ display: 'flex', gap: 2, padding: '6px 12px 0', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}>
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  height: 30, padding: '0 12px', display: 'flex', alignItems: 'center',
                  background: 'transparent', border: 'none',
                  color: tab === t ? 'var(--fg)' : 'var(--fg-muted)',
                  fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-13)',
                  fontWeight: tab === t ? 600 : 400, cursor: 'pointer',
                  borderBottom: `2px solid ${tab === t ? 'var(--accent)' : 'transparent'}`,
                  marginBottom: -1,
                }}
              >{t}</button>
            ))}
          </div>
        )}

        {/* Body */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {!q ? (
            <div style={{ padding: '8px 0' }}>
              {/* Recent */}
              <GroupHeader label="Recent" />
              {RECENT.map((r, i) => (
                <ResultRow
                  key={i}
                  icon={r.icon}
                  label={r.label}
                  onClick={() => r.taskId ? openTask(r.taskId) : onClose()}
                />
              ))}

              {/* Quick actions */}
              <div style={{ height: 1, background: 'var(--border-subtle)', margin: '8px 0' }} />
              <GroupHeader label="Quick actions" />
              {QUICK_ACTIONS.map(a => (
                <ResultRow
                  key={a.action}
                  icon={a.icon}
                  label={a.label}
                  right={a.kbd && <span className="oc-kbd">{a.kbd}</span>}
                  onClick={() => doQuickAction(a.action)}
                />
              ))}
            </div>
          ) : !hasResults ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <Icon name="search-x" size={32} style={{ color: 'var(--fg-subtle)', marginBottom: 12 }} />
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-14)', color: 'var(--fg-muted)', marginBottom: 4 }}>No results for "{q}"</div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-12)', color: 'var(--fg-subtle)' }}>Try a different search term</div>
            </div>
          ) : (
            <div style={{ padding: '8px 0' }}>
              {showTasks && (
                <>
                  <GroupHeader label={`Tasks · ${taskResults.length}`} />
                  {taskResults.slice(0, 8).map(t => (
                    <button
                      key={t.id}
                      onClick={() => openTask(t.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        width: '100%', padding: '8px 16px', border: 'none',
                        background: 'transparent', cursor: 'pointer', textAlign: 'left',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <StatusChip status={t.status} size="sm" dot />
                      <span style={{ flex: 1, fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-13)', color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                      <span className="t-mono-sm" style={{ color: 'var(--fg-subtle)', flexShrink: 0 }}>{t.id}</span>
                      <Icon name="circle" size={8} style={{ color: PRIORITY_COLORS[t.priority], flexShrink: 0, fill: PRIORITY_COLORS[t.priority] }} />
                    </button>
                  ))}
                </>
              )}
              {showMembers && (
                <>
                  {showTasks && <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />}
                  <GroupHeader label={`Members · ${memberResults.length}`} />
                  {memberResults.map(m => (
                    <ResultRow
                      key={m}
                      iconNode={<Avatar name={m} size={20} />}
                      label={m}
                      right={<span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--fg-subtle)' }}>{m.toLowerCase().replace(' ', '.')}@orbital.dev</span>}
                      onClick={onClose}
                    />
                  ))}
                </>
              )}
              {showTags && (
                <>
                  {(showTasks || showMembers) && <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />}
                  <GroupHeader label={`Tags · ${tagResults.length}`} />
                  {tagResults.map(t => (
                    <ResultRow
                      key={t}
                      icon="tag"
                      label={t}
                      right={<span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--fg-subtle)' }}>{state.tasks.filter(tk => tk.tags.includes(t)).length} tasks</span>}
                      onClick={onClose}
                    />
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 16, flexShrink: 0 }}>
          {[['↑↓', 'Navigate'], ['↵', 'Select'], ['esc', 'Close']].map(([key, label]) => (
            <span key={key} style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--fg-subtle)' }}>
              <span className="oc-kbd" style={{ fontSize: 10 }}>{key}</span> {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function GroupHeader({ label }) {
  return (
    <div className="t-label" style={{ padding: '6px 16px 3px', fontSize: 10 }}>{label}</div>
  );
}

function ResultRow({ icon, iconNode, label, right, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        width: '100%', padding: '8px 16px', border: 'none',
        background: 'transparent', cursor: 'pointer', textAlign: 'left',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {iconNode ?? <Icon name={icon} size={14} style={{ color: 'var(--fg-muted)', flexShrink: 0 }} />}
      <span style={{ flex: 1, fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-13)', color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      {right}
    </button>
  );
}
