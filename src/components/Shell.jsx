import { useState, useEffect, useRef } from 'react';
import { Icon, Avatar, AvatarStack } from './primitives.jsx';
import { VIEWS } from '../data.js';
import { useApp, A } from '../store/AppContext.jsx';
import { useToast } from '../store/ToastContext.jsx';
import * as spacesApi from '../api/spaces.js';
import * as workspaceApi from '../api/workspace.js';
import * as integrationsApi from '../api/integrations.js';

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function WsMenuItem({ icon, label, onClick }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 8px', border: 'none', borderRadius: 'var(--r-sm)', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-12)', color: 'var(--fg-muted)', textAlign: 'left' }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <Icon name={icon} size={13} /> {label}
    </button>
  );
}

const SPACE_ICONS = ['terminal','palette','activity','trending-up','zap','layers','code-2','database'];
const SPACE_COLORS = ['#6366f1','#ec4899','#22c55e','#f97316','#06b6d4','#eab308','#8b5cf6','#ef4444'];

export function Sidebar({ collapsed, width, onLogout }) {
  const { dispatch, state } = useApp();
  const sidePanel = state.ui.sidePanel;
  const w = collapsed ? 56 : width;
  const user = state.user;
  const workspace = state.workspace;
  const spaces = state.spaces;
  const members = state.members;

  const [wsMenuOpen, setWsMenuOpen] = useState(false);
  const wsMenuRef = useRef(null);
  useClickOutside(wsMenuRef, () => setWsMenuOpen(false));

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  useClickOutside(userMenuRef, () => setUserMenuOpen(false));

  const [addSpaceOpen, setAddSpaceOpen] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newSpaceIcon, setNewSpaceIcon] = useState('layers');
  const [newSpaceColor, setNewSpaceColor] = useState('#6366f1');
  const [creatingSpace, setCreatingSpace] = useState(false);

  const [createWsOpen, setCreateWsOpen] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [newWsUrl, setNewWsUrl] = useState('');
  const [creatingWs, setCreatingWs] = useState(false);

  async function handleCreateSpace() {
    if (!newSpaceName.trim() || !state.workspaceId) return;
    setCreatingSpace(true);
    try {
      const space = await spacesApi.create(state.workspaceId, {
        name: newSpaceName.trim(),
        icon: newSpaceIcon,
        color: newSpaceColor,
      });
      dispatch({ type: A.SPACE_ADD, payload: space });
      setAddSpaceOpen(false);
    } catch (err) {
      console.error('create space failed:', err);
    } finally {
      setCreatingSpace(false);
    }
  }

  async function handleCreateWorkspace() {
    if (!newWsName.trim()) return;
    setCreatingWs(true);
    try {
      await workspaceApi.create({ name: newWsName.trim(), url: newWsUrl.trim() });
      setCreateWsOpen(false);
    } catch (err) {
      console.error('create workspace failed:', err);
    } finally {
      setCreatingWs(false);
    }
  }
  return (
    <aside style={{
      width: w, flexShrink: 0,
      background: 'var(--bg-surface)', borderRight: '1px solid var(--border-subtle)',
      display: 'flex', flexDirection: 'column',
      transition: 'width var(--dur-base) var(--ease-out)', overflow: 'hidden',
    }}>
      <div ref={wsMenuRef} style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 12px 10px', height: 48, borderBottom: '1px solid var(--border-subtle)' }}>
          <span className="oc-logo">OC</span>
          {!collapsed && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                <div className="t-h3" style={{ lineHeight: 1.1 }}>{workspace?.name ?? '…'}</div>
                <div className="t-micro">Team · {members.length} member{members.length !== 1 ? 's' : ''}</div>
              </div>
              <button className="oc-btn oc-btn--ghost oc-btn--icon" title="Workspace menu" onClick={() => setWsMenuOpen(o => !o)}>
                <Icon name="chevrons-up-down" size={14} />
              </button>
            </>
          )}
        </div>
        {wsMenuOpen && !collapsed && (
          <div style={{
            position: 'absolute', top: '100%', left: 8, right: 8, zIndex: 300,
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-pop)',
            padding: 6, animation: 'oc-scale-in 140ms var(--ease-out)',
          }}>
            <div className="t-label" style={{ padding: '4px 8px 6px', fontSize: 10 }}>Workspaces</div>
            {workspace && (
              <button onClick={() => setWsMenuOpen(false)} style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                padding: '7px 8px', border: 'none', borderRadius: 'var(--r-sm)',
                background: 'transparent', cursor: 'default',
                fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-13)', color: 'var(--fg)', textAlign: 'left',
              }}>
                <span style={{ width: 22, height: 22, borderRadius: 6, background: 'var(--accent)', border: '1px solid var(--border)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                  {workspace.name[0]}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, lineHeight: 1.2 }}>{workspace.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--fg-subtle)' }}>{members.length} member{members.length !== 1 ? 's' : ''}</div>
                </div>
                <Icon name="check" size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              </button>
            )}
            <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />
            <WsMenuItem icon="plus-circle" label="Create workspace" onClick={() => { setWsMenuOpen(false); setNewWsName(''); setNewWsUrl(''); setCreateWsOpen(true); }} />
            <WsMenuItem icon="settings" label="Workspace settings" onClick={() => { setWsMenuOpen(false); dispatch({ type: A.SET_UI, payload: { settingsOpen: true, settingsSection: 'workspace' } }); }} />
            <WsMenuItem icon="user-plus" label="Invite members" onClick={() => { setWsMenuOpen(false); dispatch({ type: A.SET_UI, payload: { settingsOpen: true, settingsSection: 'workspace' } }); }} />
          </div>
        )}
      </div>

      <div style={{ padding: collapsed ? '10px 6px' : '10px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <SideItem icon="search" label="Search" collapsed={collapsed}
          active={sidePanel === 'search'}
          onClick={() => dispatch({ type: A.SET_UI, payload: { sidePanel: sidePanel === 'search' ? null : 'search' } })} />
        <SideItem icon="inbox" label="Inbox" collapsed={collapsed}
          active={sidePanel === 'inbox'}
          onClick={() => dispatch({ type: A.SET_UI, payload: { sidePanel: sidePanel === 'inbox' ? null : 'inbox' } })} />
        <SideItem icon="bell" label="Notifications" collapsed={collapsed}
          active={sidePanel === 'notifications'}
          onClick={() => dispatch({ type: A.SET_UI, payload: { sidePanel: sidePanel === 'notifications' ? null : 'notifications' } })} />
        <SideItem icon="bookmark" label="My tasks" collapsed={collapsed}
          active={sidePanel === 'mytasks'}
          onClick={() => dispatch({ type: A.SET_UI, payload: { sidePanel: sidePanel === 'mytasks' ? null : 'mytasks' } })} />
      </div>

      {!collapsed && (
        <>
          <div style={{ padding: '14px 14px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="t-label">Spaces</span>
            <button data-add-space className="oc-btn oc-btn--ghost oc-btn--icon" style={{ height: 20, width: 20 }} onClick={() => { setNewSpaceName(''); setNewSpaceIcon('layers'); setNewSpaceColor('#6366f1'); setAddSpaceOpen(true); }}>
              <Icon name="plus" size={12} />
            </button>
          </div>
          <div style={{ padding: '0 10px 10px', display: 'flex', flexDirection: 'column', gap: 1, overflow: 'auto' }}>
            {spaces.length === 0 && (
              <div style={{ padding: '8px 6px', fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--fg-subtle)' }}>No spaces yet</div>
            )}
            {spaces.map((sp, i) => (
              <SpaceTree key={sp.id} space={sp} expanded={i === 0} workspaceId={state.workspaceId} />
            ))}
          </div>
        </>
      )}

      <div ref={userMenuRef} style={{ marginTop: 'auto', position: 'relative' }}>
        {userMenuOpen && !collapsed && (
          <div style={{ position: 'absolute', bottom: '100%', left: 8, right: 8, zIndex: 300, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-pop)', padding: 6, animation: 'oc-scale-in 140ms var(--ease-out)', marginBottom: 4 }}>
            <div style={{ padding: '8px 10px 6px', display: 'flex', gap: 8, alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', marginBottom: 4 }}>
              <Avatar name={user?.name ?? '?'} size={28} />
              <div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-13)', fontWeight: 600, color: 'var(--fg)' }}>{user?.name ?? '—'}</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 10, color: 'var(--fg-subtle)' }}>{user?.email ?? ''}</div>
              </div>
            </div>
            <WsMenuItem icon="user" label="Profile settings" onClick={() => { setUserMenuOpen(false); dispatch({ type: A.SET_UI, payload: { settingsOpen: true, settingsSection: 'profile' } }); }} />
            <WsMenuItem icon="settings" label="Workspace settings" onClick={() => { setUserMenuOpen(false); dispatch({ type: A.SET_UI, payload: { settingsOpen: true, settingsSection: 'workspace' } }); }} />
            <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />
            <button onClick={() => { setUserMenuOpen(false); onLogout?.(); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 8px', border: 'none', borderRadius: 'var(--r-sm)', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-12)', color: 'var(--s-blocked-500)', textAlign: 'left' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Icon name="log-out" size={13} /> Log out
            </button>
          </div>
        )}
        <div
          onClick={() => !collapsed && setUserMenuOpen(o => !o)}
          style={{ padding: 10, borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 8, cursor: collapsed ? 'default' : 'pointer' }}
          onMouseEnter={e => { if (!collapsed) e.currentTarget.style.background = 'var(--bg-hover)'; }}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <Avatar name={user?.name ?? '?'} size={24} />
          {!collapsed && (
            <>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="t-small" style={{ color: 'var(--fg)', fontWeight: 500 }}>{user?.name ?? '—'}</div>
                <div className="t-micro" style={{ fontSize: 10 }}>{user?.email ?? ''}</div>
              </div>
              <Icon name="more-horizontal" size={14} style={{ color: 'var(--fg-subtle)', flexShrink: 0 }} />
            </>
          )}
        </div>
      </div>

      {/* Create Workspace modal */}
      {createWsOpen && (
        <div onClick={() => setCreateWsOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(5,5,10,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'oc-fade-in 160ms var(--ease-out)' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 400, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden', animation: 'oc-scale-in 160ms var(--ease-out)' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 'var(--r-md)', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="building-2" size={15} style={{ color: '#fff' }} />
              </div>
              <span className="t-h3" style={{ flex: 1 }}>Create workspace</span>
              <button className="oc-btn oc-btn--ghost oc-btn--icon" onClick={() => setCreateWsOpen(false)}><Icon name="x" size={14} /></button>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ marginBottom: 14 }}>
                <div className="t-label" style={{ marginBottom: 6, fontSize: 11 }}>Workspace name</div>
                <input
                  autoFocus
                  value={newWsName}
                  onChange={e => { setNewWsName(e.target.value); setNewWsUrl(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')); }}
                  placeholder="e.g. Acme Corp"
                  className="oc-input"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <div className="t-label" style={{ marginBottom: 6, fontSize: 11 }}>URL</div>
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
                  <span style={{ padding: '0 10px', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-13)', color: 'var(--fg-subtle)', borderRight: '1px solid var(--border-subtle)', height: 36, display: 'flex', alignItems: 'center', flexShrink: 0 }}>openclick.app/</span>
                  <input value={newWsUrl} onChange={e => setNewWsUrl(e.target.value)} placeholder="your-workspace" style={{ flex: 1, height: 36, padding: '0 10px', background: 'transparent', border: 'none', outline: 'none', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-13)', color: 'var(--fg)' }} />
                </div>
              </div>
              <div style={{ marginBottom: 20, padding: '12px 14px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <Icon name="zap" size={16} style={{ color: '#eab308', flexShrink: 0 }} />
                <div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-13)', fontWeight: 500, color: 'var(--fg)' }}>Free plan · up to 5 members</div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--fg-subtle)', marginTop: 2 }}>Upgrade anytime for more seats and storage</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button className="oc-btn oc-btn--ghost" onClick={() => setCreateWsOpen(false)}>Cancel</button>
                <button className="oc-btn oc-btn--primary" disabled={!newWsName.trim() || creatingWs} onClick={handleCreateWorkspace}>
                  <Icon name="building-2" size={13} /> {creatingWs ? 'Creating…' : 'Create workspace'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Space modal */}
      {addSpaceOpen && (
        <div onClick={() => setAddSpaceOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(5,5,10,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'oc-fade-in 160ms var(--ease-out)' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 360, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden', animation: 'oc-scale-in 160ms var(--ease-out)' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 28, height: 28, borderRadius: 'var(--r-md)', background: newSpaceColor + '22', color: newSpaceColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={newSpaceIcon} size={14} />
              </span>
              <span className="t-h3" style={{ flex: 1 }}>New space</span>
              <button className="oc-btn oc-btn--ghost oc-btn--icon" onClick={() => setAddSpaceOpen(false)}><Icon name="x" size={14} /></button>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ marginBottom: 14 }}>
                <div className="t-label" style={{ marginBottom: 6, fontSize: 11 }}>Name</div>
                <input
                  autoFocus
                  value={newSpaceName}
                  onChange={e => setNewSpaceName(e.target.value)}
                  placeholder="e.g. Backend, Mobile, Data"
                  className="oc-input"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <div className="t-label" style={{ marginBottom: 6, fontSize: 11 }}>Icon</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {SPACE_ICONS.map(ic => (
                    <button key={ic} onClick={() => setNewSpaceIcon(ic)} style={{ width: 32, height: 32, borderRadius: 'var(--r-sm)', border: `2px solid ${newSpaceIcon === ic ? newSpaceColor : 'var(--border-subtle)'}`, background: newSpaceIcon === ic ? newSpaceColor + '22' : 'var(--bg-card)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: newSpaceIcon === ic ? newSpaceColor : 'var(--fg-muted)' }}>
                      <Icon name={ic} size={14} />
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <div className="t-label" style={{ marginBottom: 6, fontSize: 11 }}>Color</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {SPACE_COLORS.map(c => (
                    <button key={c} onClick={() => setNewSpaceColor(c)} style={{ width: 24, height: 24, borderRadius: 999, background: c, border: `2px solid ${newSpaceColor === c ? '#fff' : 'transparent'}`, boxShadow: newSpaceColor === c ? `0 0 0 2px ${c}` : 'none', cursor: 'pointer' }} />
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button className="oc-btn oc-btn--ghost" onClick={() => setAddSpaceOpen(false)}>Cancel</button>
                <button className="oc-btn oc-btn--primary" disabled={!newSpaceName.trim() || creatingSpace} onClick={handleCreateSpace}>
                  {creatingSpace ? 'Creating…' : 'Create space'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

function SideItem({ icon, label, kbd, badge, active, collapsed, pad = 8, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        height: 30, padding: collapsed ? 0 : `0 ${pad}px`,
        justifyContent: collapsed ? 'center' : 'flex-start',
        display: 'flex', alignItems: 'center', gap: 8,
        borderRadius: 'var(--r-md)', background: active ? 'var(--bg-selected)' : 'transparent',
        color: active ? 'var(--accent-text)' : 'var(--fg-muted)',
        border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)',
        fontSize: 'var(--fs-13)', fontWeight: active ? 500 : 400,
        width: '100%', textAlign: 'left',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg-hover)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      <Icon name={icon} size={15} strokeWidth={1.75} />
      {!collapsed && (
        <>
          <span style={{ flex: 1 }}>{label}</span>
          {kbd && <span className="oc-kbd">{kbd}</span>}
          {badge && (
            <span style={{ minWidth: 18, height: 16, padding: '0 5px', borderRadius: 999, background: 'var(--accent)', color: '#fff', fontSize: 10, fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{badge}</span>
          )}
        </>
      )}
    </button>
  );
}

function RepoPickerModal({ workspaceId, project, onLink, onClose }) {
  const toast = useToast();
  const [repos, setRepos] = useState(null);
  const [q, setQ] = useState('');
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    integrationsApi.listRepos(workspaceId)
      .then(data => setRepos(data.repos ?? []))
      .catch(() => setRepos([]));
  }, [workspaceId]);

  const filtered = (repos ?? []).filter(r =>
    !q || r.fullName.toLowerCase().includes(q.toLowerCase())
  );

  async function pick(repo) {
    setLinking(true);
    try {
      const updated = await spacesApi.updateProject(workspaceId, project.spaceId ?? '', project.id, {
        repoProvider: repo.provider,
        repoFullName: repo.fullName,
        repoUrl: repo.url,
      });
      onLink(updated);
      toast(`Linked to ${repo.fullName}`, 'success');
    } catch {
      toast('Failed to link repository', 'error');
    }
    setLinking(false);
    onClose();
  }

  async function unlink() {
    try {
      const updated = await spacesApi.updateProject(workspaceId, project.spaceId ?? '', project.id, {
        repoProvider: null,
        repoFullName: null,
        repoUrl: null,
      });
      onLink(updated);
      toast('Repository unlinked', 'success');
    } catch {
      toast('Failed to unlink repository', 'error');
    }
    onClose();
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(5,5,10,0.45)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 440, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', boxShadow: 'var(--shadow-lg)', animation: 'oc-scale-in 160ms var(--ease-out)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-14)', fontWeight: 600, color: 'var(--fg)', marginBottom: 2 }}>Link repository</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-12)', color: 'var(--fg-muted)' }}>Connect <strong>{project.name}</strong> to a GitHub or GitLab repo</div>
        </div>
        <div style={{ padding: '10px 12px 8px' }}>
          <input
            autoFocus
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search repositories…"
            className="oc-input"
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ maxHeight: 280, overflowY: 'auto', padding: '0 6px 6px' }}>
          {repos === null ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--fg-muted)', fontSize: 'var(--fs-13)' }}>Loading…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--fg-muted)', fontSize: 'var(--fs-13)' }}>
              {repos.length === 0 ? 'No connected integrations. Go to Settings → Integrations to connect GitHub or GitLab.' : 'No repos match.'}
            </div>
          ) : filtered.map(r => (
            <button
              key={`${r.provider}:${r.fullName}`}
              onClick={() => !linking && pick(r)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 10px', border: 'none', borderRadius: 'var(--r-md)', background: 'transparent', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-sans)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Icon name={r.provider === 'github' ? 'github' : 'git-branch'} size={15} style={{ color: 'var(--fg-muted)', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 'var(--fs-13)', fontWeight: 500, color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.fullName}</div>
                <div style={{ fontSize: 10, color: 'var(--fg-subtle)', textTransform: 'capitalize' }}>{r.provider} · {r.private ? 'Private' : 'Public'}</div>
              </div>
              {project.repoFullName === r.fullName && <Icon name="check" size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} />}
            </button>
          ))}
        </div>
        {project.repoFullName && (
          <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--fs-12)', color: 'var(--fg-muted)' }}>Linked: <strong style={{ color: 'var(--fg)' }}>{project.repoFullName}</strong></span>
            <button className="oc-btn oc-btn--ghost oc-btn--sm" style={{ color: 'var(--s-blocked-500)' }} onClick={unlink}>Unlink</button>
          </div>
        )}
      </div>
    </div>
  );
}

function SpaceTree({ space, expanded, workspaceId }) {
  const { dispatch } = useApp();
  const toast = useToast();
  const [open, setOpen] = useState(expanded);
  const [hover, setHover] = useState(false);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [addingProject, setAddingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const addMenuRef = useRef(null);
  useClickOutside(addMenuRef, () => setAddMenuOpen(false));

  const [activeProject, setActiveProject] = useState(null);
  const [projects, setProjects] = useState(space.projects ?? []);
  const [pages, setPages] = useState([]);
  const [addingPage, setAddingPage] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [repoPickerProject, setRepoPickerProject] = useState(null);

  function confirmAddPage() {
    const name = newPageName.trim();
    if (name) setPages(ps => [...ps, { id: Date.now(), name }]);
    setNewPageName('');
    setAddingPage(false);
  }

  async function confirmAddProject() {
    const name = newProjectName.trim();
    setNewProjectName('');
    setAddingProject(false);
    if (!name) return;
    const optimistic = { id: `__tmp_${Date.now()}`, name };
    setProjects(ps => [...ps, optimistic]);
    try {
      const created = await spacesApi.createProject(workspaceId, space.id, name);
      const withSpaceId = { ...created, spaceId: space.id };
      setProjects(ps => ps.map(p => p.id === optimistic.id ? withSpaceId : p));
      setRepoPickerProject(withSpaceId);
    } catch {
      setProjects(ps => ps.filter(p => p.id !== optimistic.id));
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {repoPickerProject && (
        <RepoPickerModal
          workspaceId={workspaceId}
          project={repoPickerProject}
          onLink={updated => setProjects(ps => ps.map(p => p.id === updated.id ? { ...p, ...updated, spaceId: space.id } : p))}
          onClose={() => setRepoPickerProject(null)}
        />
      )}
      {/* Space header row */}
      <div
        style={{ display: 'flex', alignItems: 'center', height: 28, gap: 0, position: 'relative' }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            flex: 1, height: 28, padding: '0 6px', display: 'flex', alignItems: 'center', gap: 6,
            borderRadius: 'var(--r-md)', border: 'none', background: 'transparent',
            color: 'var(--fg)', cursor: 'pointer', fontFamily: 'var(--font-sans)',
            fontSize: 'var(--fs-13)', fontWeight: 500, textAlign: 'left',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <Icon name={open ? 'chevron-down' : 'chevron-right'} size={12} style={{ color: 'var(--fg-subtle)', flexShrink: 0 }} />
          <span style={{ width: 16, height: 16, borderRadius: 4, background: space.color + '22', color: space.color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name={space.icon} size={11} strokeWidth={2.4} />
          </span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{space.name}</span>
        </button>

        {/* Add button — visible on hover */}
        {hover && (
          <div ref={addMenuRef} style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={() => setAddMenuOpen(o => !o)}
              className="oc-btn oc-btn--ghost oc-btn--icon"
              style={{ width: 22, height: 22 }}
              title="Add to space"
            >
              <Icon name="plus" size={12} />
            </button>
            {addMenuOpen && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 2, zIndex: 300, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-pop)', minWidth: 170, padding: 6, animation: 'oc-scale-in 140ms var(--ease-out)' }}>
                <AddMenuItem icon="box" label="New project" onClick={() => { setAddMenuOpen(false); setOpen(true); setAddingProject(true); setNewProjectName(''); }} />
                <AddMenuItem icon="file-text" label="New page" onClick={() => { setAddMenuOpen(false); setOpen(true); setAddingPage(true); setNewPageName(''); }} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Children */}
      {open && (
        <div style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 1, marginTop: 2 }}>
          {projects.map(p => (
            <SideSubItem
              key={p.id ?? p}
              label={p.name ?? p}
              repoFullName={p.repoFullName}
              repoProvider={p.repoProvider}
              active={activeProject === (p.id ?? p)}
              onClick={() => {
                setActiveProject(p.id ?? p);
                dispatch({ type: A.SET_ACTIVE_PROJECT, payload: { spaceName: space.name, projectName: p.name ?? p } });
              }}
              onLinkRepo={() => setRepoPickerProject({ ...p, spaceId: space.id })}
              onUnlinkRepo={async () => {
                try {
                  const updated = await spacesApi.updateProject(workspaceId, space.id, p.id, { repoProvider: null, repoFullName: null, repoUrl: null });
                  setProjects(ps => ps.map(x => x.id === p.id ? { ...x, ...updated, spaceId: space.id } : x));
                  toast('Repository unlinked', 'success');
                } catch {
                  toast('Failed to unlink repository', 'error');
                }
              }}
              onRename={async (newName) => {
                setProjects(ps => ps.map(x => x.id === p.id ? { ...x, name: newName } : x));
                try {
                  await spacesApi.updateProject(workspaceId, space.id, p.id, { name: newName });
                  toast(`Renamed to "${newName}"`, 'success');
                } catch {
                  setProjects(ps => ps.map(x => x.id === p.id ? { ...x, name: p.name } : x));
                  toast('Failed to rename project', 'error');
                }
              }}
              onDelete={async () => {
                setProjects(ps => ps.filter(x => x.id !== p.id));
                try {
                  await spacesApi.deleteProject(workspaceId, space.id, p.id);
                  toast(`"${p.name}" deleted`, 'info');
                } catch {
                  setProjects(ps => [...ps, p]);
                  toast('Failed to delete project', 'error');
                }
              }}
            />
          ))}
          {pages.map(pg => (
            <SideSubItem key={pg.id} label={pg.name} icon="file-text" active={false} onClick={() => {}} />
          ))}
          {addingProject && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 4px' }}>
              <Icon name="hash" size={12} style={{ color: 'var(--fg-muted)', flexShrink: 0 }} />
              <input
                autoFocus
                value={newProjectName}
                onChange={e => setNewProjectName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') confirmAddProject();
                  if (e.key === 'Escape') { setAddingProject(false); setNewProjectName(''); }
                }}
                onBlur={confirmAddProject}
                placeholder="Project name…"
                style={{ flex: 1, height: 22, padding: '0 6px', background: 'var(--bg-card)', border: '1px solid var(--accent)', borderRadius: 'var(--r-sm)', outline: 'none', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-12)', color: 'var(--fg)' }}
              />
            </div>
          )}
          {addingPage && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 4px' }}>
              <Icon name="file-text" size={12} style={{ color: 'var(--fg-muted)', flexShrink: 0 }} />
              <input
                autoFocus
                value={newPageName}
                onChange={e => setNewPageName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') confirmAddPage();
                  if (e.key === 'Escape') { setAddingPage(false); setNewPageName(''); }
                }}
                onBlur={confirmAddPage}
                placeholder="Page name…"
                style={{ flex: 1, height: 22, padding: '0 6px', background: 'var(--bg-card)', border: '1px solid var(--accent)', borderRadius: 'var(--r-sm)', outline: 'none', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-12)', color: 'var(--fg)' }}
              />
            </div>
          )}
          {projects.length === 0 && pages.length === 0 && !addingPage && !addingProject && (
            <div style={{ padding: '4px 8px', fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--fg-faint)' }}>No items yet</div>
          )}
        </div>
      )}
    </div>
  );
}

function AddMenuItem({ icon, label, onClick }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 8px', border: 'none', borderRadius: 'var(--r-sm)', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-13)', color: 'var(--fg)', textAlign: 'left' }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <Icon name={icon} size={14} style={{ color: 'var(--fg-muted)' }} />
      {label}
    </button>
  );
}

function SideSubItem({ label, active, onClick, repoFullName, repoProvider, onLinkRepo, onUnlinkRepo, onRename, onDelete }) {
  const [hover, setHover] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(label);
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  useClickOutside(menuRef, () => setMenuOpen(false));

  function openMenu(e) {
    e.stopPropagation();
    const rect = btnRef.current.getBoundingClientRect();
    setMenuPos({ top: rect.bottom + 4, left: rect.left });
    setMenuOpen(o => !o);
  }

  function startRename() {
    setMenuOpen(false);
    setRenameValue(label);
    setRenaming(true);
  }

  function commitRename() {
    const v = renameValue.trim();
    setRenaming(false);
    if (v && v !== label) onRename?.(v);
    else setRenameValue(label);
  }

  const menuItemStyle = { display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '6px 10px', border: 'none', borderRadius: 'var(--r-sm)', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-12)', color: 'var(--fg)', textAlign: 'left' };

  if (renaming) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 4px' }}>
        <Icon name="hash" size={12} style={{ color: 'var(--fg-muted)', flexShrink: 0 }} />
        <input
          autoFocus
          value={renameValue}
          onChange={e => setRenameValue(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') commitRename();
            if (e.key === 'Escape') { setRenaming(false); setRenameValue(label); }
          }}
          onBlur={commitRename}
          style={{ flex: 1, height: 22, padding: '0 6px', background: 'var(--bg-card)', border: '1px solid var(--accent)', borderRadius: 'var(--r-sm)', outline: 'none', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-12)', color: 'var(--fg)' }}
        />
      </div>
    );
  }

  return (
    <div
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ display: 'flex', alignItems: 'center', borderRadius: 'var(--r-md)', background: active ? 'var(--bg-selected)' : (hover ? 'var(--bg-hover)' : 'transparent'), position: 'relative' }}
    >
      <button
        onClick={onClick}
        style={{
          flex: 1, height: 26, padding: '0 8px', display: 'flex', alignItems: 'center', gap: 6,
          background: 'transparent', border: 'none',
          color: active ? 'var(--accent-text)' : 'var(--fg-muted)',
          cursor: 'pointer', fontFamily: 'var(--font-sans)',
          fontSize: 'var(--fs-12)', fontWeight: active ? 500 : 400, textAlign: 'left',
          minWidth: 0, overflow: 'hidden',
        }}
      >
        <Icon name="hash" size={12} strokeWidth={2} style={{ flexShrink: 0 }} />
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
        {repoFullName && (
          <Icon
            name={repoProvider === 'github' ? 'github' : 'git-branch'}
            size={11}
            style={{ color: 'var(--accent)', flexShrink: 0 }}
            title={repoFullName}
          />
        )}
      </button>

      {(hover || menuOpen) && (
        <>
          <button
            ref={btnRef}
            onClick={openMenu}
            style={{ width: 20, height: 20, marginRight: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', background: menuOpen ? 'var(--bg-press)' : 'transparent', border: 'none', borderRadius: 'var(--r-sm)', cursor: 'pointer', color: 'var(--fg-subtle)', flexShrink: 0 }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-press)'}
            onMouseLeave={e => { if (!menuOpen) e.currentTarget.style.background = 'transparent'; }}
          >
            <Icon name="more-horizontal" size={12} />
          </button>

          {menuOpen && (
            <div ref={menuRef} style={{ position: 'fixed', top: menuPos.top, left: menuPos.left, zIndex: 1000, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-pop)', minWidth: 188, padding: 4, animation: 'oc-scale-in 140ms var(--ease-out)' }}>

              {repoFullName && (
                <div style={{ padding: '6px 10px 4px', fontFamily: 'var(--font-sans)', fontSize: 10, color: 'var(--fg-subtle)', display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid var(--border-subtle)', marginBottom: 4 }}>
                  <Icon name={repoProvider === 'github' ? 'github' : 'git-branch'} size={11} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{repoFullName}</span>
                </div>
              )}

              <button onClick={startRename} style={menuItemStyle}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <Icon name="pencil" size={13} style={{ color: 'var(--fg-muted)' }} />
                Rename
              </button>

              <button onClick={() => { setMenuOpen(false); onLinkRepo?.(); }} style={menuItemStyle}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <Icon name="link" size={13} style={{ color: 'var(--fg-muted)' }} />
                {repoFullName ? 'Change repository' : 'Link repository'}
              </button>

              {repoFullName && (
                <button onClick={() => { setMenuOpen(false); onUnlinkRepo?.(); }} style={menuItemStyle}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Icon name="link-2-off" size={13} style={{ color: 'var(--fg-muted)' }} />
                  Unlink repository
                </button>
              )}

              <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />

              <button onClick={() => { setMenuOpen(false); onDelete?.(); }} style={{ ...menuItemStyle, color: 'var(--s-blocked-500)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <Icon name="trash-2" size={13} />
                Delete project
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Topbar ───────────────────────────────────────────────────────────────────
export function Topbar({ onOpenCommand, onToggleSidebar, theme, onToggleTheme }) {
  const { dispatch, state } = useApp();
  const spaces = state.spaces;
  const members = state.members;
  return (
    <header style={{
      height: 48, flexShrink: 0, background: 'var(--bg)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10,
    }}>
      <button className="oc-btn oc-btn--ghost oc-btn--icon" onClick={onToggleSidebar} title="Toggle sidebar">
        <Icon name="panel-left" size={15} />
      </button>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 'var(--fs-13)', color: 'var(--fg-muted)', minWidth: 0, flex: 1 }}>
        <BreadcrumbItem
          label={spaces[0]?.name ?? 'Space'}
          items={spaces.map((sp, i) => ({ label: sp.name, icon: sp.icon ?? 'layers', color: sp.color ?? 'var(--accent)', active: i === 0 }))}
          renderItem={(it, close) => (
            <button key={it.label} onClick={close} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 10px', border: 'none', borderRadius: 'var(--r-sm)', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-13)', color: 'var(--fg)', textAlign: 'left' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ width: 18, height: 18, borderRadius: 4, background: it.color + '22', color: it.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={it.icon} size={11} strokeWidth={2.4} /></span>
              <span style={{ flex: 1 }}>{it.label}</span>
              {it.active && <Icon name="check" size={12} style={{ color: 'var(--accent)' }} />}
            </button>
          )}
        />
      </nav>
      <button
        onClick={onOpenCommand}
        style={{
          height: 30, padding: '0 10px', minWidth: 240,
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--r-md)', color: 'var(--fg-muted)',
          fontSize: 'var(--fs-13)', fontFamily: 'var(--font-sans)', cursor: 'pointer',
        }}
      >
        <Icon name="search" size={14} />
        <span style={{ flex: 1 }}>Jump to anything…</span>
        <span className="oc-kbd">⌘K</span>
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button
          className="oc-btn oc-btn--ghost oc-btn--icon"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={onToggleTheme}
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={15} />
        </button>
        <div style={{ width: 1, height: 20, background: 'var(--border-subtle)' }} />
        <button className="oc-btn oc-btn--ghost oc-btn--icon" title="Activity" onClick={() => dispatch({ type: A.SET_UI, payload: { sidePanel: 'activity' } })}><Icon name="activity" size={15} /></button>
        <button className="oc-btn oc-btn--ghost oc-btn--icon" title="Notifications" onClick={() => dispatch({ type: A.SET_UI, payload: { sidePanel: 'notifications' } })}>
          <Icon name="bell" size={15} />
        </button>
        <div style={{ width: 1, height: 20, background: 'var(--border-subtle)', margin: '0 4px' }} />
        <AvatarStack names={members.slice(0, 4).map(m => m.name)} max={3} size={22} />
        <button
          className="oc-btn oc-btn--primary"
          style={{ marginLeft: 6 }}
          onClick={() => dispatch({ type: A.SET_UI, payload: { newTaskOpen: true, newTaskInitialStatus: 'open' } })}
        >
          <Icon name="plus" size={13} /> New task
        </button>
      </div>
    </header>
  );
}

// ─── Project header ───────────────────────────────────────────────────────────
export function ProjectHeader({ view, onViewChange }) {
  const { state, dispatch, visibleTasks, memberNames } = useApp();
  const { filters, sort } = state;

  const totalDone = visibleTasks.filter(t => t.status === 'merged' || t.status === 'done').length;
  const progress = visibleTasks.length ? totalDone / visibleTasks.length : 0;

  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const filterRef = useRef(null);
  const sortRef = useRef(null);

  // Click-outside to dismiss popovers
  useClickOutside(filterRef, () => setFilterOpen(false));
  useClickOutside(sortRef, () => setSortOpen(false));

  const hasFilters = filters.assignee.length || filters.priority.length || filters.tags.length;
  const allTags = [...new Set(state.tasks.flatMap(t => t.tags))].sort();

  const SORT_OPTIONS = [
    { v: 'id-asc',       label: 'ID (oldest first)' },
    { v: 'due-asc',      label: 'Due date (earliest)' },
    { v: 'due-desc',     label: 'Due date (latest)' },
    { v: 'priority-asc', label: 'Priority (urgent first)' },
    { v: 'priority-desc',label: 'Priority (low first)' },
  ];

  return (
    <div style={{ padding: '14px 18px 0', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: 'var(--r-md)', background: 'linear-gradient(135deg, var(--brand-500), var(--brand-700))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="box" size={15} strokeWidth={2} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <h1 className="t-h1" style={{ margin: 0 }}>{state.activeSpaceName ?? state.workspace?.name ?? 'Workspace'}</h1>
              {state.activeProjectName && (
                <>
                  <Icon name="chevron-right" size={14} style={{ color: 'var(--fg-subtle)', flexShrink: 0 }} />
                  <span className="t-h1" style={{ color: 'var(--fg-muted)', fontWeight: 500 }}>{state.activeProjectName}</span>
                </>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
            <span className="t-small">{visibleTasks.length} tasks</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 120, height: 4, background: 'var(--bg-card)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ width: `${progress * 100}%`, height: '100%', background: 'var(--accent)', borderRadius: 999, transition: 'width 300ms' }} />
              </div>
              <span className="t-mono-sm" style={{ color: 'var(--fg-muted)' }}>{Math.round(progress * 100)}%</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Filter popover */}
          <div style={{ position: 'relative' }} ref={filterRef}>
            <button
              className="oc-btn oc-btn--ghost"
              onClick={() => { setFilterOpen(o => !o); setSortOpen(false); }}
              style={{ color: hasFilters ? 'var(--accent)' : 'var(--fg-muted)' }}
            >
              <Icon name="filter" size={13} />Filter{hasFilters ? ` (${[...filters.assignee,...filters.priority,...filters.tags].length})` : ''}
            </button>
            {filterOpen && (
              <Popover>
                <PopoverSection label="Priority">
                  {['urgent','high','normal','low'].map(p => (
                    <CheckItem
                      key={p} label={p.charAt(0).toUpperCase() + p.slice(1)}
                      checked={filters.priority.includes(p)}
                      onChange={() => {
                        const next = filters.priority.includes(p)
                          ? filters.priority.filter(x => x !== p)
                          : [...filters.priority, p];
                        dispatch({ type: A.SET_FILTER, payload: { priority: next } });
                      }}
                    />
                  ))}
                </PopoverSection>
                <PopoverSection label="Assignee">
                  {memberNames.map(m => (
                    <CheckItem
                      key={m} label={m}
                      checked={filters.assignee.includes(m)}
                      onChange={() => {
                        const next = filters.assignee.includes(m)
                          ? filters.assignee.filter(x => x !== m)
                          : [...filters.assignee, m];
                        dispatch({ type: A.SET_FILTER, payload: { assignee: next } });
                      }}
                    />
                  ))}
                </PopoverSection>
                <PopoverSection label="Tags">
                  {allTags.map(t => (
                    <CheckItem
                      key={t} label={t}
                      checked={filters.tags.includes(t)}
                      onChange={() => {
                        const next = filters.tags.includes(t)
                          ? filters.tags.filter(x => x !== t)
                          : [...filters.tags, t];
                        dispatch({ type: A.SET_FILTER, payload: { tags: next } });
                      }}
                    />
                  ))}
                </PopoverSection>
              </Popover>
            )}
          </div>

          {/* Sort popover */}
          <div style={{ position: 'relative' }} ref={sortRef}>
            <button className="oc-btn oc-btn--ghost" onClick={() => { setSortOpen(o => !o); setFilterOpen(false); }}>
              <Icon name="arrow-up-down" size={13} />Sort
            </button>
            {sortOpen && (
              <Popover>
                {SORT_OPTIONS.map(o => (
                  <button
                    key={o.v}
                    onClick={() => { dispatch({ type: A.SET_SORT, payload: o.v }); setSortOpen(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      width: '100%', padding: '7px 12px',
                      background: sort === o.v ? 'var(--bg-hover)' : 'transparent',
                      border: 'none', borderRadius: 'var(--r-sm)',
                      color: sort === o.v ? 'var(--fg)' : 'var(--fg-muted)',
                      fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-12)',
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    {sort === o.v && <Icon name="check" size={12} style={{ color: 'var(--accent)' }} />}
                    {sort !== o.v && <span style={{ width: 12 }} />}
                    {o.label}
                  </button>
                ))}
              </Popover>
            )}
          </div>

          <div style={{ width: 1, height: 20, background: 'var(--border-subtle)' }} />
          <MoreMenu tasks={state.tasks} />
        </div>
      </div>

      {/* View tabs */}
      <div style={{ display: 'flex', gap: 2, marginTop: 6 }}>
        {VIEWS.map(v => {
          const active = v.id === view;
          return (
            <button
              key={v.id}
              onClick={() => onViewChange(v.id)}
              style={{
                height: 34, padding: '0 12px 0 10px',
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'transparent', border: 'none',
                color: active ? 'var(--fg)' : 'var(--fg-muted)',
                fontSize: 'var(--fs-13)', fontWeight: active ? 600 : 500,
                fontFamily: 'var(--font-sans)', cursor: 'pointer',
                borderBottom: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
                marginBottom: -1,
              }}
            >
              <Icon name={v.icon} size={14} strokeWidth={active ? 2.2 : 1.9} />
              {v.label}
            </button>
          );
        })}
        <ViewPicker view={view} onViewChange={onViewChange} />
      </div>
    </div>
  );
}

// ─── Command Palette ──────────────────────────────────────────────────────────
export function CommandPalette({ open, onClose }) {
  const { state, dispatch, visibleTasks } = useApp();
  const [q, setQ] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) { setTimeout(() => inputRef.current?.focus(), 20); setQ(''); setSelectedIdx(0); }
  }, [open]);

  function go(action) {
    action();
    onClose();
  }

  const staticItems = [
    { g: 'Actions', icon: 'plus-circle',     label: 'Create task',         kbd: 'T',   action: () => dispatch({ type: A.SET_UI, payload: { newTaskOpen: true, newTaskInitialStatus: 'open' } }) },
    { g: 'Actions', icon: 'layers',          label: 'Create space',        kbd: '',    action: () => { onClose(); setTimeout(() => { const el = document.querySelector('[data-add-space]'); if (el) el.click(); }, 80); } },
    { g: 'Actions', icon: 'settings',        label: 'Open settings',       kbd: '',    action: () => dispatch({ type: A.SET_UI, payload: { settingsOpen: true, settingsSection: 'profile' } }) },
    { g: 'Navigate', icon: 'kanban',         label: 'Go to Board view',    kbd: 'G B', action: () => dispatch({ type: A.SET_UI, payload: { view: 'board' } }) },
    { g: 'Navigate', icon: 'list',           label: 'Go to List view',     kbd: 'G L', action: () => dispatch({ type: A.SET_UI, payload: { view: 'list' } }) },
    { g: 'Navigate', icon: 'calendar',       label: 'Go to Calendar view', kbd: 'G C', action: () => dispatch({ type: A.SET_UI, payload: { view: 'calendar' } }) },
    { g: 'Navigate', icon: 'gantt-chart',    label: 'Go to Timeline',      kbd: 'G T', action: () => dispatch({ type: A.SET_UI, payload: { view: 'gantt' } }) },
  ];

  const taskItems = visibleTasks
    .filter(t => !q || t.title.toLowerCase().includes(q.toLowerCase()) || t.id.toLowerCase().includes(q.toLowerCase()))
    .slice(0, 6)
    .map(t => ({
      g: 'Tasks', icon: 'hash', label: `${t.id} · ${t.title}`,
      action: () => dispatch({ type: A.SET_UI, payload: { openTaskId: t.id } }),
    }));

  const filtered = q
    ? [...staticItems.filter(i => i.label.toLowerCase().includes(q.toLowerCase())), ...taskItems]
    : [...staticItems, ...taskItems];

  function handleKeyDown(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, filtered.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter') { if (filtered[selectedIdx]) go(filtered[selectedIdx].action); }
    else if (e.key === 'Escape') onClose();
  }

  if (!open) return null;

  const groups = ['Actions', 'Navigate', 'Tasks'];

  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 100,
      background: 'rgba(5,5,10,0.55)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      paddingTop: '10vh', animation: 'oc-fade-in 180ms var(--ease-out)',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 560, maxWidth: '92%', background: 'var(--bg-elevated)',
        border: '1px solid var(--border)', borderRadius: 'var(--r-xl)',
        boxShadow: 'var(--shadow-lg)', overflow: 'hidden',
        animation: 'oc-scale-in 180ms var(--ease-out)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
          <Icon name="search" size={16} style={{ color: 'var(--fg-muted)' }} />
          <input
            ref={inputRef} value={q}
            onChange={e => { setQ(e.target.value); setSelectedIdx(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Search tasks, or type a command…"
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--fg)', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-15)' }}
          />
          <span className="oc-kbd">esc</span>
        </div>
        <div style={{ maxHeight: 380, overflow: 'auto', padding: 8 }}>
          {groups.map(group => {
            const items = filtered.filter(i => i.g === group);
            if (!items.length) return null;
            return (
              <div key={group} style={{ marginBottom: 8 }}>
                <div className="t-label" style={{ padding: '6px 10px 4px' }}>{group}</div>
                {items.map((it, localIdx) => {
                  const globalIdx = filtered.indexOf(it);
                  const active = globalIdx === selectedIdx;
                  return (
                    <div
                      key={localIdx}
                      onClick={() => go(it.action)}
                      onMouseEnter={() => setSelectedIdx(globalIdx)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                        borderRadius: 'var(--r-md)', cursor: 'pointer',
                        background: active ? 'var(--bg-hover)' : 'transparent',
                      }}
                    >
                      <Icon name={it.icon} size={15} style={{ color: 'var(--fg-muted)' }} />
                      <span style={{ flex: 1, fontSize: 'var(--fs-13)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.label}</span>
                      {it.kbd && <span className="oc-kbd">{it.kbd}</span>}
                    </div>
                  );
                })}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ padding: '20px 10px', textAlign: 'center', color: 'var(--fg-subtle)', fontSize: 'var(--fs-13)' }}>
              No results for "{q}"
            </div>
          )}
        </div>
        <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 12, fontSize: 'var(--fs-11)', color: 'var(--fg-subtle)' }}>
          <span><span className="oc-kbd">↑</span> <span className="oc-kbd">↓</span> navigate</span>
          <span><span className="oc-kbd">↵</span> select</span>
          <span style={{ marginLeft: 'auto' }}>OpenClick</span>
        </div>
      </div>
    </div>
  );
}

// ─── + View picker ───────────────────────────────────────────────────────────
const ALL_VIEW_TYPES = [
  { id: 'board',    label: 'Board',    icon: 'kanban',      built: true },
  { id: 'list',     label: 'List',     icon: 'list',        built: true },
  { id: 'calendar', label: 'Calendar', icon: 'calendar',    built: true },
  { id: 'gantt',    label: 'Timeline', icon: 'gantt-chart', built: true },
  null,
  { id: 'table',    label: 'Table',    icon: 'table-2',     built: false },
  { id: 'docs',     label: 'Docs',     icon: 'file-text',   built: false },
  { id: 'roadmap',  label: 'Roadmap',  icon: 'map',         built: false },
];

function ViewPicker({ view, onViewChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ height: 34, padding: '0 8px', display: 'flex', alignItems: 'center', gap: 4, background: 'transparent', border: 'none', color: open ? 'var(--fg)' : 'var(--fg-subtle)', fontSize: 'var(--fs-13)', cursor: 'pointer', fontFamily: 'var(--font-sans)', borderRadius: 'var(--r-sm)' }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--fg)'; e.currentTarget.style.background = 'var(--bg-hover)'; }}
        onMouseLeave={e => { if (!open) { e.currentTarget.style.color = 'var(--fg-subtle)'; e.currentTarget.style.background = 'transparent'; } }}
      >
        <Icon name="plus" size={13} /> View
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, zIndex: 200, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-pop)', minWidth: 200, padding: 6, animation: 'oc-scale-in 140ms var(--ease-out)' }}>
          <div className="t-label" style={{ padding: '4px 10px 6px', fontSize: 10 }}>Add view</div>
          {ALL_VIEW_TYPES.map((vt, i) => vt === null
            ? <div key={i} style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />
            : (
              <button
                key={vt.id}
                onClick={() => { if (vt.built) { onViewChange(vt.id); setOpen(false); } }}
                disabled={!vt.built}
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 10px', border: 'none', borderRadius: 'var(--r-sm)', background: view === vt.id ? 'var(--bg-selected)' : 'transparent', cursor: vt.built ? 'pointer' : 'default', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-13)', color: vt.built ? 'var(--fg)' : 'var(--fg-subtle)', textAlign: 'left', opacity: vt.built ? 1 : 0.6 }}
                onMouseEnter={e => { if (vt.built && view !== vt.id) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                onMouseLeave={e => { if (view !== vt.id) e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon name={vt.icon} size={14} style={{ color: view === vt.id ? 'var(--accent)' : 'var(--fg-muted)', flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{vt.label}</span>
                {view === vt.id && <Icon name="check" size={12} style={{ color: 'var(--accent)', flexShrink: 0 }} />}
                {!vt.built && <span style={{ fontSize: 10, color: 'var(--fg-subtle)', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 999, padding: '1px 6px' }}>Soon</span>}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

// ─── Breadcrumb dropdown ──────────────────────────────────────────────────────
function BreadcrumbItem({ label, items, renderItem, active }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: open ? 'var(--bg-hover)' : 'transparent', border: 'none', cursor: 'pointer',
          fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-13)',
          color: active ? 'var(--fg)' : 'var(--fg-muted)',
          fontWeight: active ? 500 : 400,
          padding: '3px 6px', borderRadius: 'var(--r-sm)',
          display: 'flex', alignItems: 'center', gap: 4,
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = 'transparent'; }}
      >
        {label}
        <Icon name="chevron-down" size={10} style={{ color: 'var(--fg-subtle)', transition: 'transform var(--dur-fast)', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, zIndex: 200, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-pop)', minWidth: 220, padding: 6, animation: 'oc-scale-in 140ms var(--ease-out)' }}>
          {items.map(it => renderItem(it, () => setOpen(false)))}
        </div>
      )}
    </div>
  );
}

// ─── ProjectHeader more-options menu ─────────────────────────────────────────
function MoreMenu({ tasks }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));

  function exportCSV() {
    const headers = ['ID','Title','Status','Priority','Assignees','Due','Tags'];
    const rows = tasks.map(t => [t.id, t.title, t.status, t.priority, t.assignees.join('; '), t.due, t.tags.join('; ')]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: 'tasks.csv' });
    a.click();
    URL.revokeObjectURL(url);
    setOpen(false);
  }

  const items = [
    { icon: 'download', label: 'Export as CSV', action: exportCSV },
  ];

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className="oc-btn oc-btn--ghost oc-btn--icon" onClick={() => setOpen(o => !o)}>
        <Icon name="more-horizontal" size={15} />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 6, zIndex: 200, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-pop)', minWidth: 180, padding: 6, animation: 'oc-scale-in 140ms var(--ease-out)' }}>
          {items.map(it => (
            <button key={it.label} onClick={it.action} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 10px', border: 'none', borderRadius: 'var(--r-sm)', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-13)', color: 'var(--fg)', textAlign: 'left' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Icon name={it.icon} size={13} style={{ color: 'var(--fg-muted)' }} /> {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Shared popover primitives ────────────────────────────────────────────────
function Popover({ children }) {
  return (
    <div style={{
      position: 'absolute', top: '100%', left: 0, zIndex: 50, marginTop: 6,
      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
      borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-pop)',
      minWidth: 200, maxWidth: 280, padding: 8,
      animation: 'oc-scale-in 140ms var(--ease-out)',
    }}>
      {children}
    </div>
  );
}

function PopoverSection({ label, children }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div className="t-label" style={{ padding: '4px 8px 6px', fontSize: 10 }}>{label}</div>
      {children}
    </div>
  );
}

function CheckItem({ label, checked, onChange }) {
  return (
    <label style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '6px 8px', borderRadius: 'var(--r-sm)',
      cursor: 'pointer', fontSize: 'var(--fs-12)', color: 'var(--fg)',
    }}
    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      <input type="checkbox" checked={checked} onChange={onChange}
        style={{ accentColor: 'var(--accent)', width: 13, height: 13 }} />
      {label}
    </label>
  );
}

function useClickOutside(ref, callback) {
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) callback();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, callback]);
}
