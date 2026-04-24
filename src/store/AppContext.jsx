import { createContext, useContext, useReducer, useMemo } from 'react';
import { TASKS as SEED_TASKS } from '../data.js';

// ─── Action types ───────────────────────────────────────────────────────────
export const A = {
  TASK_CREATE:    'TASK_CREATE',
  TASK_UPDATE:    'TASK_UPDATE',
  TASK_DELETE:    'TASK_DELETE',
  SUBTASK_TOGGLE: 'SUBTASK_TOGGLE',
  COMMENT_ADD:    'COMMENT_ADD',
  SET_FILTER:     'SET_FILTER',
  SET_SORT:       'SET_SORT',
  SET_UI:         'SET_UI',
};

// ─── Initial state ───────────────────────────────────────────────────────────
const INITIAL_STATE = {
  tasks: SEED_TASKS.map(t => ({ ...t })),
  filters: { assignee: [], priority: [], tags: [] },
  sort: 'id-asc',
  ui: {
    view: 'board',
    openTaskId: null,
    cmdOpen: false,
    newTaskOpen: false,
    newTaskInitialStatus: 'open',
    calendarMonth: { year: 2026, month: 3 }, // April 2026
    ganttStartDate: new Date(2026, 3, 20),
    settingsOpen: false,
    settingsSection: 'profile',
    sidePanel: null,
    taskFullPage: false,
  },
};

// ─── ID generator ────────────────────────────────────────────────────────────
function nextId(tasks) {
  if (!tasks.length) return 'ORB-100';
  const nums = tasks.map(t => parseInt(t.id.split('-')[1], 10)).filter(n => !isNaN(n));
  return `ORB-${Math.max(...nums) + 1}`;
}

// ─── Sort comparator ─────────────────────────────────────────────────────────
const PRIORITY_ORDER = { urgent: 0, high: 1, normal: 2, low: 3 };
const MONTH_IDX = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };

function parseDueMs(due) {
  if (!due || due === '—') return Infinity;
  const [mon, day] = due.split(' ');
  return new Date(2026, MONTH_IDX[mon] ?? 0, parseInt(day, 10)).getTime();
}

function sortTasks(tasks, sort) {
  return [...tasks].sort((a, b) => {
    switch (sort) {
      case 'due-asc':       return parseDueMs(a.due) - parseDueMs(b.due);
      case 'due-desc':      return parseDueMs(b.due) - parseDueMs(a.due);
      case 'priority-asc':  return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      case 'priority-desc': return PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
      default:              return 0; // preserve insertion order
    }
  });
}

// ─── Reducer ─────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case A.TASK_CREATE: {
      const newTask = {
        id: nextId(state.tasks),
        title: action.payload.title || 'Untitled task',
        status: action.payload.status || 'open',
        priority: action.payload.priority || 'normal',
        assignees: action.payload.assignees || [],
        due: action.payload.due || '—',
        branch: null, pr: null,
        comments: 0, checks: [0, 0],
        tags: action.payload.tags || [],
        subtasks: [],
        commentThread: [],
      };
      return { ...state, tasks: [...state.tasks, newTask] };
    }

    case A.TASK_UPDATE: {
      const { id, patch } = action.payload;
      return {
        ...state,
        tasks: state.tasks.map(t => t.id === id ? { ...t, ...patch } : t),
      };
    }

    case A.TASK_DELETE: {
      return {
        ...state,
        tasks: state.tasks.filter(t => t.id !== action.payload.id),
        ui: state.ui.openTaskId === action.payload.id
          ? { ...state.ui, openTaskId: null }
          : state.ui,
      };
    }

    case A.SUBTASK_TOGGLE: {
      const { taskId, subtaskId } = action.payload;
      return {
        ...state,
        tasks: state.tasks.map(t => {
          if (t.id !== taskId) return t;
          const subtasks = t.subtasks.map(s =>
            s.id === subtaskId ? { ...s, done: !s.done } : s
          );
          const done = subtasks.filter(s => s.done).length;
          return { ...t, subtasks, checks: [done, subtasks.length] };
        }),
      };
    }

    case A.COMMENT_ADD: {
      const { taskId, body, author = 'Maya Chen' } = action.payload;
      const comment = {
        id: Date.now().toString(),
        type: 'comment',
        author,
        when: 'just now',
        body,
      };
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === taskId
            ? { ...t, comments: t.comments + 1, commentThread: [...t.commentThread, comment] }
            : t
        ),
      };
    }

    case A.SET_FILTER: {
      return { ...state, filters: { ...state.filters, ...action.payload } };
    }

    case A.SET_SORT: {
      return { ...state, sort: action.payload };
    }

    case A.SET_UI: {
      return { ...state, ui: { ...state.ui, ...action.payload } };
    }

    default:
      return state;
  }
}

// ─── Context & Provider ───────────────────────────────────────────────────────
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  // Derive filtered + sorted visible tasks
  const visibleTasks = useMemo(() => {
    const { filters, sort, tasks } = state;
    let t = tasks;
    if (filters.assignee.length)
      t = t.filter(task => task.assignees.some(a => filters.assignee.includes(a)));
    if (filters.priority.length)
      t = t.filter(task => filters.priority.includes(task.priority));
    if (filters.tags.length)
      t = t.filter(task => task.tags.some(tag => filters.tags.includes(tag)));
    return sortTasks(t, sort);
  }, [state.tasks, state.filters, state.sort]);

  // Derive open task object
  const openTask = useMemo(
    () => state.tasks.find(t => t.id === state.ui.openTaskId) ?? null,
    [state.tasks, state.ui.openTaskId]
  );

  // All unique tags across all tasks
  const allTags = useMemo(
    () => [...new Set(state.tasks.flatMap(t => t.tags))].sort(),
    [state.tasks]
  );

  const value = { state, dispatch, visibleTasks, openTask, allTags };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
