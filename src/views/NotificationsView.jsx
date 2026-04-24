import { useState } from 'react';
import { Icon } from '../components/primitives.jsx';
import { useApp, A } from '../store/AppContext.jsx';

const SEED_NOTIFICATIONS = [
  {
    id: 1, group: 'Today', read: false,
    icon: 'git-merge', color: 'var(--s-merged-500)',
    title: 'ORB-425 merged to main',
    desc: 'Terraform state migration was successfully merged by Alex Kim',
    when: '2h ago', taskId: 'ORB-425',
  },
  {
    id: 2, group: 'Today', read: false,
    icon: 'clock', color: '#fb923c',
    title: 'Due soon: ORB-419',
    desc: 'Scheduler core implementation is due Apr 28 — 4 days remaining',
    when: '3h ago', taskId: 'ORB-419',
  },
  {
    id: 3, group: 'Today', read: false,
    icon: 'user-plus', color: 'var(--accent)',
    title: 'Izzy Park joined the workspace',
    desc: 'Izzy Park accepted the invitation and joined Orbital',
    when: '5h ago', taskId: null,
  },
  {
    id: 4, group: 'Today', read: true,
    icon: 'git-pull-request', color: 'var(--s-review-500)',
    title: 'PR #481 ready for review',
    desc: 'Realtime event bus — Priya Kapoor opened a pull request',
    when: '6h ago', taskId: 'ORB-412',
  },
  {
    id: 5, group: 'Yesterday', read: true,
    icon: 'triangle-alert', color: 'var(--s-blocked-500)',
    title: 'ORB-399 marked as blocked',
    desc: 'gRPC gateway upgrade is blocked on an external dependency',
    when: 'Yesterday, 2pm', taskId: 'ORB-399',
  },
  {
    id: 6, group: 'Yesterday', read: true,
    icon: 'check-circle-2', color: 'var(--s-done-500)',
    title: 'Sprint goals updated',
    desc: 'Jonas Becker updated Sprint 24 goals and acceptance criteria',
    when: 'Yesterday, 11am', taskId: null,
  },
  {
    id: 7, group: 'This week', read: true,
    icon: 'zap', color: '#eab308',
    title: 'CI pipeline improved by 40%',
    desc: 'Cache optimization reduced build times across all workflows',
    when: '2 days ago', taskId: null,
  },
  {
    id: 8, group: 'This week', read: true,
    icon: 'refresh-cw', color: 'var(--fg-muted)',
    title: 'ORB-407 moved to Review',
    desc: 'Plugin SDK v2 design is ready for review — assigned to Dev Patel',
    when: '3 days ago', taskId: 'ORB-407',
  },
];

const GROUPS = ['Today', 'Yesterday', 'This week'];

export function NotificationsView({ onClose }) {
  const { dispatch } = useApp();
  const [items, setItems] = useState(SEED_NOTIFICATIONS);
  const unreadCount = items.filter(i => !i.read).length;

  function markAllRead() { setItems(its => its.map(i => ({ ...i, read: true }))); }
  function dismiss(id) { setItems(its => its.filter(i => i.id !== id)); }
  function openTask(taskId) {
    if (!taskId) return;
    dispatch({ type: A.SET_UI, payload: { openTaskId: taskId, sidePanel: null } });
  }

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
          {items.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center' }}>
              <Icon name="bell-off" size={36} style={{ color: 'var(--fg-subtle)', marginBottom: 12 }} />
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-14)', color: 'var(--fg-muted)' }}>No notifications</div>
            </div>
          ) : (
            GROUPS.map(group => {
              const groupItems = items.filter(i => i.group === group);
              if (!groupItems.length) return null;
              return (
                <div key={group}>
                  <div style={{ padding: '12px 16px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="t-label" style={{ fontSize: 10 }}>{group}</span>
                    <button
                      className="oc-btn oc-btn--ghost"
                      style={{ fontSize: 10, height: 20, padding: '0 6px', color: 'var(--fg-subtle)' }}
                      onClick={() => setItems(its => its.filter(i => i.group !== group))}
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
              onClick={() => setItems([])}
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
      {/* Unread indicator */}
      <div style={{ position: 'relative', paddingTop: 2 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 'var(--r-md)', flexShrink: 0,
          background: item.color + '22',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name={item.icon} size={15} style={{ color: item.color }} />
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
