import { useState, useEffect } from 'react';
import { Icon, Avatar } from '../components/primitives.jsx';
import { useApp, A } from '../store/AppContext.jsx';
import * as activityApi from '../api/activity.js';

const FILTERS = [
  { v: 'all',      label: 'All' },
  { v: 'comments', label: 'Comments' },
  { v: 'status',   label: 'Status' },
  { v: 'prs',      label: 'PRs' },
];

// Map API icon names to filter buckets for client-side filtering
function matchesFilter(item, filter) {
  if (filter === 'all') return true;
  if (filter === 'comments') return item.icon === 'message-circle';
  if (filter === 'status')   return ['refresh-cw','triangle-alert','git-merge','check-circle-2','plus-circle'].includes(item.icon);
  if (filter === 'prs')      return ['git-pull-request','git-merge','git-branch'].includes(item.icon);
  return true;
}

export function ActivityView({ onClose }) {
  const { state, dispatch } = useApp();
  const workspaceId = state.workspaceId;

  const [filter, setFilter] = useState('all');
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    if (!workspaceId) return;
    setLoading(true);
    activityApi.list(workspaceId, { filter })
      .then(data => { setItems(data.activities ?? []); setError(null); })
      .catch(err  => setError(err.message || 'Failed to load activity'))
      .finally(() => setLoading(false));
  }, [workspaceId, filter]);

  function openTask(taskId) {
    if (!taskId) return;
    dispatch({ type: A.SET_UI, payload: { openTaskId: taskId, sidePanel: null } });
  }

  // Group items by their `group` field from the API
  const grouped = items.reduce((acc, item) => {
    const g = item.group || 'Today';
    if (!acc[g]) acc[g] = [];
    acc[g].push(item);
    return acc;
  }, {});
  const groupKeys = Object.keys(grouped);

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0, zIndex: 40,
          background: 'rgba(5,5,10,0.35)', backdropFilter: 'blur(2px)',
          animation: 'oc-fade-in 200ms var(--ease-out)',
        }}
      />
      <div style={{
        position: 'absolute', top: 0, right: 0, bottom: 0,
        width: 460, zIndex: 50,
        background: 'var(--bg)', borderLeft: '1px solid var(--border)',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex', flexDirection: 'column',
        animation: 'oc-slide-in-r 240ms var(--ease-out)',
      }}>
        {/* Header */}
        <div style={{ flexShrink: 0, padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="activity" size={16} style={{ color: 'var(--accent)' }} />
          <span className="t-h2" style={{ flex: 1 }}>Activity</span>
          <button className="oc-btn oc-btn--ghost oc-btn--icon" onClick={onClose}><Icon name="x" size={15} /></button>
        </div>

        {/* Filter tabs */}
        <div style={{ flexShrink: 0, display: 'flex', padding: '0 12px', borderBottom: '1px solid var(--border-subtle)' }}>
          {FILTERS.map(f => (
            <button
              key={f.v}
              onClick={() => setFilter(f.v)}
              style={{
                height: 34, padding: '0 10px', display: 'flex', alignItems: 'center',
                background: 'transparent', border: 'none',
                color: filter === f.v ? 'var(--fg)' : 'var(--fg-muted)',
                fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-12)',
                fontWeight: filter === f.v ? 600 : 400, cursor: 'pointer',
                borderBottom: `2px solid ${filter === f.v ? 'var(--accent)' : 'transparent'}`,
                marginBottom: -1,
              }}
            >{f.label}</button>
          ))}
        </div>

        {/* Feed */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} onRetry={() => setFilter(f => f)} />
          ) : items.length === 0 ? (
            <EmptyState />
          ) : (
            groupKeys.map(group => {
              const grpItems = grouped[group].filter(i => matchesFilter(i, filter));
              if (!grpItems.length) return null;
              return (
                <div key={group}>
                  <div style={{ padding: '10px 16px 4px' }}>
                    <span className="t-label" style={{ fontSize: 10 }}>{group}</span>
                  </div>
                  {grpItems.map((item, i) => (
                    <ActivityItem
                      key={item.id}
                      item={item}
                      isLast={i === grpItems.length - 1}
                      onOpenTask={() => openTask(item.task)}
                    />
                  ))}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

function ActivityItem({ item, isLast, onOpenTask }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', gap: 12, padding: '11px 16px',
        borderBottom: isLast ? 'none' : '1px solid var(--border-subtle)',
        background: hover ? 'var(--bg-hover)' : 'transparent',
        transition: 'background var(--dur-fast)',
      }}
    >
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <Avatar name={item.author} size={30} />
        <span style={{
          position: 'absolute', bottom: -2, right: -2, width: 16, height: 16, borderRadius: 999,
          background: item.color, border: '2px solid var(--bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name={item.icon} size={8} style={{ color: '#fff' }} />
        </span>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-13)', lineHeight: 1.5, color: 'var(--fg)' }}>
          <strong style={{ fontWeight: 600 }}>{item.author}</strong>{' '}
          <span style={{ color: 'var(--fg-muted)' }}>{item.text}</span>
          {item.task && (
            <>{' '}<button onClick={onOpenTask} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-13)', color: 'var(--accent)', fontWeight: 500 }}>{item.taskTitle}</button></>
          )}
        </div>
        {item.body && (
          <div style={{ marginTop: 5, padding: '6px 10px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-sm)', fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg-muted)', lineHeight: 1.5 }}>
            {item.body}
          </div>
        )}
        <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="t-mono-sm" style={{ color: 'var(--fg-subtle)' }}>{item.when}</span>
          {item.task && (
            <>
              <span className="t-mono-sm" style={{ color: 'var(--fg-subtle)' }}>·</span>
              <button onClick={onOpenTask} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-subtle)' }}>{item.task}</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--bg-card)', flexShrink: 0, animation: 'oc-pulse 1.5s ease-in-out infinite' }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ height: 13, borderRadius: 'var(--r-sm)', background: 'var(--bg-card)', width: '70%', animation: 'oc-pulse 1.5s ease-in-out infinite' }} />
            <div style={{ height: 11, borderRadius: 'var(--r-sm)', background: 'var(--bg-card)', width: '40%', animation: 'oc-pulse 1.5s ease-in-out infinite' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ padding: 48, textAlign: 'center' }}>
      <Icon name="activity" size={36} style={{ color: 'var(--fg-subtle)', marginBottom: 12 }} />
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-14)', color: 'var(--fg-muted)' }}>No activity yet</div>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div style={{ padding: 48, textAlign: 'center' }}>
      <Icon name="wifi-off" size={32} style={{ color: 'var(--fg-subtle)', marginBottom: 12 }} />
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-13)', color: 'var(--fg-muted)', marginBottom: 12 }}>{message}</div>
      <button className="oc-btn oc-btn--secondary" style={{ fontSize: 12 }} onClick={onRetry}>
        <Icon name="refresh-cw" size={12} /> Retry
      </button>
    </div>
  );
}
