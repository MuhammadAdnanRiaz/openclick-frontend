import { useState } from 'react';
import { useApp, A } from '../store/AppContext.jsx';
import { Icon, AvatarStack, StatusChip, Priority, BranchPill, PRPill } from '../components/primitives.jsx';
import { STATUSES } from '../data.js';

const LIST_GROUPS = [
  { key: 'progress', label: 'In progress' },
  { key: 'review',   label: 'In review' },
  { key: 'open',     label: 'Open' },
  { key: 'blocked',  label: 'Blocked' },
  { key: 'merged',   label: 'Merged' },
  { key: 'backlog',  label: 'Backlog' },
];

export function ListView() {
  const { visibleTasks, dispatch } = useApp();

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '4px 0 20px' }}>
      <div style={{
        position: 'sticky', top: 0, zIndex: 2,
        display: 'grid',
        gridTemplateColumns: '28px 90px 1fr 130px 110px 100px 150px 80px 70px',
        padding: '0 18px', background: 'var(--bg)',
        borderBottom: '1px solid var(--border-subtle)',
        height: 34, alignItems: 'center',
      }}>
        <span />
        <span className="t-label">ID</span>
        <span className="t-label">Task</span>
        <span className="t-label">Status</span>
        <span className="t-label">Assignees</span>
        <span className="t-label">Due</span>
        <span className="t-label">Branch · PR</span>
        <span className="t-label">Comments</span>
        <span className="t-label" style={{ textAlign: 'right' }}>Progress</span>
      </div>

      {LIST_GROUPS.map(g => {
        const rows = visibleTasks.filter(t => t.status === g.key);
        if (!rows.length) return null;
        return (
          <div key={g.key}>
            <div style={{ padding: '12px 18px 6px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="chevron-down" size={13} style={{ color: 'var(--fg-subtle)' }} />
              <span style={{ width: 8, height: 8, borderRadius: 999, background: STATUSES[g.key].dot }} />
              <span className="t-h3">{g.label}</span>
              <span className="t-mono-sm" style={{ color: 'var(--fg-subtle)' }}>{rows.length}</span>
            </div>
            <div>
              {rows.map(t => (
                <ListRow
                  key={t.id}
                  task={t}
                  onOpen={() => dispatch({ type: A.SET_UI, payload: { openTaskId: t.id } })}
                />
              ))}
              <button
                onClick={() => dispatch({ type: A.SET_UI, payload: { newTaskOpen: true, newTaskInitialStatus: g.key } })}
                style={{
                  width: '100%', padding: '8px 18px 8px 46px', textAlign: 'left',
                  background: 'transparent', border: 'none',
                  color: 'var(--fg-subtle)', fontSize: 'var(--fs-12)', fontFamily: 'var(--font-sans)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                }}>
                <Icon name="plus" size={12} /> Add task
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ListRow({ task, onOpen }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '28px 90px 1fr 130px 110px 100px 150px 80px 70px',
        alignItems: 'center', padding: '0 18px',
        height: 'var(--row-h, 36px)',
        background: hover ? 'var(--bg-hover)' : 'transparent',
        borderBottom: '1px solid var(--border-subtle)',
        cursor: 'pointer', fontSize: 'var(--fs-13)',
      }}
    >
      <Priority level={task.priority} />
      <span className="t-mono-sm" style={{ color: 'var(--fg-subtle)' }}>{task.id}</span>
      <span style={{ color: 'var(--fg)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 10 }}>{task.title}</span>
      <StatusChip status={task.status} />
      <AvatarStack names={task.assignees} max={3} size={20} />
      <span className="t-small">{task.due}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden' }}>
        {task.pr && <PRPill id={task.pr.id} state={task.pr.state} />}
        {!task.pr && task.branch && <BranchPill name={task.branch.length > 16 ? task.branch.slice(0, 16) + '…' : task.branch} />}
        {!task.pr && !task.branch && <span className="t-subtle" style={{ fontSize: 11 }}>—</span>}
      </span>
      <span className="t-small" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        {task.comments > 0 ? (<><Icon name="message-square" size={11} />{task.comments}</>) : '—'}
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
        {task.checks[1] > 0 && (
          <>
            <div style={{ width: 36, height: 3, background: 'var(--bg-card)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{
                width: `${(task.checks[0] / task.checks[1]) * 100}%`, height: '100%',
                background: task.checks[0] === task.checks[1] ? 'var(--s-merged-500)' : 'var(--accent)',
              }} />
            </div>
            <span className="t-mono-sm" style={{ color: 'var(--fg-subtle)', fontSize: 10 }}>{task.checks[0]}/{task.checks[1]}</span>
          </>
        )}
      </span>
    </div>
  );
}
