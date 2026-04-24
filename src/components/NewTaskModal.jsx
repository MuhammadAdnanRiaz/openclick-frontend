import { useState, useEffect, useRef } from 'react';
import { useApp, A } from '../store/AppContext.jsx';
import { Icon, Avatar } from './primitives.jsx';
import { STATUSES } from '../data.js';

const PRIORITIES = ['urgent', 'high', 'normal', 'low'];
const PRIORITY_COLORS = { urgent: 'var(--p-urgent)', high: 'var(--p-high)', normal: 'var(--p-normal)', low: 'var(--p-low)' };

export function NewTaskModal({ initialStatus = 'open', onClose }) {
  const { dispatch, memberNames } = useApp();
  const titleRef = useRef(null);
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState(initialStatus);
  const [priority, setPriority] = useState('normal');
  const [due, setDue] = useState('');
  const [assignees, setAssignees] = useState([]);
  const [tags, setTags] = useState('');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => { titleRef.current?.focus(); }, []);

  function handleSubmit() {
    if (!title.trim()) return;
    const tagList = tags
      ? tags.split(',').map(t => t.trim()).filter(Boolean)
      : tagInput ? [tagInput.trim()] : [];

    dispatch({
      type: A.TASK_CREATE,
      payload: { title: title.trim(), status, priority, due: due || '—', assignees, tags: tagList },
    });
    onClose();
  }

  function handleKeyDown(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSubmit();
    else if (e.key === 'Escape') onClose();
  }

  function toggleAssignee(name) {
    setAssignees(a => a.includes(name) ? a.filter(n => n !== name) : [...a, name]);
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 110,
        background: 'rgba(5,5,10,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'oc-fade-in 150ms var(--ease-out)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        style={{
          width: 520, maxWidth: '94%',
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-xl)', boxShadow: 'var(--shadow-lg)',
          animation: 'oc-scale-in 180ms var(--ease-out)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px 10px', borderBottom: '1px solid var(--border-subtle)' }}>
          <span className="t-h3">New task</span>
          <div style={{ flex: 1 }} />
          <button className="oc-btn oc-btn--ghost oc-btn--icon" onClick={onClose}><Icon name="x" size={15} /></button>
        </div>

        {/* Body */}
        <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Title */}
          <textarea
            ref={titleRef}
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Task title…"
            rows={2}
            style={{
              width: '100%', background: 'transparent', border: 'none', outline: 'none', resize: 'none',
              color: 'var(--fg)', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-16)',
              fontWeight: 600, lineHeight: 1.3, padding: 0, boxSizing: 'border-box',
            }}
          />

          {/* Status + Priority row */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <FieldLabel label="Status">
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)',
                  color: 'var(--fg)', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-12)',
                  padding: '0 8px', height: 28, cursor: 'pointer',
                }}
              >
                {Object.entries(STATUSES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </FieldLabel>

            <FieldLabel label="Priority">
              <div style={{ display: 'flex', gap: 4 }}>
                {PRIORITIES.map(p => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    style={{
                      height: 28, padding: '0 10px', borderRadius: 'var(--r-md)',
                      border: `1px solid ${priority === p ? PRIORITY_COLORS[p] : 'var(--border)'}`,
                      background: priority === p ? `${PRIORITY_COLORS[p]}22` : 'var(--bg-card)',
                      color: priority === p ? PRIORITY_COLORS[p] : 'var(--fg-muted)',
                      fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-12)', fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >{p}</button>
                ))}
              </div>
            </FieldLabel>
          </div>

          {/* Due date */}
          <FieldLabel label="Due date">
            <input
              type="date"
              value={due}
              onChange={e => setDue(e.target.value)}
              style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)',
                color: 'var(--fg)', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-12)',
                padding: '0 8px', height: 28, cursor: 'pointer',
              }}
            />
          </FieldLabel>

          {/* Assignees */}
          <FieldLabel label="Assignees">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {memberNames.map(name => {
                const selected = assignees.includes(name);
                return (
                  <button
                    key={name}
                    onClick={() => toggleAssignee(name)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      height: 26, padding: '0 8px 0 4px', borderRadius: 'var(--r-pill)',
                      border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                      background: selected ? 'var(--bg-selected)' : 'var(--bg-card)',
                      color: selected ? 'var(--accent-text)' : 'var(--fg-muted)',
                      fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-12)', cursor: 'pointer',
                    }}
                  >
                    <Avatar name={name} size={16} />
                    {name.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </FieldLabel>

          {/* Tags */}
          <FieldLabel label="Tags">
            <input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              placeholder="perf, auth, runtime…"
              style={{
                flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--r-md)', color: 'var(--fg)',
                fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-12)',
                padding: '0 10px', height: 28, outline: 'none', width: '100%',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; setTags(tagInput); }}
            />
          </FieldLabel>
        </div>

        {/* Footer */}
        <div style={{
          padding: '10px 16px', borderTop: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 'var(--fs-11)', color: 'var(--fg-subtle)' }}>
            <span className="oc-kbd">⌘↵</span> to create · <span className="oc-kbd">esc</span> to cancel
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="oc-btn oc-btn--secondary" onClick={onClose}>Cancel</button>
            <button
              className="oc-btn oc-btn--primary"
              onClick={handleSubmit}
              disabled={!title.trim()}
              style={{ opacity: title.trim() ? 1 : 0.5 }}
            >
              <Icon name="plus" size={13} /> Create task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldLabel({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span className="t-label" style={{ fontSize: 10 }}>{label}</span>
      {children}
    </div>
  );
}
