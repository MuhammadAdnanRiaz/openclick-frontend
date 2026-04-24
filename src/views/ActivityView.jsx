import { useState } from 'react';
import { Icon, Avatar } from '../components/primitives.jsx';
import { useApp, A } from '../store/AppContext.jsx';

const FEED = [
  { id: 1,  when: '5m ago',    author: 'Dev Patel',    icon: 'message-circle', color: 'var(--accent)',          text: 'commented on', task: 'ORB-419', taskTitle: 'Scheduler core implementation', body: 'Just pushed the DST fix — should handle the edge case we discussed.' },
  { id: 2,  when: '18m ago',   author: 'Priya Kapoor', icon: 'git-pull-request', color: 'var(--s-review-500)', text: 'opened PR #483 on', task: 'ORB-418', taskTitle: 'Token refresh edge case', body: null },
  { id: 3,  when: '42m ago',   author: 'Rae Wong',     icon: 'refresh-cw',     color: 'var(--fg-muted)',        text: 'moved to In review', task: 'ORB-407', taskTitle: 'Plugin SDK v2 design', body: null },
  { id: 4,  when: '1h ago',    author: 'Alex Kim',     icon: 'git-merge',      color: 'var(--s-merged-500)',    text: 'merged', task: 'ORB-425', taskTitle: 'Terraform state migration', body: null },
  { id: 5,  when: '2h ago',    author: 'Jonas Becker', icon: 'user-plus',      color: 'var(--s-done-500)',      text: 'assigned Maya Chen to', task: 'ORB-440', taskTitle: 'Onboarding flow redesign', body: null },
  { id: 6,  when: '3h ago',    author: 'Sam Rivera',   icon: 'message-circle', color: 'var(--accent)',          text: 'commented on', task: 'ORB-412', taskTitle: 'Realtime event bus', body: 'The reconnect backoff looks good. Approving.' },
  { id: 7,  when: '4h ago',    author: 'Maya Chen',    icon: 'plus-circle',    color: 'var(--s-open-500)',      text: 'created', task: 'ORB-440', taskTitle: 'Onboarding flow redesign', body: null },
  { id: 8,  when: '5h ago',    author: 'Noor Hassan',  icon: 'triangle-alert', color: 'var(--s-blocked-500)',   text: 'marked as blocked', task: 'ORB-399', taskTitle: 'gRPC gateway upgrade', body: 'Waiting on upstream fix in envoy-proxy v1.29.' },
  { id: 9,  when: 'Yesterday', author: 'Theo Lin',     icon: 'git-branch',     color: 'var(--fg-muted)',        text: 'linked branch feat/ci-arm64 to', task: 'ORB-428', taskTitle: 'CI flakiness on arm64', body: null },
  { id: 10, when: 'Yesterday', author: 'Izzy Park',    icon: 'user',           color: 'var(--accent)',          text: 'joined the workspace', task: null, taskTitle: null, body: null },
  { id: 11, when: 'Yesterday', author: 'Dev Patel',    icon: 'refresh-cw',     color: 'var(--fg-muted)',        text: 'moved to In progress', task: 'ORB-419', taskTitle: 'Scheduler core implementation', body: null },
  { id: 12, when: '2 days ago',author: 'Priya Kapoor', icon: 'check-circle-2', color: 'var(--s-done-500)',      text: 'completed all subtasks on', task: 'ORB-414', taskTitle: 'CLI auth flow', body: null },
];

const GROUPS = ['Today', 'Yesterday', '2 days ago'];

function groupItems(items) {
  const result = {};
  items.forEach(item => {
    const g = ['5m ago','18m ago','42m ago','1h ago','2h ago','3h ago','4h ago','5h ago'].includes(item.when) ? 'Today' : item.when === 'Yesterday' ? 'Yesterday' : '2 days ago';
    if (!result[g]) result[g] = [];
    result[g].push(item);
  });
  return result;
}

export function ActivityView({ onClose }) {
  const { dispatch } = useApp();
  const [filter, setFilter] = useState('all');
  const grouped = groupItems(FEED);

  function openTask(taskId) {
    if (!taskId) return;
    dispatch({ type: A.SET_UI, payload: { openTaskId: taskId, sidePanel: null } });
  }

  const FILTERS = [
    { v: 'all',      label: 'All' },
    { v: 'comments', label: 'Comments' },
    { v: 'status',   label: 'Status' },
    { v: 'prs',      label: 'PRs' },
  ];

  function matchesFilter(item) {
    if (filter === 'all') return true;
    if (filter === 'comments') return item.icon === 'message-circle';
    if (filter === 'status') return ['refresh-cw','triangle-alert','git-merge','check-circle-2','plus-circle'].includes(item.icon);
    if (filter === 'prs') return ['git-pull-request','git-merge','git-branch'].includes(item.icon);
    return true;
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
          {GROUPS.map(group => {
            const items = (grouped[group] ?? []).filter(matchesFilter);
            if (!items.length) return null;
            return (
              <div key={group}>
                <div style={{ padding: '10px 16px 4px' }}>
                  <span className="t-label" style={{ fontSize: 10 }}>{group}</span>
                </div>
                {items.map((item, i) => (
                  <ActivityItem
                    key={item.id}
                    item={item}
                    isLast={i === items.length - 1}
                    onOpenTask={() => { openTask(item.task); }}
                  />
                ))}
              </div>
            );
          })}
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
      {/* Avatar with icon overlay */}
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
