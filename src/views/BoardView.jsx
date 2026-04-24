import { useState } from 'react';
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  useDroppable, useDraggable, closestCenter,
} from '@dnd-kit/core';
import { useApp, A } from '../store/AppContext.jsx';
import { Icon, AvatarStack, Priority, BranchPill, PRPill } from '../components/primitives.jsx';

const BOARD_COLUMNS = [
  { key: 'backlog',  label: 'Backlog',     color: 'var(--s-closed-500)' },
  { key: 'open',     label: 'Open',        color: 'var(--s-open-500)' },
  { key: 'progress', label: 'In progress', color: 'var(--s-progress-500)' },
  { key: 'review',   label: 'In review',   color: 'var(--s-review-500)' },
  { key: 'merged',   label: 'Merged',      color: 'var(--s-merged-500)' },
  { key: 'blocked',  label: 'Blocked',     color: 'var(--s-blocked-500)' },
];

export function BoardView() {
  const { visibleTasks, dispatch } = useApp();
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  function handleDragStart(event) {
    const task = visibleTasks.find(t => t.id === event.active.id);
    setActiveTask(task ?? null);
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveTask(null);
    if (!over || active.id === over.id) return;
    // over.id is a column key when dropped on a column droppable
    const colKeys = BOARD_COLUMNS.map(c => c.key);
    if (colKeys.includes(over.id)) {
      dispatch({ type: A.TASK_UPDATE, payload: { id: active.id, patch: { status: over.id } } });
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '16px 18px 20px', background: 'var(--bg)' }}>
        <div style={{ display: 'flex', gap: 14, minWidth: 'fit-content', height: '100%' }}>
          {BOARD_COLUMNS.map(col => (
            <BoardColumn
              key={col.key}
              col={col}
              tasks={visibleTasks.filter(t => t.status === col.key)}
            />
          ))}
        </div>
      </div>
      <DragOverlay dropAnimation={null}>
        {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}

function BoardColumn({ col, tasks }) {
  const { dispatch } = useApp();
  const { setNodeRef, isOver } = useDroppable({ id: col.key });

  return (
    <div style={{
      width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column',
      background: isOver ? 'var(--bg-hover)' : 'var(--bg-card)',
      border: `1px solid ${isOver ? 'var(--accent)' : 'var(--border-subtle)'}`,
      borderRadius: 'var(--r-lg)', maxHeight: '100%',
      transition: 'background 120ms, border-color 120ms',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px 8px', borderBottom: '1px solid var(--border-subtle)' }}>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: col.color }} />
        <span className="t-h3">{col.label}</span>
        <span className="t-mono-sm" style={{ color: 'var(--fg-subtle)' }}>{tasks.length}</span>
        <div style={{ flex: 1 }} />
        <button className="oc-btn oc-btn--ghost oc-btn--icon" style={{ height: 22, width: 22 }}
          onClick={() => dispatch({ type: A.SET_UI, payload: { newTaskOpen: true, newTaskInitialStatus: col.key } })}>
          <Icon name="plus" size={13} />
        </button>
        <ColumnMenu colKey={col.key} colLabel={col.label} taskCount={tasks.length} dispatch={dispatch} />
      </div>

      <div ref={setNodeRef} style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {tasks.map(t => <TaskCard key={t.id} task={t} />)}
        {tasks.length === 0 && (
          <div style={{ padding: 16, textAlign: 'center', color: 'var(--fg-faint)', fontSize: 'var(--fs-12)' }}>
            Drop tasks here
          </div>
        )}
        <button
          onClick={() => dispatch({ type: A.SET_UI, payload: { newTaskOpen: true, newTaskInitialStatus: col.key } })}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px',
            borderRadius: 'var(--r-md)', border: '1px dashed var(--border)',
            background: 'transparent', color: 'var(--fg-subtle)',
            fontSize: 'var(--fs-12)', fontFamily: 'var(--font-sans)', cursor: 'pointer',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <Icon name="plus" size={12} /> Add task
        </button>
      </div>
    </div>
  );
}

function ColumnMenu({ colKey, colLabel, taskCount, dispatch }) {
  const [open, setOpen] = useState(false);
  const ref = { current: null };

  // click-outside
  const setRef = el => { ref.current = el; };
  useState(() => {
    function listener(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  });

  function collapseAll() {
    dispatch({ type: A.SET_UI, payload: { newTaskOpen: false } });
    setOpen(false);
  }

  return (
    <div ref={setRef} style={{ position: 'relative' }}>
      <button className="oc-btn oc-btn--ghost oc-btn--icon" style={{ height: 22, width: 22 }} onClick={() => setOpen(o => !o)}>
        <Icon name="more-horizontal" size={13} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: 4, zIndex: 200,
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-pop)', minWidth: 190,
          padding: 6, animation: 'oc-scale-in 140ms var(--ease-out)',
        }}>
          {[
            { icon: 'plus', label: 'Add task', action: () => { dispatch({ type: A.SET_UI, payload: { newTaskOpen: true, newTaskInitialStatus: colKey } }); setOpen(false); } },
            { icon: 'sort-asc', label: 'Sort by priority', action: () => { dispatch({ type: A.SET_SORT, payload: 'priority-desc' }); setOpen(false); } },
            { icon: 'sort-asc', label: 'Sort by due date', action: () => { dispatch({ type: A.SET_SORT, payload: 'due-asc' }); setOpen(false); } },
            null,
            { icon: 'copy', label: `Copy column name`, action: () => { navigator.clipboard?.writeText(colLabel); setOpen(false); } },
            { icon: taskCount === 0 ? 'check-circle-2' : 'eye-off', label: taskCount === 0 ? 'Column is empty' : `Hide ${taskCount} task${taskCount !== 1 ? 's' : ''}`, action: collapseAll, muted: true },
          ].map((it, i) => it === null
            ? <div key={i} style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />
            : (
              <button key={it.label} onClick={it.action} style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                padding: '7px 10px', border: 'none', borderRadius: 'var(--r-sm)',
                background: 'transparent', cursor: 'pointer',
                fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-13)',
                color: it.muted ? 'var(--fg-muted)' : 'var(--fg)', textAlign: 'left',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <Icon name={it.icon} size={13} style={{ color: 'var(--fg-muted)' }} /> {it.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

function TaskCard({ task, isOverlay }) {
  const { dispatch } = useApp();
  const [hover, setHover] = useState(false);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id });

  const openTask = () => dispatch({ type: A.SET_UI, payload: { openTaskId: task.id } });

  return (
    <div
      ref={setNodeRef}
      onClick={openTask}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--r-md)', padding: 10,
        display: 'flex', flexDirection: 'column', gap: 7,
        cursor: isDragging ? 'grabbing' : 'pointer',
        opacity: isDragging && !isOverlay ? 0.35 : 1,
        boxShadow: (hover || isOverlay) ? 'var(--shadow-md)' : 'none',
        borderColor: hover ? 'var(--border)' : 'var(--border-subtle)',
        transition: 'box-shadow 120ms, border-color 120ms, opacity 120ms',
        position: 'relative',
        transform: isOverlay ? 'rotate(1.5deg)' : undefined,
      }}
    >
      {/* Drag handle */}
      <div
        {...listeners} {...attributes}
        onClick={e => e.stopPropagation()}
        style={{
          position: 'absolute', top: 8, right: 8, opacity: hover ? 1 : 0,
          cursor: 'grab', color: 'var(--fg-subtle)', transition: 'opacity 120ms',
        }}
      >
        <Icon name="grip-vertical" size={13} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Priority level={task.priority} />
        <span className="t-mono-sm" style={{ color: 'var(--fg-subtle)' }}>{task.id}</span>
        <div style={{ flex: 1 }} />
        <AvatarStack names={task.assignees} max={2} size={18} />
      </div>

      <div style={{
        fontSize: 'var(--fs-13)', fontWeight: 500, color: 'var(--fg)', lineHeight: 1.35,
        display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        paddingRight: 16,
      }}>
        {task.title}
      </div>

      {(task.branch || task.pr) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
          {task.branch && <BranchPill name={task.branch} />}
          {task.pr && <PRPill id={task.pr.id} state={task.pr.state} />}
        </div>
      )}

      {task.tags && task.tags.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {task.tags.map(t => (
            <span key={t} className="oc-chip oc-chip--outline" style={{ fontSize: 10, height: 17, padding: '0 6px' }}>{t}</span>
          ))}
        </div>
      )}

      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        paddingTop: 6, borderTop: '1px solid var(--border-subtle)',
        fontSize: 'var(--fs-11)', color: 'var(--fg-muted)',
      }}>
        {task.due !== '—' && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
            <Icon name="calendar" size={11} />{task.due}
          </span>
        )}
        {task.checks[1] > 0 && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
            <Icon name="check-square" size={11} />{task.checks[0]}/{task.checks[1]}
          </span>
        )}
        {task.comments > 0 && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
            <Icon name="message-square" size={11} />{task.comments}
          </span>
        )}
      </div>
    </div>
  );
}
