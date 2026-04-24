import { useState } from 'react';
import { Icon, Avatar } from '../components/primitives.jsx';
import { useApp, A } from '../store/AppContext.jsx';

const SEED_ITEMS = [
  {
    id: 1, tab: 'mentions', type: 'mention', unread: true,
    author: 'Dev Patel', when: '12m ago',
    message: 'mentioned you in a comment on',
    taskId: 'ORB-419', taskTitle: 'Scheduler core implementation',
    body: '@Maya can you take a look at the cron expression parser? I think there might be an edge case with DST transitions.',
  },
  {
    id: 2, tab: 'assigned', type: 'assigned', unread: true,
    author: 'Rae Wong', when: '1h ago',
    message: 'assigned you to',
    taskId: 'ORB-440', taskTitle: 'Onboarding flow redesign',
  },
  {
    id: 3, tab: 'mentions', type: 'mention', unread: true,
    author: 'Jonas Becker', when: '2h ago',
    message: 'mentioned you in',
    taskId: 'ORB-412', taskTitle: 'Realtime event bus',
    body: '@Maya LGTM on the reconnect logic — I think this is ready for your review.',
  },
  {
    id: 4, tab: 'updates', type: 'pr', unread: true,
    author: 'Priya Kapoor', when: '3h ago',
    message: 'opened a PR on',
    taskId: 'ORB-418', taskTitle: 'Token refresh edge case',
    body: 'PR #483: Fix token refresh race condition on concurrent requests',
  },
  {
    id: 5, tab: 'updates', type: 'status', unread: false,
    author: 'Alex Kim', when: 'Yesterday',
    message: 'moved to Merged',
    taskId: 'ORB-425', taskTitle: 'Terraform state migration',
    body: 'Status changed: In progress → Merged',
  },
  {
    id: 6, tab: 'updates', type: 'comment', unread: false,
    author: 'Sam Rivera', when: 'Yesterday',
    message: 'commented on',
    taskId: 'ORB-407', taskTitle: 'Plugin SDK v2 design',
    body: 'Added the revised architecture diagram to the description. Let me know if the plugin lifecycle makes sense.',
  },
  {
    id: 7, tab: 'assigned', type: 'assigned', unread: false,
    author: 'Noor Hassan', when: '2 days ago',
    message: 'assigned you to',
    taskId: 'ORB-434', taskTitle: 'Latency regression in v0.7.8',
  },
  {
    id: 8, tab: 'mentions', type: 'mention', unread: false,
    author: 'Theo Lin', when: '3 days ago',
    message: 'mentioned you in',
    taskId: 'ORB-428', taskTitle: 'CI flakiness on arm64',
    body: '@Maya do we have any metrics on failure rate per test suite? Trying to prioritize the fix.',
  },
];

const TABS = ['All', 'Mentions', 'Assigned', 'Updates'];
const TYPE_ICON = { mention: 'at-sign', assigned: 'user-plus', pr: 'git-pull-request', status: 'refresh-cw', comment: 'message-circle' };
const TYPE_COLOR = { mention: 'var(--accent)', assigned: 'var(--s-done-500)', pr: 'var(--s-review-500)', status: 'var(--fg-muted)', comment: 'var(--fg-muted)' };

export function InboxView({ onClose }) {
  const { dispatch } = useApp();
  const [tab, setTab] = useState('All');
  const [items, setItems] = useState(SEED_ITEMS);

  const filtered = items.filter(it => {
    if (tab === 'All') return true;
    return it.tab === tab.toLowerCase();
  });
  const unreadCount = items.filter(i => i.unread).length;

  function markRead(id) {
    setItems(its => its.map(i => i.id === id ? { ...i, unread: false } : i));
  }
  function markAllRead() {
    setItems(its => its.map(i => ({ ...i, unread: false })));
  }
  function openTask(taskId) {
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
        width: 500, zIndex: 50,
        background: 'var(--bg)', borderLeft: '1px solid var(--border)',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex', flexDirection: 'column',
        animation: 'oc-slide-in-r 240ms var(--ease-out)',
      }}>
        {/* Header */}
        <div style={{ flexShrink: 0, padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="inbox" size={16} style={{ color: 'var(--accent)' }} />
            <span className="t-h2">Inbox</span>
            {unreadCount > 0 && (
              <span style={{ height: 18, minWidth: 18, padding: '0 5px', borderRadius: 999, background: 'var(--accent)', color: '#fff', fontSize: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button className="oc-btn oc-btn--ghost" style={{ fontSize: 12, color: 'var(--fg-muted)' }} onClick={markAllRead}>
              <Icon name="check-check" size={13} /> Mark all read
            </button>
          )}
          <button className="oc-btn oc-btn--ghost oc-btn--icon" onClick={onClose}><Icon name="x" size={15} /></button>
        </div>

        {/* Tabs */}
        <div style={{ flexShrink: 0, display: 'flex', padding: '0 12px', borderBottom: '1px solid var(--border-subtle)' }}>
          {TABS.map(t => {
            const count = t === 'All' ? items.filter(i => i.unread).length : items.filter(i => i.tab === t.toLowerCase() && i.unread).length;
            const active = tab === t;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  height: 36, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 6,
                  background: 'transparent', border: 'none',
                  color: active ? 'var(--fg)' : 'var(--fg-muted)',
                  fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-12)',
                  fontWeight: active ? 600 : 400, cursor: 'pointer',
                  borderBottom: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
                  marginBottom: -1,
                }}
              >
                {t}
                {count > 0 && (
                  <span style={{ height: 16, minWidth: 16, padding: '0 4px', borderRadius: 999, background: active ? 'var(--accent)' : 'var(--bg-card)', color: active ? '#fff' : 'var(--fg-muted)', fontSize: 10, fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center' }}>
              <Icon name="inbox" size={36} style={{ color: 'var(--fg-subtle)', marginBottom: 12 }} />
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-14)', color: 'var(--fg-muted)', marginBottom: 4 }}>All caught up</div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-12)', color: 'var(--fg-subtle)' }}>No {tab !== 'All' ? tab.toLowerCase() : ''} items here</div>
            </div>
          ) : filtered.map((item, i) => (
            <InboxItem
              key={item.id}
              item={item}
              isLast={i === filtered.length - 1}
              onRead={() => markRead(item.id)}
              onOpenTask={() => openTask(item.taskId)}
            />
          ))}
        </div>
      </div>
    </>
  );
}

function InboxItem({ item, isLast, onRead, onOpenTask }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', gap: 12, padding: '14px 16px',
        borderBottom: isLast ? 'none' : '1px solid var(--border-subtle)',
        background: item.unread ? 'var(--bg-card)' : (hover ? 'var(--bg-hover)' : 'transparent'),
        cursor: 'pointer', position: 'relative',
        transition: 'background var(--dur-fast)',
      }}
      onClick={() => { onRead(); onOpenTask(); }}
    >
      {/* Unread dot */}
      {item.unread && (
        <span style={{ position: 'absolute', top: 18, left: 6, width: 6, height: 6, borderRadius: 999, background: 'var(--accent)', flexShrink: 0 }} />
      )}

      {/* Avatar + type icon */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <Avatar name={item.author} size={32} />
        <span style={{
          position: 'absolute', bottom: -2, right: -2, width: 16, height: 16, borderRadius: 999,
          background: TYPE_COLOR[item.type], border: '2px solid var(--bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name={TYPE_ICON[item.type]} size={8} style={{ color: '#fff' }} />
        </span>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-13)', color: 'var(--fg)', lineHeight: 1.4, marginBottom: 4 }}>
          <strong style={{ fontWeight: 600 }}>{item.author}</strong>{' '}
          <span style={{ color: 'var(--fg-muted)' }}>{item.message}</span>{' '}
          <button
            onClick={e => { e.stopPropagation(); onRead(); onOpenTask(); }}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-13)', color: 'var(--accent)', fontWeight: 500 }}
          >
            {item.taskTitle}
          </button>
        </div>
        {item.body && (
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg-muted)', lineHeight: 1.5, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.body}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="t-mono-sm" style={{ color: 'var(--fg-subtle)' }}>{item.when}</span>
          <span className="t-mono-sm" style={{ color: 'var(--fg-subtle)' }}>·</span>
          <span className="t-mono-sm" style={{ color: 'var(--fg-subtle)' }}>{item.taskId}</span>
        </div>
      </div>

      {/* Mark read button on hover */}
      {hover && item.unread && (
        <button
          className="oc-btn oc-btn--ghost oc-btn--icon"
          title="Mark as read"
          onClick={e => { e.stopPropagation(); onRead(); }}
          style={{ flexShrink: 0, alignSelf: 'flex-start' }}
        >
          <Icon name="check" size={13} />
        </button>
      )}
    </div>
  );
}
