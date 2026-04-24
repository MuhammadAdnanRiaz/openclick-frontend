import { useState, useEffect } from 'react';
import { Icon } from '../components/primitives.jsx';
import { useApp, A } from '../store/AppContext.jsx';
import * as notifApi from '../api/notifications.js';

export function NotificationsView({ onClose }) {
  const { dispatch } = useApp();
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    notifApi.list()
      .then(data => { setItems(data.notifications ?? []); setError(null); })
      .catch(err  => setError(err.message || 'Failed to load notifications'))
      .finally(() => setLoading(false));
  }, []);

  const unreadCount = items.filter(i => !i.read).length;

  function markAllRead() {
    setItems(its => its.map(i => ({ ...i, read: true })));
    notifApi.markAllRead().catch(console.error);
  }

  function dismiss(id) {
    setItems(its => its.filter(i => i.id !== id));
    notifApi.dismiss(id).catch(console.error);
  }

  function clearGroup(group) {
    const toClear = items.filter(i => i.group === group).map(i => i.id);
    setItems(its => its.filter(i => i.group !== group));
    toClear.forEach(id => notifApi.dismiss(id).catch(console.error));
  }

  function clearAll() {
    setItems([]);
    notifApi.clearAll().catch(console.error);
  }

  function openTask(taskId) {
    if (!taskId) return;
    dispatch({ type: A.SET_UI, payload: { openTaskId: taskId, sidePanel: null } });
  }

  const groupKeys = [...new Set(items.map(i => i.group))];

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
        width: 440, zIndex: 50,
        background: 'var(--bg)', borderLeft: '1px solid var(--border)',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex', flexDirection: 'column',
        animation: 'oc-slide-in-r 240ms var(--ease-out)',
      }}>
        {/* Header */}
        <div style={{ flexShrink: 0, padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="bell" size={16} style={{ color: 'var(--accent)' }} />
          <span className="t-h2" style={{ flex: 1 }}>Notifications</span>
          {unreadCount > 0 && (
            <>
              <span style={{ height: 18, minWidth: 18, padding: '0 5px', borderRadius: 999, background: 'var(--s-blocked-500)', color: '#fff', fontSize: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                {unreadCount}
              </span>
              <button className="oc-btn oc-btn--ghost" style={{ fontSize: 12, color: 'var(--fg-muted)' }} onClick={markAllRead}>
                <Icon name="check-check" size={13} /> Mark all read
              </button>
            </>
          )}
          <button className="oc-btn oc-btn--ghost oc-btn--icon" onClick={onClose}><Icon name="x" size={15} /></button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <NotifLoadingState />
          ) : error ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <Icon name="wifi-off" size={32} style={{ color: 'var(--fg-subtle)', marginBottom: 12 }} />
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-13)', color: 'var(--fg-muted)' }}>{error}</div>
            </div>
          ) : items.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center' }}>
              <Icon name="bell-off" size={36} style={{ color: 'var(--fg-subtle)', marginBottom: 12 }} />
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-14)', color: 'var(--fg-muted)' }}>No notifications</div>
            </div>
          ) : (
            groupKeys.map(group => {
              const groupItems = items.filter(i => i.group === group);
              if (!groupItems.length) return null;
              return (
                <div key={group}>
                  <div style={{ padding: '12px 16px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="t-label" style={{ fontSize: 10 }}>{group}</span>
                    <button
                      className="oc-btn oc-btn--ghost"
                      style={{ fontSize: 10, height: 20, padding: '0 6px', color: 'var(--fg-subtle)' }}
                      onClick={() => clearGroup(group)}
                    >
                      Clear
                    </button>
                  </div>
                  {groupItems.map((item, idx) => (
                    <NotifItem
                      key={item.id}
                      item={item}
                      isLast={idx === groupItems.length - 1}
                      onDismiss={() => dismiss(item.id)}
                      onOpen={() => { openTask(item.taskId); if (item.taskId) onClose(); }}
                    />
                  ))}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ flexShrink: 0, padding: '10px 16px', borderTop: '1px solid var(--border-subtle)' }}>
            <button
              className="oc-btn oc-btn--ghost"
              style={{ width: '100%', justifyContent: 'center', color: 'var(--fg-muted)', fontSize: 12 }}
              onClick={clearAll}
            >
              <Icon name="trash-2" size={12} /> Clear all notifications
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function NotifItem({ item, isLast, onDismiss, onOpen }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px',
        borderBottom: isLast ? 'none' : '1px solid var(--border-subtle)',
        background: !item.read ? 'var(--bg-card)' : (hover ? 'var(--bg-hover)' : 'transparent'),
        cursor: item.taskId ? 'pointer' : 'default',
        transition: 'background var(--dur-fast)',
      }}
      onClick={onOpen}
    >
      <div style={{ position: 'relative', paddingTop: 2 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 'var(--r-md)', flexShrink: 0,
          background: (item.color || 'var(--accent)') + '22',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name={item.icon || 'bell'} size={15} style={{ color: item.color || 'var(--accent)' }} />
        </div>
        {!item.read && (
          <span style={{ position: 'absolute', top: 0, right: -2, width: 7, height: 7, borderRadius: 999, background: 'var(--accent)', border: '2px solid var(--bg)' }} />
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-13)', fontWeight: item.read ? 400 : 600, color: 'var(--fg)', marginBottom: 3 }}>
          {item.title}
        </div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg-muted)', lineHeight: 1.5, marginBottom: 5 }}>
          {item.desc}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="t-mono-sm" style={{ color: 'var(--fg-subtle)' }}>{item.when}</span>
          {item.taskId && (
            <>
              <span className="t-mono-sm" style={{ color: 'var(--fg-subtle)' }}>·</span>
              <span className="t-mono-sm" style={{ color: 'var(--accent)' }}>{item.taskId}</span>
            </>
          )}
        </div>
      </div>

      {hover && (
        <button
          className="oc-btn oc-btn--ghost oc-btn--icon"
          title="Dismiss"
          onClick={e => { e.stopPropagation(); onDismiss(); }}
          style={{ flexShrink: 0 }}
        >
          <Icon name="x" size={12} />
        </button>
      )}
    </div>
  );
}

function NotifLoadingState() {
  return (
    <div style={{ padding: '12px 0' }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ width: 32, height: 32, borderRadius: 'var(--r-md)', background: 'var(--bg-card)', flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ height: 13, borderRadius: 'var(--r-sm)', background: 'var(--bg-card)', width: '60%' }} />
            <div style={{ height: 11, borderRadius: 'var(--r-sm)', background: 'var(--bg-card)', width: '80%' }} />
            <div style={{ height: 10, borderRadius: 'var(--r-sm)', background: 'var(--bg-card)', width: '30%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}
