import { useState, useRef, useEffect } from 'react';
import { useApp, A } from '../store/AppContext.jsx';
import { useToast } from '../store/ToastContext.jsx';
import { Icon, Avatar, AvatarStack, StatusChip, Priority, PRPill } from '../components/primitives.jsx';
import { STATUSES } from '../data.js';

const PRIORITIES = ['urgent', 'high', 'normal', 'low'];
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatDue(iso) {
  if (!iso) return '—';
  const [, m, d] = iso.split('-');
  return `${MONTH_SHORT[parseInt(m, 10) - 1]} ${parseInt(d, 10)}`;
}

function toIsoDate(due) {
  if (!due || due === '—') return '';
  const [mon, day] = due.split(' ');
  const m = MONTH_SHORT.indexOf(mon);
  if (m < 0) return '';
  return `2026-${String(m + 1).padStart(2, '0')}-${String(parseInt(day, 10)).padStart(2, '0')}`;
}

function useClickOutside(ref, handler) {
  useEffect(() => {
    function listener(e) {
      if (!ref.current || ref.current.contains(e.target)) return;
      handler();
    }
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler]);
}

// Shared picker styles
const pickerStyle = {
  position: 'absolute', top: '100%', left: 0, marginTop: 4, zIndex: 200,
  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
  borderRadius: 'var(--r-md)', boxShadow: 'var(--shadow-lg)',
  minWidth: 160, overflow: 'hidden',
};

function pickerItemStyle(active) {
  return {
    width: '100%', textAlign: 'left', padding: '7px 10px',
    background: active ? 'var(--bg-selected)' : 'none',
    border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)',
    fontSize: 'var(--fs-13)', color: 'var(--fg)',
    display: 'flex', alignItems: 'center', gap: 8,
  };
}

// ─── Picker sub-components ────────────────────────────────────────────────────

function StatusPicker({ status, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));
  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button onClick={() => setOpen(o => !o)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
        <StatusChip status={status} />
      </button>
      {open && (
        <div style={pickerStyle}>
          {Object.entries(STATUSES).map(([k]) => (
            <button key={k} onClick={() => { onChange(k); setOpen(false); }} style={pickerItemStyle(k === status)}>
              <StatusChip status={k} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PriorityPicker({ priority, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));
  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '0 8px', height: 24, borderRadius: 'var(--r-md)',
          background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
          fontSize: 'var(--fs-12)', color: 'var(--fg-muted)', cursor: 'pointer',
          fontFamily: 'var(--font-sans)',
        }}
      >
        <Priority level={priority} /> {priority[0].toUpperCase() + priority.slice(1)}
      </button>
      {open && (
        <div style={pickerStyle}>
          {PRIORITIES.map(p => (
            <button key={p} onClick={() => { onChange(p); setOpen(false); }} style={pickerItemStyle(p === priority)}>
              <Priority level={p} />
              <span>{p[0].toUpperCase() + p.slice(1)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DuePicker({ due, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));
  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '0 8px 0 6px', height: 24, borderRadius: 'var(--r-md)',
          background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
          fontSize: 'var(--fs-12)', color: 'var(--fg-muted)', cursor: 'pointer',
          fontFamily: 'var(--font-sans)',
        }}
      >
        <Icon name="calendar" size={12} /> Due {due}
      </button>
      {open && (
        <div style={{ ...pickerStyle, padding: 10 }}>
          <input
            type="date"
            defaultValue={toIsoDate(due)}
            autoFocus
            onChange={e => { onChange(e.target.value ? formatDue(e.target.value) : '—'); setOpen(false); }}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--r-md)', color: 'var(--fg)',
              fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-12)',
              padding: '4px 8px', cursor: 'pointer',
            }}
          />
          {due !== '—' && (
            <button
              onClick={() => { onChange('—'); setOpen(false); }}
              style={{ display: 'block', marginTop: 6, fontSize: 'var(--fs-11)', color: 'var(--fg-muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', padding: 0 }}
            >
              Clear date
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function AssigneePicker({ assignees, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));

  function toggle(name) {
    const next = assignees.includes(name)
      ? assignees.filter(a => a !== name)
      : [...assignees, name];
    onChange(next);
  }

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '0 8px 0 4px', height: 24, borderRadius: 'var(--r-md)',
          background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
          fontSize: 'var(--fs-12)', color: 'var(--fg-muted)', cursor: 'pointer',
          fontFamily: 'var(--font-sans)',
        }}
      >
        {assignees.length > 0
          ? <><AvatarStack names={assignees} max={3} size={18} /><span style={{ marginLeft: 4 }}>{assignees.length} assignee{assignees.length > 1 ? 's' : ''}</span></>
          : <><Icon name="user-plus" size={12} /> Assign</>
        }
      </button>
      {open && (
        <div style={{ ...pickerStyle, minWidth: 200 }}>
          {memberNames.map(name => {
            const selected = assignees.includes(name);
            return (
              <button key={name} onClick={() => toggle(name)} style={pickerItemStyle(selected)}>
                <Avatar name={name} size={18} />
                <span style={{ flex: 1 }}>{name}</span>
                {selected && <Icon name="check" size={12} style={{ color: 'var(--accent)' }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Helper components ────────────────────────────────────────────────────────

function SectionLabel({ icon, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <Icon name={icon} size={14} style={{ color: 'var(--fg-subtle)' }} />
      <span className="t-label" style={{ fontSize: 11 }}>{children}</span>
    </div>
  );
}

function MetaRow({ label, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <span className="t-caption" style={{ width: 72, flexShrink: 0, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.06, color: 'var(--fg-subtle)', fontWeight: 600, paddingTop: 2 }}>{label}</span>
      <span style={{ flex: 1, minWidth: 0 }}>{children}</span>
    </div>
  );
}

function CommentItem({ who, when, body }) {
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <Avatar name={who} size={26} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
          <span style={{ fontWeight: 600, fontSize: 'var(--fs-13)' }}>{who}</span>
          <span className="t-caption" style={{ fontSize: 11 }}>{when}</span>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-md)', padding: '8px 12px', fontSize: 'var(--fs-13)', lineHeight: 1.6, color: 'var(--fg)' }}>
          {body}
        </div>
      </div>
    </div>
  );
}

function ActivityEvent({ icon, text, when, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 6, fontSize: 'var(--fs-12)', color: 'var(--fg-muted)' }}>
      <span style={{
        width: 24, height: 24, borderRadius: 999,
        background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        color: color || 'var(--fg-muted)', flexShrink: 0,
      }}>
        <Icon name={icon} size={12} />
      </span>
      <span style={{ flex: 1 }}>{text}</span>
      <span className="t-caption" style={{ fontSize: 11 }}>{when}</span>
    </div>
  );
}

// ─── Branch row sub-component ─────────────────────────────────────────────────

const PROVIDER_ICON = { github: 'github', gitlab: 'gitlab' };
const PROVIDER_LABEL = { github: 'GitHub', gitlab: 'GitLab' };

function BranchRow({ task, activeProject, workspaceId }) {
  const { dispatch } = useApp();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(task.branch ?? '');
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [copiedBranch, setCopiedBranch] = useState(false);

  const linkedRepo = activeProject?.repoProvider && activeProject?.repoFullName
    ? { provider: activeProject.repoProvider, fullName: activeProject.repoFullName }
    : null;

  async function handleCreate() {
    if (!linkedRepo) return;
    setCreating(true);
    setError(null);
    try {
      const updated = await import('../api/tasks.js').then(m =>
        m.createBranch(workspaceId, task.id, {
          repoProvider: linkedRepo.provider,
          repoFullName: linkedRepo.fullName,
        })
      );
      dispatch({ type: A.TASK_UPDATE, payload: { id: task.id, patch: { branch: updated.branch } } });
      toast(`Branch created: ${updated.branch}`, 'success');
    } catch (err) {
      const msg = err.message ?? 'Branch creation failed';
      setError(msg);
      toast(msg, 'error');
    }
    setCreating(false);
  }

  async function save() {
    const trimmed = value.trim();
    if (trimmed === (task.branch ?? '')) { setEditing(false); return; }
    setSaving(true);
    try {
      dispatch({ type: A.TASK_UPDATE, payload: { id: task.id, patch: { branch: trimmed || null } } });
    } catch {}
    setSaving(false);
    setEditing(false);
  }

  function copyBranch() {
    navigator.clipboard.writeText(task.branch).catch(() => {});
    setCopiedBranch(true);
    setTimeout(() => setCopiedBranch(false), 2000);
  }

  if (editing) {
    return (
      <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name="git-branch" size={15} style={{ color: 'var(--accent)', flexShrink: 0 }} />
        <input
          autoFocus
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setEditing(false); setValue(task.branch ?? ''); } }}
          onBlur={save}
          placeholder="feature/my-branch"
          style={{ flex: 1, height: 28, padding: '0 8px', background: 'var(--bg-elevated)', border: '1px solid var(--accent)', borderRadius: 'var(--r-sm)', outline: 'none', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-12)', color: 'var(--fg)' }}
          disabled={saving}
        />
      </div>
    );
  }

  if (task.branch) {
    return (
      <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon name="git-branch" size={15} style={{ color: 'var(--accent)', flexShrink: 0 }} />
        <span className="t-mono" style={{ color: 'var(--fg)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.branch}</span>
        <button className="oc-btn oc-btn--ghost oc-btn--sm" onClick={copyBranch} style={{ color: copiedBranch ? 'var(--s-merged-500)' : undefined, flexShrink: 0 }}>
          {copiedBranch ? <><Icon name="check" size={11} /> Copied</> : 'Copy'}
        </button>
        <button className="oc-btn oc-btn--ghost oc-btn--icon" onClick={() => { setValue(task.branch ?? ''); setEditing(true); }} title="Edit branch" style={{ width: 24, height: 24, flexShrink: 0 }}>
          <Icon name="pencil" size={12} />
        </button>
      </div>
    );
  }

  // No branch yet — show create button if repo is linked, else manual input
  return (
    <div>
      {linkedRepo ? (
        <div style={{ padding: '10px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="git-branch" size={15} style={{ color: 'var(--fg-faint)', flexShrink: 0 }} />
            <button
              className="oc-btn oc-btn--secondary oc-btn--sm"
              onClick={handleCreate}
              disabled={creating}
              style={{ gap: 5 }}
            >
              {creating
                ? <><Icon name="loader" size={12} style={{ animation: 'spin 1s linear infinite' }} /> Creating…</>
                : <><Icon name={PROVIDER_ICON[linkedRepo.provider] ?? 'git-branch'} size={12} /> Create on {PROVIDER_LABEL[linkedRepo.provider] ?? linkedRepo.provider}</>
              }
            </button>
            <button
              className="oc-btn oc-btn--ghost oc-btn--sm"
              onClick={() => { setValue(''); setEditing(true); }}
              style={{ color: 'var(--fg-subtle)' }}
            >
              Add manually
            </button>
          </div>
          {error && (
            <p style={{ margin: '6px 0 0', fontSize: 'var(--fs-11)', color: 'var(--p-urgent)', lineHeight: 1.4 }}>
              {error}
            </p>
          )}
          <p style={{ margin: '5px 0 0', fontSize: 'var(--fs-11)', color: 'var(--fg-subtle)' }}>
            Will create <span className="t-mono-sm">{task.id.toLowerCase()}-…</span> from <span className="t-mono-sm">main</span> on <span className="t-mono-sm">{linkedRepo.fullName}</span>
          </p>
        </div>
      ) : (
        <button
          onClick={() => { setValue(''); setEditing(true); }}
          style={{ width: '100%', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-12)', color: 'var(--fg-subtle)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <Icon name="git-branch" size={15} style={{ color: 'var(--fg-faint)', flexShrink: 0 }} />
          Add branch name…
        </button>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function TaskDetail({ task, onClose, fullPage }) {
  const { state, dispatch, memberNames } = useApp();
  const activeProject = state.spaces
    .find(s => s.name === state.activeSpaceName)
    ?.projects?.find(p => p.name === state.activeProjectName) ?? null;
  const currentUser = state.user;
  const [moreOpen, setMoreOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  function copyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/?task=${task.id}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function toggleFullPage() {
    dispatch({ type: A.SET_UI, payload: { taskFullPage: !fullPage } });
  }
  const [comment, setComment] = useState('');
  const [tagInput, setTagInput] = useState('');
  const moreRef = useRef(null);
  const titleRef = useRef(null);
  const descRef = useRef(null);

  useClickOutside(moreRef, () => setMoreOpen(false));

  // Sync title div when task changes (e.g. switching tasks)
  useEffect(() => {
    if (titleRef.current && document.activeElement !== titleRef.current) {
      titleRef.current.textContent = task?.title ?? '';
    }
  }, [task?.title, task?.id]);

  useEffect(() => {
    if (descRef.current && document.activeElement !== descRef.current) {
      descRef.current.textContent = task?.description ?? '';
    }
  }, [task?.description, task?.id]);

  if (!task) return null;

  function update(patch) {
    dispatch({ type: A.TASK_UPDATE, payload: { id: task.id, patch } });
  }

  function handleTitleBlur() {
    const val = titleRef.current?.textContent.trim() ?? '';
    if (!val) { titleRef.current.textContent = task.title; return; }
    if (val !== task.title) update({ title: val });
  }

  function handleDescBlur() {
    const val = descRef.current?.textContent.trim() ?? '';
    if (val !== (task.description ?? '')) update({ description: val });
  }

  function removeTag(t) {
    update({ tags: task.tags.filter(x => x !== t) });
  }

  function handleTagKey(e) {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim().replace(/,$/, '');
      if (tag && !task.tags.includes(tag)) update({ tags: [...task.tags, tag] });
      setTagInput('');
    }
  }

  function submitComment() {
    if (!comment.trim()) return;
    dispatch({ type: A.COMMENT_ADD, payload: { taskId: task.id, body: comment.trim() } });
    setComment('');
  }

  function handleCommentKey(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submitComment();
  }

  function deleteTask() {
    dispatch({ type: A.TASK_DELETE, payload: { id: task.id } });
  }

  const subtaskDone = task.subtasks?.filter(s => s.done).length ?? 0;
  const subtaskTotal = task.subtasks?.length ?? 0;

  return (
    <div style={{
      position: 'absolute', top: 0, right: 0, bottom: 0,
      width: fullPage ? '100%' : 720, maxWidth: fullPage ? '100%' : '94%',
      background: 'var(--bg)',
      borderLeft: fullPage ? 'none' : '1px solid var(--border)',
      boxShadow: fullPage ? 'none' : 'var(--shadow-lg)',
      zIndex: 50,
      display: 'flex', flexDirection: 'column',
      animation: 'oc-slide-in-r 280ms var(--ease-out)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 16px',
        borderBottom: '1px solid var(--border-subtle)',
        flexShrink: 0,
      }}>
        <button className="oc-btn oc-btn--ghost oc-btn--icon" onClick={onClose}><Icon name="x" size={16} /></button>
        <span className="t-mono" style={{ color: 'var(--fg-muted)' }}>{task.id}</span>
        <div style={{ flex: 1 }} />
        <button className="oc-btn oc-btn--ghost oc-btn--icon" title="Copy link" onClick={copyLink} style={{ color: copied ? 'var(--s-done-500)' : undefined }}>
          <Icon name={copied ? 'check' : 'link'} size={14} />
        </button>
        <button className="oc-btn oc-btn--ghost oc-btn--icon" title={fullPage ? 'Exit full page' : 'Open full page'} onClick={toggleFullPage}>
          <Icon name={fullPage ? 'minimize-2' : 'maximize-2'} size={14} />
        </button>
        <div style={{ position: 'relative' }} ref={moreRef}>
          <button className="oc-btn oc-btn--ghost oc-btn--icon" onClick={() => setMoreOpen(o => !o)}>
            <Icon name="more-horizontal" size={14} />
          </button>
          {moreOpen && (
            <div style={{ ...pickerStyle, right: 0, left: 'auto', minWidth: 160 }}>
              <button
                onClick={deleteTask}
                style={{ ...pickerItemStyle(false), color: 'var(--s-blocked-500)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <Icon name="trash-2" size={13} /> Delete task
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
        {/* Main scroll */}
        <div style={{ flex: 1, minWidth: 0, overflow: 'auto', padding: '18px 20px 32px' }}>
          {/* Editable title */}
          <div
            ref={titleRef}
            contentEditable
            suppressContentEditableWarning
            onBlur={handleTitleBlur}
            style={{
              fontSize: 'var(--fs-24)', fontWeight: 600, lineHeight: 1.25,
              letterSpacing: '-0.01em', color: 'var(--fg)',
              outline: 'none', borderRadius: 'var(--r-sm)',
              padding: '2px 4px', margin: '-2px -4px',
            }}
          >{task.title}</div>

          {/* Action row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            <StatusPicker status={task.status} onChange={s => update({ status: s })} />
            <PriorityPicker priority={task.priority} onChange={p => update({ priority: p })} />
            <DuePicker due={task.due} onChange={d => update({ due: d })} />
            <AssigneePicker assignees={task.assignees} onChange={a => update({ assignees: a })} />
          </div>

          {/* Description */}
          <div style={{ marginTop: 22 }}>
            <SectionLabel icon="align-left">Description</SectionLabel>
            <div
              ref={descRef}
              contentEditable
              suppressContentEditableWarning
              onBlur={handleDescBlur}
              data-placeholder="Add a description…"
              style={{
                marginTop: 10, color: 'var(--fg)', fontSize: 'var(--fs-14)', lineHeight: 1.65,
                outline: 'none', borderRadius: 'var(--r-sm)',
                padding: '4px', margin: '-4px', minHeight: 24,
              }}
            >{task.description ?? ''}</div>
            {!task.description && (
              <style>{`[data-placeholder]:empty:before { content: attr(data-placeholder); color: var(--fg-faint); pointer-events: none; }`}</style>
            )}
          </div>

          {/* Subtasks */}
          {subtaskTotal > 0 && (
            <div style={{ marginTop: 22 }}>
              <SectionLabel icon="check-square">Subtasks · {subtaskDone}/{subtaskTotal}</SectionLabel>
              <div style={{ marginTop: 8, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-md)' }}>
                {task.subtasks.map((s, i, arr) => (
                  <div
                    key={s.id}
                    onClick={() => dispatch({ type: A.SUBTASK_TOGGLE, payload: { taskId: task.id, subtaskId: s.id } })}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 12px', cursor: 'pointer',
                      borderBottom: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                      fontSize: 'var(--fs-13)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{
                      width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                      border: `1.5px solid ${s.done ? 'var(--s-merged-500)' : 'var(--border-strong)'}`,
                      background: s.done ? 'var(--s-merged-500)' : 'transparent',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {s.done && <Icon name="check" size={11} strokeWidth={3} style={{ color: '#fff' }} />}
                    </span>
                    <span style={{ flex: 1, color: s.done ? 'var(--fg-muted)' : 'var(--fg)', textDecoration: s.done ? 'line-through' : 'none' }}>
                      {s.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          <div style={{ marginTop: 22 }}>
            <SectionLabel icon="tag">Tags</SectionLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8, alignItems: 'center' }}>
              {task.tags.map(t => (
                <span key={t} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  height: 22, padding: '0 4px 0 8px', borderRadius: 'var(--r-sm)',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  fontSize: 'var(--fs-12)', color: 'var(--fg-muted)',
                }}>
                  {t}
                  <button
                    onClick={() => removeTag(t)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 14, height: 14, borderRadius: 999, border: 'none',
                      background: 'transparent', color: 'inherit', cursor: 'pointer', padding: 0,
                    }}
                  >
                    <Icon name="x" size={10} />
                  </button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleTagKey}
                placeholder="Add tag…"
                style={{
                  height: 22, padding: '0 8px', borderRadius: 'var(--r-sm)',
                  border: '1px dashed var(--border)', background: 'transparent',
                  color: 'var(--fg)', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-12)',
                  outline: 'none', width: 90,
                }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
              />
            </div>
          </div>

          {/* Git / Development panel — always visible */}
          <div style={{ marginTop: 22 }}>
            <SectionLabel icon="git-branch">Development</SectionLabel>
            <div style={{ marginTop: 8, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
              {/* Branch row */}
              <BranchRow task={task} activeProject={activeProject} workspaceId={state.workspaceId} />
              {task.pr && (
                <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <Icon name={task.pr.state === 'merged' ? 'git-merge' : 'git-pull-request'} size={15} style={{ color: task.pr.state === 'merged' ? 'var(--s-merged-500)' : 'var(--s-open-500)', marginTop: 2 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span className="t-mono-sm" style={{ color: 'var(--fg-subtle)' }}>#{task.pr.id}</span>
                      <PRPill id={task.pr.id} state={task.pr.state} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Activity */}
          <div style={{ marginTop: 22 }}>
            <SectionLabel icon="message-square">Activity · {task.comments}</SectionLabel>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {task.commentThread.map(entry =>
                entry.type === 'comment'
                  ? <CommentItem key={entry.id} who={entry.author} when={entry.when} body={entry.body} />
                  : <ActivityEvent key={entry.id} icon={entry.icon || 'activity'} text={entry.text} when={entry.when} color={entry.color} />
              )}

              {/* Composer */}
              <div style={{ marginTop: 4, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-md)', padding: 10 }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  <Avatar name={currentUser?.name ?? '?'} size={26} />
                  <div style={{ flex: 1 }}>
                    <textarea
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      onKeyDown={handleCommentKey}
                      placeholder="Leave a comment…"
                      rows={comment ? 3 : 1}
                      style={{
                        width: '100%', background: 'transparent', border: 'none', outline: 'none',
                        resize: 'none', color: 'var(--fg)', fontFamily: 'var(--font-sans)',
                        fontSize: 'var(--fs-13)', lineHeight: 1.5, padding: '4px 0', boxSizing: 'border-box',
                      }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
                      <span style={{ fontSize: 11, color: 'var(--fg-subtle)' }}>
                        <span className="oc-kbd">⌘↵</span> to send
                      </span>
                      <div style={{ flex: 1 }} />
                      <button
                        className="oc-btn oc-btn--primary oc-btn--sm"
                        onClick={submitComment}
                        disabled={!comment.trim()}
                        style={{ opacity: comment.trim() ? 1 : 0.5 }}
                      >Comment</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right meta panel */}
        <div style={{
          width: 240, flexShrink: 0,
          borderLeft: '1px solid var(--border-subtle)',
          background: 'var(--bg-surface)',
          overflow: 'auto', padding: '18px 16px',
          fontSize: 'var(--fs-13)',
        }}>
          <MetaRow label="Status">
            <StatusPicker status={task.status} onChange={s => update({ status: s })} />
          </MetaRow>
          <MetaRow label="Priority">
            <PriorityPicker priority={task.priority} onChange={p => update({ priority: p })} />
          </MetaRow>
          <MetaRow label="Assignees">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {task.assignees.map(a => (
                <span key={a} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Avatar name={a} size={18} />
                  <span style={{ fontSize: 'var(--fs-12)' }}>{a}</span>
                </span>
              ))}
              <AssigneePicker assignees={task.assignees} onChange={a => update({ assignees: a })} />
            </div>
          </MetaRow>
          <MetaRow label="Reporter">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Avatar name={currentUser?.name ?? '?'} size={18} />
              <span style={{ fontSize: 'var(--fs-12)' }}>{currentUser?.name ?? '—'}</span>
            </span>
          </MetaRow>
          <MetaRow label="Due">
            <DuePicker due={task.due} onChange={d => update({ due: d })} />
          </MetaRow>
          <MetaRow label="Tags">
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {task.tags.map(t => (
                <span key={t} className="oc-chip oc-chip--outline" style={{ fontSize: 10, height: 18, padding: '0 6px' }}>{t}</span>
              ))}
            </div>
          </MetaRow>
          {task.branch && (
            <MetaRow label="Branch">
              <span className="t-mono-sm" style={{ color: 'var(--fg)', fontSize: 10, wordBreak: 'break-all' }}>
                {task.branch}
              </span>
            </MetaRow>
          )}
          {task.pr && (
            <MetaRow label="PR">
              <PRPill id={task.pr.id} state={task.pr.state} />
            </MetaRow>
          )}
        </div>
      </div>
    </div>
  );
}
