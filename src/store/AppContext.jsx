import { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import * as api from '../api/index.js';

// ─── Action types ────────────────────────────────────────────────────────────
export const A = {
  TASK_CREATE:    'TASK_CREATE',
  TASK_CREATE_RAW:'TASK_CREATE_RAW',
  TASK_REPLACE:   'TASK_REPLACE',
  TASK_UPDATE:    'TASK_UPDATE',
  TASK_DELETE:    'TASK_DELETE',
  SUBTASK_TOGGLE: 'SUBTASK_TOGGLE',
  COMMENT_ADD:    'COMMENT_ADD',
  SET_FILTER:     'SET_FILTER',
  SET_SORT:       'SET_SORT',
  SET_UI:         'SET_UI',
  INIT_TASKS:     'INIT_TASKS',
  SET_LOADING:    'SET_LOADING',
  INIT_SPACES:    'INIT_SPACES',
  SPACE_ADD:      'SPACE_ADD',
  INIT_MEMBERS:   'INIT_MEMBERS',
  INIT_WORKSPACE: 'INIT_WORKSPACE',
  SET_ACTIVE_PROJECT: 'SET_ACTIVE_PROJECT',
};

// ─── Initial state ────────────────────────────────────────────────────────────
function makeInitial(authData) {
  return {
    tasks: [],
    spaces: [],
    members: [],
    workspace: null,
    activeSpaceName: null,
    activeProjectName: null,
    loading: true,
    user: authData?.user ?? null,
    workspaceId: authData?.workspaceId ?? null,
    filters: { assignee: [], priority: [], tags: [] },
    sort: 'id-asc',
    ui: {
      view: 'board',
      openTaskId: null,
      cmdOpen: false,
      newTaskOpen: false,
      newTaskInitialStatus: 'open',
      calendarMonth: { year: 2026, month: 3 },
      ganttStartDate: new Date(2026, 3, 20),
      settingsOpen: false,
      settingsSection: 'profile',
      sidePanel: null,
      taskFullPage: false,
    },
  };
}

// ─── Task normalizer — maps API shape → UI shape ─────────────────────────────
function normalizeTask(t) {
  const subtasks = t.subtasks ?? [];
  const doneSubs = subtasks.filter(s => s.done).length;
  return {
    ...t,
    subtasks,
    checks:        t.checks        ?? [doneSubs, subtasks.length],
    commentThread: t.commentThread ?? t.comments_data ?? [],
    comments:      typeof t.comments === 'number' ? t.comments : (t.commentThread?.length ?? 0),
    assignees:     t.assignees     ?? [],
    tags:          t.tags          ?? [],
    due:           t.due           ?? '—',
    branch:        t.branch        ?? null,
    pr:            t.pr            ?? null,
  };
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
      default:              return 0;
    }
  });
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case A.INIT_TASKS:
      return { ...state, tasks: action.payload.map(normalizeTask), loading: false };

    case A.SET_LOADING:
      return { ...state, loading: action.payload };

    case A.INIT_SPACES:
      return { ...state, spaces: action.payload };

    case A.SPACE_ADD:
      return { ...state, spaces: [...state.spaces, action.payload] };

    case A.INIT_MEMBERS:
      return { ...state, members: action.payload };

    case A.INIT_WORKSPACE:
      return { ...state, workspace: action.payload };

    case A.SET_ACTIVE_PROJECT:
      return { ...state, activeSpaceName: action.payload.spaceName, activeProjectName: action.payload.projectName };

    case A.TASK_CREATE_RAW: {
      return { ...state, tasks: [...state.tasks, action.payload] };
    }

    case A.TASK_REPLACE: {
      const { tempId, task } = action.payload;
      return {
        ...state,
        tasks: state.tasks.map(t => t.id === tempId ? task : t),
        ui: state.ui.openTaskId === tempId
          ? { ...state.ui, openTaskId: task.id }
          : state.ui,
      };
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
      const { taskId, body, author = 'You', commentObj } = action.payload;
      const comment = commentObj ?? {
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

    case A.SET_FILTER:
      return { ...state, filters: { ...state.filters, ...action.payload } };

    case A.SET_SORT:
      return { ...state, sort: action.payload };

    case A.SET_UI:
      return { ...state, ui: { ...state.ui, ...action.payload } };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AppContext = createContext(null);

export function AppProvider({ children, authData }) {
  const [state, rawDispatch] = useReducer(reducer, authData, makeInitial);

  // Load workspace data from API on mount
  useEffect(() => {
    const wid = authData?.workspaceId;
    if (!wid) {
      rawDispatch({ type: A.SET_LOADING, payload: false });
      return;
    }
    api.tasks.list(wid)
      .then(data => rawDispatch({ type: A.INIT_TASKS, payload: data.tasks ?? [] }))
      .catch(() => rawDispatch({ type: A.SET_LOADING, payload: false }));
    api.workspace.get(wid)
      .then(ws => rawDispatch({ type: A.INIT_WORKSPACE, payload: ws }))
      .catch(() => {});
    api.spaces.list(wid)
      .then(data => rawDispatch({ type: A.INIT_SPACES, payload: data.spaces ?? [] }))
      .catch(() => {});
    api.members.list(wid)
      .then(data => rawDispatch({ type: A.INIT_MEMBERS, payload: data.members ?? [] }))
      .catch(() => {});
  }, [authData?.workspaceId]);

  const workspaceId = authData?.workspaceId ?? null;

  // API-aware dispatch — transparent to consumers
  const dispatch = useCallback(async (action) => {
    const UI_ONLY = [A.SET_UI, A.SET_FILTER, A.SET_SORT, A.INIT_TASKS, A.SET_LOADING, A.INIT_SPACES, A.SPACE_ADD, A.INIT_MEMBERS, A.INIT_WORKSPACE, A.SET_ACTIVE_PROJECT];
    if (UI_ONLY.includes(action.type)) {
      rawDispatch(action);
      return;
    }

    switch (action.type) {
      case A.TASK_CREATE: {
        const tempId = `__tmp_${Date.now()}`;
        const optimistic = {
          id: tempId,
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
        rawDispatch({ type: A.TASK_CREATE_RAW, payload: optimistic });
        if (workspaceId) {
          try {
            const task = normalizeTask(await api.tasks.create(workspaceId, action.payload));
            rawDispatch({ type: A.TASK_REPLACE, payload: { tempId, task } });
          } catch (err) {
            console.error('create task failed:', err);
            rawDispatch({ type: A.TASK_DELETE, payload: { id: tempId } });
          }
        }
        break;
      }

      case A.TASK_UPDATE: {
        rawDispatch(action);
        if (workspaceId) {
          api.tasks.update(workspaceId, action.payload.id, action.payload.patch)
            .catch(err => console.error('update task failed:', err));
        }
        break;
      }

      case A.TASK_DELETE: {
        rawDispatch(action);
        if (workspaceId) {
          api.tasks.remove(workspaceId, action.payload.id)
            .catch(err => console.error('delete task failed:', err));
        }
        break;
      }

      case A.SUBTASK_TOGGLE: {
        // Capture current done state before toggling
        const task = state.tasks.find(t => t.id === action.payload.taskId);
        const subtask = task?.subtasks.find(s => s.id === action.payload.subtaskId);
        rawDispatch(action);
        if (workspaceId && subtask) {
          api.subtasks.toggle(
            workspaceId,
            action.payload.taskId,
            action.payload.subtaskId,
            !subtask.done
          ).catch(err => console.error('toggle subtask failed:', err));
        }
        break;
      }

      case A.COMMENT_ADD: {
        rawDispatch(action);
        if (workspaceId) {
          api.comments.create(workspaceId, action.payload.taskId, action.payload.body)
            .catch(err => console.error('add comment failed:', err));
        }
        break;
      }

      default:
        rawDispatch(action);
    }
  }, [workspaceId, state.tasks]);

  // Derived values
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

  const openTask = useMemo(
    () => state.tasks.find(t => t.id === state.ui.openTaskId) ?? null,
    [state.tasks, state.ui.openTaskId]
  );

  const allTags = useMemo(
    () => [...new Set(state.tasks.flatMap(t => t.tags))].sort(),
    [state.tasks]
  );

  const memberNames = useMemo(() => state.members.map(m => m.name).filter(Boolean), [state.members]);

  const value = { state, dispatch, visibleTasks, openTask, allTags, memberNames };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
