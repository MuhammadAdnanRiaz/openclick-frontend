import { useState } from 'react';
import { useApp, A } from '../store/AppContext.jsx';
import { Icon, StatusChip } from '../components/primitives.jsx';
import { STATUSES } from '../data.js';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_LABELS  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function getCalDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const start = new Date(year, month, 1 - firstDay);
  return Array.from({ length: 42 }, (_, i) => new Date(start.getTime() + i * 86400000));
}

function getWeekDays(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay()); // Sunday
  return Array.from({ length: 7 }, (_, i) => new Date(d.getTime() + i * 86400000));
}

function parseDue(s, year) {
  if (!s || s === '—') return null;
  const [mon, day] = s.split(' ');
  const m = MONTH_SHORT.indexOf(mon);
  if (m < 0) return null;
  return new Date(year, m, parseInt(day, 10));
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatDateLabel(d) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── Shared task chip ─────────────────────────────────────────────────────────
function TaskChip({ task, onClick, compact }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: compact ? 4 : 5,
        padding: compact ? '2px 5px' : '4px 7px',
        borderRadius: 'var(--r-xs)',
        background: `color-mix(in oklab, ${STATUSES[task.status].dot} 15%, var(--bg))`,
        borderLeft: `2px solid ${STATUSES[task.status].dot}`,
        fontSize: compact ? 11 : 'var(--fs-12)', color: 'var(--fg)', fontFamily: 'var(--font-sans)', fontWeight: 500,
        cursor: 'pointer', overflow: 'hidden',
      }}
      title={task.title}
    >
      <span className="t-mono-sm" style={{ color: 'var(--fg-subtle)', fontSize: 10, flexShrink: 0 }}>{task.id.split('-')[1]}</span>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</span>
    </div>
  );
}

// ─── Month view ───────────────────────────────────────────────────────────────
function MonthView({ year, month, visibleTasks, onOpenTask, today }) {
  const calDays = getCalDays(year, month);

  const tasksForDay = (d) => visibleTasks.filter(t => {
    const dd = parseDue(t.due, year); return dd && sameDay(dd, d);
  });

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}>
        {DAY_LABELS.map(d => (
          <div key={d} className="t-label" style={{ padding: '8px 10px' }}>{d}</div>
        ))}
      </div>
      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridTemplateRows: 'repeat(6, 1fr)' }}>
        {calDays.map((d, i) => {
          const inMonth = d.getMonth() === month;
          const isToday = sameDay(d, today);
          const dayTasks = tasksForDay(d);
          return (
            <div key={i} style={{
              borderRight: (i % 7) !== 6 ? '1px solid var(--border-subtle)' : 'none',
              borderBottom: i < 35 ? '1px solid var(--border-subtle)' : 'none',
              padding: 6, minHeight: 80,
              background: inMonth ? 'var(--bg)' : 'var(--bg-sunken)',
              display: 'flex', flexDirection: 'column', gap: 3, overflow: 'hidden',
            }}>
              <div style={{ marginBottom: 2 }}>
                <span style={{
                  fontSize: 'var(--fs-12)', fontWeight: isToday ? 600 : 500,
                  fontFamily: 'var(--font-mono)',
                  color: isToday ? '#fff' : (inMonth ? 'var(--fg)' : 'var(--fg-faint)'),
                  background: isToday ? 'var(--accent)' : 'transparent',
                  width: 20, height: 20, borderRadius: 999,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>{d.getDate()}</span>
              </div>
              {dayTasks.slice(0, 3).map(t => (
                <TaskChip key={t.id} task={t} onClick={() => onOpenTask(t.id)} compact />
              ))}
              {dayTasks.length > 3 && (
                <span className="t-caption" style={{ fontSize: 10 }}>+{dayTasks.length - 3} more</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Week view ────────────────────────────────────────────────────────────────
function WeekView({ focusDate, visibleTasks, onOpenTask, today, year }) {
  const weekDays = getWeekDays(focusDate);

  const tasksForDay = (d) => visibleTasks.filter(t => {
    const dd = parseDue(t.due, year); return dd && sameDay(dd, d);
  });

  const weekLabel = (() => {
    const first = weekDays[0], last = weekDays[6];
    if (first.getMonth() === last.getMonth())
      return `${MONTH_NAMES[first.getMonth()]} ${first.getDate()}–${last.getDate()}, ${first.getFullYear()}`;
    return `${formatDateLabel(first)} – ${formatDateLabel(last)}, ${first.getFullYear()}`;
  })();

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}>
        {weekDays.map((d, i) => {
          const isToday = sameDay(d, today);
          return (
            <div key={i} style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span className="t-label" style={{ fontSize: 10 }}>{DAY_LABELS[d.getDay()]}</span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-18)', fontWeight: 600,
                color: isToday ? '#fff' : 'var(--fg)',
                background: isToday ? 'var(--accent)' : 'transparent',
                width: 32, height: 32, borderRadius: 999,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>{d.getDate()}</span>
            </div>
          );
        })}
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {weekDays.map((d, i) => {
          const dayTasks = tasksForDay(d);
          const isToday = sameDay(d, today);
          return (
            <div key={i} style={{
              borderRight: i < 6 ? '1px solid var(--border-subtle)' : 'none',
              padding: 8, display: 'flex', flexDirection: 'column', gap: 6,
              minHeight: 300,
              background: isToday ? 'color-mix(in oklab, var(--accent) 4%, var(--bg))' : 'var(--bg)',
            }}>
              {dayTasks.length === 0 ? (
                <span style={{ fontSize: 11, color: 'var(--fg-faint)', fontFamily: 'var(--font-sans)', marginTop: 4 }}>—</span>
              ) : dayTasks.map(t => (
                <TaskChip key={t.id} task={t} onClick={() => onOpenTask(t.id)} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Day view ─────────────────────────────────────────────────────────────────
function DayView({ focusDate, visibleTasks, onOpenTask, today, year }) {
  const isToday = sameDay(focusDate, today);
  const dayLabel = focusDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const dayTasks = visibleTasks.filter(t => {
    const dd = parseDue(t.due, year); return dd && sameDay(dd, focusDate);
  });

  const byStatus = {
    open: dayTasks.filter(t => t.status === 'open' || t.status === 'backlog'),
    progress: dayTasks.filter(t => t.status === 'progress'),
    review: dayTasks.filter(t => t.status === 'review' || t.status === 'blocked'),
    done: dayTasks.filter(t => t.status === 'merged' || t.status === 'done'),
  };

  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 'var(--r-lg)', flexShrink: 0,
          background: isToday ? 'var(--accent)' : 'var(--bg-card)',
          border: `2px solid ${isToday ? 'var(--accent)' : 'var(--border)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-24)', fontWeight: 700,
          color: isToday ? '#fff' : 'var(--fg)',
        }}>
          {focusDate.getDate()}
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-18)', fontWeight: 600, color: 'var(--fg)' }}>{dayLabel}</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-13)', color: 'var(--fg-muted)', marginTop: 2 }}>
            {dayTasks.length === 0 ? 'No tasks due' : `${dayTasks.length} task${dayTasks.length !== 1 ? 's' : ''} due`}
          </div>
        </div>
      </div>

      {dayTasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Icon name="calendar-check" size={40} style={{ color: 'var(--fg-subtle)', marginBottom: 12 }} />
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-14)', color: 'var(--fg-muted)' }}>No tasks due on this day</div>
        </div>
      ) : (
        Object.entries(byStatus).map(([group, tasks]) => {
          if (!tasks.length) return null;
          const labels = { open: 'Open', progress: 'In progress', review: 'In review / Blocked', done: 'Done' };
          return (
            <div key={group} style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span className="t-label" style={{ fontSize: 11 }}>{labels[group]}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-subtle)' }}>{tasks.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {tasks.map(t => (
                  <div
                    key={t.id}
                    onClick={() => onOpenTask(t.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                      background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                      borderLeft: `3px solid ${STATUSES[t.status].dot}`,
                      borderRadius: 'var(--r-md)', cursor: 'pointer',
                      transition: 'background var(--dur-fast)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card)'}
                  >
                    <StatusChip status={t.status} size="sm" dot />
                    <span style={{ flex: 1, fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-13)', fontWeight: 500, color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                    <span className="t-mono-sm" style={{ color: 'var(--fg-subtle)', flexShrink: 0 }}>{t.id}</span>
                    {t.assignees.slice(0, 2).map(a => (
                      <span key={a} style={{ width: 20, height: 20, borderRadius: 999, background: 'var(--accent)', color: '#fff', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {a.split(' ').map(n => n[0]).join('')}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export function CalendarView() {
  const { visibleTasks, state, dispatch } = useApp();
  const { calendarMonth } = state.ui;
  const { year, month } = calendarMonth;

  const today = new Date();
  const [calViewMode, setCalViewMode] = useState('month');
  const [focusDate, setFocusDate] = useState(new Date(2026, 3, 24));

  const monthLabel = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  function prevMonth() {
    const m = month === 0 ? 11 : month - 1;
    const y = month === 0 ? year - 1 : year;
    dispatch({ type: A.SET_UI, payload: { calendarMonth: { year: y, month: m } } });
  }
  function nextMonth() {
    const m = month === 11 ? 0 : month + 1;
    const y = month === 11 ? year + 1 : year;
    dispatch({ type: A.SET_UI, payload: { calendarMonth: { year: y, month: m } } });
  }
  function goToday() {
    dispatch({ type: A.SET_UI, payload: { calendarMonth: { year: today.getFullYear(), month: today.getMonth() } } });
    setFocusDate(new Date());
  }
  function prevPeriod() {
    if (calViewMode === 'month') { prevMonth(); return; }
    if (calViewMode === 'week') { setFocusDate(d => new Date(d.getTime() - 7 * 86400000)); return; }
    setFocusDate(d => new Date(d.getTime() - 86400000));
  }
  function nextPeriod() {
    if (calViewMode === 'month') { nextMonth(); return; }
    if (calViewMode === 'week') { setFocusDate(d => new Date(d.getTime() + 7 * 86400000)); return; }
    setFocusDate(d => new Date(d.getTime() + 86400000));
  }

  function currentLabel() {
    if (calViewMode === 'month') return monthLabel;
    if (calViewMode === 'week') {
      const days = getWeekDays(focusDate);
      const first = days[0], last = days[6];
      if (first.getMonth() === last.getMonth())
        return `${MONTH_NAMES[first.getMonth()]} ${first.getDate()}–${last.getDate()}`;
      return `${MONTH_SHORT[first.getMonth()]} ${first.getDate()} – ${MONTH_SHORT[last.getMonth()]} ${last.getDate()}`;
    }
    return focusDate.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' });
  }

  function onOpenTask(id) {
    dispatch({ type: A.SET_UI, payload: { openTaskId: id } });
  }

  const VIEW_MODES = ['Month', 'Week', 'Day'];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: 'var(--bg)' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}>
        <button className="oc-btn oc-btn--secondary oc-btn--sm" onClick={goToday}>Today</button>
        <div style={{ display: 'flex', gap: 0 }}>
          <button className="oc-btn oc-btn--ghost oc-btn--icon" onClick={prevPeriod}><Icon name="chevron-left" size={14} /></button>
          <button className="oc-btn oc-btn--ghost oc-btn--icon" onClick={nextPeriod}><Icon name="chevron-right" size={14} /></button>
        </div>
        <h2 className="t-h2" style={{ margin: 0, minWidth: 220 }}>{currentLabel()}</h2>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 2, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-md)', padding: 2 }}>
          {VIEW_MODES.map(v => {
            const active = calViewMode === v.toLowerCase();
            return (
              <button
                key={v}
                onClick={() => setCalViewMode(v.toLowerCase())}
                className="oc-btn oc-btn--sm"
                style={{
                  background: active ? 'var(--bg-elevated)' : 'transparent',
                  color: active ? 'var(--fg)' : 'var(--fg-muted)',
                  height: 22, border: 'none',
                  fontWeight: active ? 600 : 400,
                  boxShadow: active ? 'var(--shadow-sm)' : 'none',
                }}
              >{v}</button>
            );
          })}
        </div>
      </div>

      {calViewMode === 'month' && <MonthView year={year} month={month} visibleTasks={visibleTasks} onOpenTask={onOpenTask} today={today} />}
      {calViewMode === 'week'  && <WeekView focusDate={focusDate} visibleTasks={visibleTasks} onOpenTask={onOpenTask} today={today} year={year} />}
      {calViewMode === 'day'   && <DayView focusDate={focusDate} visibleTasks={visibleTasks} onOpenTask={onOpenTask} today={today} year={year} />}
    </div>
  );
}
