import { useMemo, useState } from 'react';
import { Icon, StatusChip } from '../components/primitives.jsx';
import { useApp, A } from '../store/AppContext.jsx';

const STATUS_GROUPS = [
  { key: 'backlog',  label: 'Backlog',     icon: 'circle-dashed' },
  { key: 'open',     label: 'Open',        icon: 'circle' },
  { key: 'progress', label: 'In progress', icon: 'circle-dot' },
  { key: 'review',   label: 'In review',   icon: 'eye' },
  { key: 'blocked',  label: 'Blocked',     icon: 'circle-x' },
  { key: 'merged',   label: 'Merged',      icon: 'git-merge' },
  { key: 'done',     label: 'Done',        icon: 'check-circle-2' },
];

const PRIORITY_ICON = { urgent: 'flame', high: 'arrow-up', normal: 'minus', low: 'arrow-down' };
const PRIORITY_COLOR = {
  urgent: 'var(--s-blocked-500)',
  high:   '#fb923c',
  normal: 'var(--fg-subtle)',
  low:    'var(--fg-subtle)',
};

export function MyTasksView({ onClose }) {
  const { state, dispatch } = useApp();
  const [collapsed, setCollapsed] = useState({});
  const myName = state.user?.name ?? '';

  const myTasks = useMemo(
    () => state.tasks.filter(t => myName && t.assignees.includes(myName)),
    [state.tasks, myName]
  );

  const grouped = useMemo(
    () => STATUS_GROUPS.map(g => ({ ...g, tasks: myTasks.filter(t => t.status === g.key) })).filter(g => g.tasks.length > 0),
    [myTasks]
  );

  function openTask(id) {
    dispatch({ type: A.SET_UI, payload: { openTaskId: id, sidePanel: null } });
  }

  function toggleGroup(key) {
    setCollapsed(c => ({ ...c, [key]: !c[key] }));
  }

  const doneTasks = myTasks.filter(t => t.status === 'done' || t.status === 'merged').length;
  const totalTasks = myTasks.length;

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
        width: 560, zIndex: 50,
        background: 'var(--bg)', borderLeft: '1px solid var(--border)',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex', flexDirection: 'column',
        animation: 'oc-slide-in-r 240ms var(--ease-out)',
      }}>
        {/* Header */}
        <div style={{ flexShrink: 0, padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <Icon name="bookmark" size={16} style={{ color: 'var(--accent)' }} />
            <span className="t-h2" style={{ flex: 1 }}>My tasks</span>
            <button
              className="oc-btn oc-btn--primary"
              onClick={() => { dispatch({ type: A.SET_UI, payload: { newTaskOpen: true, newTaskInitialStatus: 'open', sidePanel: null } }); onClose(); }}
            >
              <Icon name="plus" size={13} /> New task
            </button>
            <button className="oc-btn oc-btn--ghost oc-btn--icon" onClick={onClose}><Icon name="x" size={15} /></button>
          </div>

          {/* Progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, height: 5, background: 'var(--bg-card)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{
                width: totalTasks ? `${(doneTasks / totalTasks) * 100}%` : '0%',
                height: '100%', background: 'var(--accent)', borderRadius: 999,
                transition: 'width 300ms',
              }} />
            </div>
            <span className="t-mono-sm" style={{ color: 'var(--fg-muted)', flexShrink: 0 }}>{doneTasks}/{totalTasks} done</span>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {myTasks.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center' }}>
              <Icon name="bookmark" size={36} style={{ color: 'var(--fg-subtle)', marginBottom: 12 }} />
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-14)', color: 'var(--fg-muted)', marginBottom: 4 }}>No tasks assigned to you</div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-12)', color: 'var(--fg-subtle)' }}>Tasks assigned to you will appear here</div>
            </div>
          ) : (
            grouped.map(group => (
              <TaskGroup
                key={group.key}
                group={group}
                collapsed={!!collapsed[group.key]}
                onToggle={() => toggleGroup(group.key)}
                onOpenTask={openTask}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}

function TaskGroup({ group, collapsed, onToggle, onOpenTask }) {
  return (
    <div style={{ marginBottom: 4 }}>
      {/* Group header */}
      <button
        onClick={onToggle}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          width: '100%', padding: '6px 16px', border: 'none',
          background: 'transparent', cursor: 'pointer', textAlign: 'left',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <Icon name={collapsed ? 'chevron-right' : 'chevron-down'} size={12} style={{ color: 'var(--fg-subtle)' }} />
        <Icon name={group.icon} size={13} style={{ color: 'var(--fg-muted)' }} />
        <span style={{ flex: 1, fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-13)', fontWeight: 500, color: 'var(--fg)' }}>{group.label}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-subtle)' }}>{group.tasks.length}</span>
      </button>

      {/* Tasks */}
      {!collapsed && group.tasks.map((task, i) => (
        <TaskRow
          key={task.id}
          task={task}
          isLast={i === group.tasks.length - 1}
          onOpen={() => onOpenTask(task.id)}
        />
      ))}
    </div>
  );
}

function TaskRow({ task, isLast, onOpen }) {
  const [hover, setHover] = useState(false);
  const overdue = task.due && task.due !== '—' && (() => {
    const [mon, day] = task.due.split(' ');
    const MONTH_IDX = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
    return new Date(2026, MONTH_IDX[mon] ?? 0, parseInt(day)).getTime() < Date.now();
  })();

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onOpen}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '7px 16px 7px 40px',
        borderBottom: isLast ? 'none' : '1px solid var(--border-subtle)',
        background: hover ? 'var(--bg-hover)' : 'transparent',
        cursor: 'pointer', transition: 'background var(--dur-fast)',
      }}
    >
      <StatusChip status={task.status} size="sm" dot />

      <span style={{ flex: 1, fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-13)', color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {task.title}
      </span>

      {/* Tags */}
      {task.tags.slice(0, 2).map(tag => (
        <span key={tag} style={{
          display: 'inline-flex', alignItems: 'center', height: 18, padding: '0 6px',
          borderRadius: 999, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
          fontFamily: 'var(--font-sans)', fontSize: 10, color: 'var(--fg-muted)',
          flexShrink: 0,
        }}>
          {tag}
        </span>
      ))}

      {/* Due date */}
      {task.due && task.due !== '—' && (
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-sans)', fontSize: 11, color: overdue ? 'var(--s-blocked-500)' : 'var(--fg-subtle)', flexShrink: 0 }}>
          <Icon name="calendar" size={11} />
          {task.due}
        </span>
      )}

      {/* Priority */}
      <Icon
        name={PRIORITY_ICON[task.priority]}
        size={13}
        style={{ color: PRIORITY_COLOR[task.priority], flexShrink: 0 }}
      />

      {/* ID */}
      <span className="t-mono-sm" style={{ color: 'var(--fg-subtle)', flexShrink: 0, opacity: hover ? 1 : 0.6 }}>{task.id}</span>
    </div>
  );
}
