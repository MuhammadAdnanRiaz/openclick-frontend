import { useApp, A } from '../store/AppContext.jsx';
import { Icon } from './primitives.jsx';

export function FilterBar() {
  const { state, dispatch } = useApp();
  const { filters } = state;

  function removeAssignee(name) {
    dispatch({ type: A.SET_FILTER, payload: { assignee: filters.assignee.filter(a => a !== name) } });
  }
  function removePriority(p) {
    dispatch({ type: A.SET_FILTER, payload: { priority: filters.priority.filter(x => x !== p) } });
  }
  function removeTag(t) {
    dispatch({ type: A.SET_FILTER, payload: { tags: filters.tags.filter(x => x !== t) } });
  }
  function clearAll() {
    dispatch({ type: A.SET_FILTER, payload: { assignee: [], priority: [], tags: [] } });
  }

  const hasFilters = filters.assignee.length || filters.priority.length || filters.tags.length;
  if (!hasFilters) return null;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
      padding: '6px 18px', background: 'var(--bg)',
      borderBottom: '1px solid var(--border-subtle)',
      fontSize: 'var(--fs-12)',
    }}>
      <span style={{ color: 'var(--fg-subtle)', fontSize: 11, fontWeight: 500 }}>Filters:</span>
      {filters.assignee.map(a => (
        <FilterChip key={a} label={a.split(' ')[0]} onRemove={() => removeAssignee(a)} color="var(--s-open-500)" />
      ))}
      {filters.priority.map(p => (
        <FilterChip key={p} label={p} onRemove={() => removePriority(p)} color="var(--s-progress-500)" />
      ))}
      {filters.tags.map(t => (
        <FilterChip key={t} label={t} onRemove={() => removeTag(t)} color="var(--s-review-500)" />
      ))}
      <button
        onClick={clearAll}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          height: 20, padding: '0 8px', borderRadius: 'var(--r-sm)',
          border: 'none', background: 'transparent',
          color: 'var(--fg-subtle)', fontSize: 11, fontFamily: 'var(--font-sans)',
          cursor: 'pointer',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--s-blocked-500)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--fg-subtle)'}
      >
        <Icon name="x" size={11} /> Clear all
      </button>
    </div>
  );
}

function FilterChip({ label, onRemove, color }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      height: 20, padding: '0 4px 0 7px', borderRadius: 'var(--r-sm)',
      background: `${color}18`, border: `1px solid ${color}44`,
      color, fontSize: 11, fontWeight: 500,
    }}>
      {label}
      <button
        onClick={onRemove}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 14, height: 14, borderRadius: 999, border: 'none',
          background: 'transparent', color: 'inherit', cursor: 'pointer', padding: 0,
        }}
      >
        <Icon name="x" size={10} />
      </button>
    </span>
  );
}
