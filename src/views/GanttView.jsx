import { useApp, A } from '../store/AppContext.jsx';
import { Icon, AvatarStack, Priority } from '../components/primitives.jsx';
import { STATUSES } from '../data.js';

const G_DAYS = 30;
const DAY_PX = 28;

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function parseDue(s) {
  if (!s || s === '—') return null;
  const [mon, day] = s.split(' ');
  const m = MONTH_NAMES.indexOf(mon);
  return new Date(2026, m, parseInt(day, 10));
}

function dayIndex(d, start) {
  return Math.round((d - start) / 86400000);
}

function timelineSpan(task, ganttStart) {
  const end = parseDue(task.due);
  if (!end) return null;
  const dur = { urgent: 3, high: 5, normal: 7, low: 10 }[task.priority] || 5;
  const startIdx = Math.max(0, dayIndex(end, ganttStart) - dur);
  const endIdx = Math.min(G_DAYS - 1, dayIndex(end, ganttStart));
  if (endIdx < 0 || startIdx > G_DAYS - 1) return null;
  return { startIdx, endIdx, dur: endIdx - startIdx + 1 };
}

function getDynamicMonthLabels(ganttStart) {
  // Returns array of { label, width } for each month in the window
  const labels = [];
  let i = 0;
  while (i < G_DAYS) {
    const d = new Date(ganttStart.getTime() + i * 86400000);
    const thisMonth = d.getMonth();
    const thisYear = d.getFullYear();
    let count = 0;
    while (i < G_DAYS) {
      const dd = new Date(ganttStart.getTime() + i * 86400000);
      if (dd.getMonth() !== thisMonth || dd.getFullYear() !== thisYear) break;
      count++;
      i++;
    }
    labels.push({ label: `${MONTH_NAMES[thisMonth]} ${thisYear}`, days: count });
  }
  return labels;
}

export function GanttView() {
  const { visibleTasks, state, dispatch } = useApp();
  const { ganttStartDate } = state.ui;
  const today = new Date();
  const todayX = dayIndex(today, ganttStartDate) * DAY_PX;

  const rowsTasks = visibleTasks.filter(t => timelineSpan(t, ganttStartDate));
  const monthLabels = getDynamicMonthLabels(ganttStartDate);

  function shiftWindow(days) {
    const next = new Date(ganttStartDate.getTime() + days * 86400000);
    dispatch({ type: A.SET_UI, payload: { ganttStartDate: next } });
  }

  function goToday() {
    const start = new Date(today.getTime() - 10 * 86400000);
    dispatch({ type: A.SET_UI, payload: { ganttStartDate: start } });
  }

  return (
    <div style={{ flex: 1, minHeight: 0, overflow: 'auto', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', minWidth: 'fit-content' }}>
        {/* Left sticky task names */}
        <div style={{ width: 280, flexShrink: 0, position: 'sticky', left: 0, zIndex: 2, background: 'var(--bg)', borderRight: '1px solid var(--border)' }}>
          {/* Nav row */}
          <div style={{ height: 60, borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 6 }}>
            <button className="oc-btn oc-btn--secondary oc-btn--sm" onClick={goToday}>Today</button>
            <button className="oc-btn oc-btn--ghost oc-btn--icon" onClick={() => shiftWindow(-G_DAYS)}><Icon name="chevron-left" size={14} /></button>
            <button className="oc-btn oc-btn--ghost oc-btn--icon" onClick={() => shiftWindow(G_DAYS)}><Icon name="chevron-right" size={14} /></button>
            <span className="t-label" style={{ marginLeft: 4 }}>Task</span>
          </div>
          {rowsTasks.map(t => (
            <div
              key={t.id}
              onClick={() => dispatch({ type: A.SET_UI, payload: { openTaskId: t.id } })}
              style={{ height: 36, padding: '0 18px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Priority level={t.priority} />
              <span className="t-mono-sm" style={{ color: 'var(--fg-subtle)', flexShrink: 0 }}>{t.id}</span>
              <span style={{ fontSize: 'var(--fs-13)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div style={{ flex: 1, position: 'relative' }}>
          {/* Header */}
          <div style={{ height: 60, borderBottom: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column' }}>
            {/* Month labels */}
            <div style={{ display: 'flex', height: 24, borderBottom: '1px solid var(--border-subtle)' }}>
              {monthLabels.map((ml, i) => (
                <div key={i} style={{
                  width: ml.days * DAY_PX, borderRight: '1px solid var(--border-subtle)',
                  padding: '0 10px', display: 'flex', alignItems: 'center',
                  fontSize: 'var(--fs-12)', fontWeight: 600, color: 'var(--fg)',
                  flexShrink: 0,
                }}>{ml.label}</div>
              ))}
            </div>
            {/* Day labels */}
            <div style={{ display: 'flex', height: 36 }}>
              {Array.from({ length: G_DAYS }).map((_, i) => {
                const d = new Date(ganttStartDate.getTime() + i * 86400000);
                const isToday = dayIndex(today, ganttStartDate) === i;
                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                return (
                  <div key={i} style={{
                    width: DAY_PX, flexShrink: 0,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
                    background: isWeekend ? 'var(--bg-sunken)' : 'transparent',
                    borderRight: '1px solid var(--border-subtle)',
                  }}>
                    <span style={{ fontSize: 9, color: 'var(--fg-faint)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      {['S','M','T','W','T','F','S'][d.getDay()]}
                    </span>
                    <span style={{
                      fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 500,
                      color: isToday ? '#fff' : 'var(--fg-muted)',
                      background: isToday ? 'var(--accent)' : 'transparent',
                      width: 18, height: 16, borderRadius: 999,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    }}>{d.getDate()}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bars */}
          <div style={{ position: 'relative' }}>
            {/* Weekend stripes */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', pointerEvents: 'none' }}>
              {Array.from({ length: G_DAYS }).map((_, i) => {
                const d = new Date(ganttStartDate.getTime() + i * 86400000);
                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                return (
                  <div key={i} style={{
                    width: DAY_PX, flexShrink: 0,
                    borderRight: '1px solid var(--border-subtle)',
                    background: isWeekend ? 'var(--bg-sunken)' : 'transparent',
                  }} />
                );
              })}
            </div>

            {/* Today line */}
            {todayX >= 0 && todayX < G_DAYS * DAY_PX && (
              <div style={{
                position: 'absolute', top: 0, bottom: 0,
                left: todayX + DAY_PX / 2,
                width: 1, background: 'var(--accent)',
                boxShadow: '0 0 8px var(--accent)',
                pointerEvents: 'none', zIndex: 3,
              }} />
            )}

            {rowsTasks.map(t => {
              const span = timelineSpan(t, ganttStartDate);
              if (!span) return null;
              const color = STATUSES[t.status].dot;
              return (
                <div key={t.id} style={{ height: 36, borderBottom: '1px solid var(--border-subtle)', position: 'relative' }}>
                  <div
                    onClick={() => dispatch({ type: A.SET_UI, payload: { openTaskId: t.id } })}
                    style={{
                      position: 'absolute', top: 7, bottom: 7,
                      left: span.startIdx * DAY_PX + 2,
                      width: Math.max(span.dur * DAY_PX - 4, 24),
                      background: `color-mix(in oklab, ${color} 22%, var(--bg))`,
                      borderLeft: `3px solid ${color}`,
                      borderRadius: 4,
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '0 8px',
                      fontSize: 'var(--fs-11)', fontWeight: 500, color: 'var(--fg)',
                      cursor: 'pointer', overflow: 'hidden',
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                      {t.title}
                    </span>
                    <AvatarStack names={t.assignees} max={2} size={16} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
