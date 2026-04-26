import { useState, useRef, useEffect } from 'react';
import { Icon, Avatar } from '../components/primitives.jsx';
import { useApp, A } from '../store/AppContext.jsx';
import * as usersApi        from '../api/users.js';
import * as membersApi      from '../api/members.js';
import * as workspaceApi    from '../api/workspace.js';
import * as integrationsApi from '../api/integrations.js';
import * as billingApi      from '../api/billing.js';

// ─── Click-outside hook ───────────────────────────────────────────────────────
function useClickOutside(ref, cb) {
  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) cb(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, cb]);
}

// ─── Nav sections ─────────────────────────────────────────────────────────────
const NAV = [
  { group: 'Account',   items: [
    { id: 'profile',       label: 'Profile',       icon: 'user' },
    { id: 'security',      label: 'Security',      icon: 'shield' },
    { id: 'notifications', label: 'Notifications', icon: 'bell' },
  ]},
  { group: 'Workspace', items: [
    { id: 'workspace',     label: 'Workspace',     icon: 'building-2' },
    { id: 'appearance',    label: 'Appearance',    icon: 'palette' },
    { id: 'integrations',  label: 'Integrations',  icon: 'plug' },
    { id: 'billing',       label: 'Billing',       icon: 'credit-card' },
  ]},
  { group: 'Danger',    items: [
    { id: 'danger',        label: 'Danger zone',   icon: 'triangle-alert' },
  ]},
];

// ─── Shared primitives ────────────────────────────────────────────────────────
function Section({ title, children, last }) {
  return (
    <div style={{ paddingBottom: last ? 0 : 32, borderBottom: last ? 'none' : '1px solid var(--border-subtle)', marginBottom: last ? 0 : 32 }}>
      {title && <h3 style={{ margin: '0 0 18px', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-14)', fontWeight: 600, color: 'var(--fg)' }}>{title}</h3>}
      {children}
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24, alignItems: 'flex-start', marginBottom: 20 }}>
      <div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-13)', fontWeight: 500, color: 'var(--fg)', lineHeight: 1.4 }}>{label}</div>
        {hint && <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-12)', color: 'var(--fg-subtle)', marginTop: 3, lineHeight: 1.5 }}>{hint}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text', disabled }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange?.(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: '100%', height: 36, padding: '0 12px',
        background: 'var(--bg-card)', border: `1px solid ${focused ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 'var(--r-md)', color: disabled ? 'var(--fg-muted)' : 'var(--fg)',
        fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-13)',
        outline: 'none', boxSizing: 'border-box',
        opacity: disabled ? 0.6 : 1, cursor: disabled ? 'not-allowed' : 'text',
        boxShadow: focused ? '0 0 0 3px var(--accent-alpha)' : 'none',
        transition: 'border-color var(--dur-fast), box-shadow var(--dur-fast)',
      }}
    />
  );
}

function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={e => onChange?.(e.target.value)}
      style={{
        height: 36, padding: '0 10px',
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--r-md)', color: 'var(--fg)',
        fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-13)',
        outline: 'none', cursor: 'pointer', minWidth: 160,
      }}
    >
      {options.map(o => <option key={o.v} value={o.v}>{o.label}</option>)}
    </select>
  );
}

function SaveBtn({ label = 'Save changes', onClick, variant = 'primary', disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`oc-btn oc-btn--${variant}`}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      {label}
    </button>
  );
}

function Toggle({ value, onChange, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between', padding: '10px 0' }}>
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-13)', color: 'var(--fg)' }}>{label}</span>
      <button
        onClick={() => onChange?.(!value)}
        style={{
          width: 40, height: 22, borderRadius: 999, padding: 2,
          background: value ? 'var(--accent)' : 'var(--bg-card)',
          border: `1px solid ${value ? 'var(--accent)' : 'var(--border)'}`,
          cursor: 'pointer', display: 'flex', alignItems: 'center',
          transition: 'background var(--dur-base), border-color var(--dur-base)',
          flexShrink: 0,
        }}
      >
        <span style={{
          width: 16, height: 16, borderRadius: 999,
          background: '#fff', boxShadow: 'var(--shadow-sm)',
          transform: value ? 'translateX(18px)' : 'translateX(0)',
          transition: 'transform var(--dur-base) var(--ease-out)',
          display: 'block',
        }} />
      </button>
    </div>
  );
}

function Badge({ label, color }) {
  const colors = {
    green:  { bg: '#14532d22', fg: '#4ade80' },
    blue:   { bg: '#1e3a5f22', fg: '#60a5fa' },
    orange: { bg: '#78350f22', fg: '#fb923c' },
    red:    { bg: '#7f1d1d22', fg: '#f87171' },
  };
  const c = colors[color] ?? colors.blue;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', height: 20, padding: '0 8px',
      borderRadius: 999, background: c.bg, color: c.fg,
      fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 600, letterSpacing: '0.05em',
    }}>{label}</span>
  );
}

// ─── Color swatch picker ──────────────────────────────────────────────────────
const AVATAR_COLORS = ['#6366f1','#8b5cf6','#ec4899','#ef4444','#f97316','#eab308','#22c55e','#06b6d4','#3b82f6','#64748b'];
function ColorSwatch({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {AVATAR_COLORS.map(c => (
        <button
          key={c}
          onClick={() => onChange(c)}
          style={{
            width: 28, height: 28, borderRadius: 999,
            background: c, border: `2px solid ${value === c ? '#fff' : 'transparent'}`,
            boxShadow: value === c ? `0 0 0 2px ${c}` : 'none',
            cursor: 'pointer', transition: 'box-shadow var(--dur-fast)',
          }}
        />
      ))}
    </div>
  );
}

// ─── Profile section ──────────────────────────────────────────────────────────
function ProfileSection() {
  const { state } = useApp();
  const [name,        setName]        = useState(state.user?.name  ?? '');
  const [email,       setEmail]       = useState(state.user?.email ?? '');
  const [title,       setTitle]       = useState('');
  const [tz,          setTz]          = useState('America/Los_Angeles');
  const [avatarColor, setAvatarColor] = useState(state.user?.avatarColor ?? '#6366f1');
  const [saved,       setSaved]       = useState(false);
  const [saving,      setSaving]      = useState(false);

  // Hydrate full profile from API
  useEffect(() => {
    usersApi.getProfile().then(p => {
      setName(p.name ?? '');
      setEmail(p.email ?? '');
      setTitle(p.title ?? '');
      setTz(p.timezone ?? 'America/Los_Angeles');
      setAvatarColor(p.avatarColor ?? '#6366f1');
    }).catch(() => {});
  }, []);

  async function save() {
    setSaving(true);
    try {
      await usersApi.updateProfile({ name, email, title, timezone: tz });
      if (avatarColor !== state.user?.avatarColor) {
        await usersApi.updateAvatar(avatarColor);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Section title="Avatar">
        <Field label="Profile color" hint="Used in avatars throughout the app">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 999,
              background: avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-sans)', fontSize: 20, fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>
              {name.split(' ').map(n => n[0]).join('').slice(0,2)}
            </div>
            <ColorSwatch value={avatarColor} onChange={setAvatarColor} />
          </div>
        </Field>
      </Section>

      <Section title="Personal info">
        <Field label="Full name">
          <Input value={name} onChange={setName} />
        </Field>
        <Field label="Email address" hint="Used for notifications and login">
          <Input value={email} onChange={setEmail} type="email" />
        </Field>
        <Field label="Job title" hint="Shown on your profile">
          <Input value={title} onChange={setTitle} />
        </Field>
        <Field label="Timezone">
          <Select value={tz} onChange={setTz} options={[
            { v: 'America/Los_Angeles', label: '(UTC-8) Pacific Time' },
            { v: 'America/New_York',    label: '(UTC-5) Eastern Time' },
            { v: 'Europe/London',       label: '(UTC+0) London' },
            { v: 'Europe/Berlin',       label: '(UTC+1) Berlin' },
            { v: 'Asia/Tokyo',          label: '(UTC+9) Tokyo' },
          ]} />
        </Field>
      </Section>

      <Section last>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <SaveBtn onClick={save} disabled={saving} label={saving ? 'Saving…' : 'Save changes'} />
          {saved && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--s-done-500)', fontSize: 'var(--fs-13)', fontFamily: 'var(--font-sans)' }}>
              <Icon name="check" size={14} /> Saved
            </span>
          )}
        </div>
      </Section>
    </>
  );
}

// ─── Workspace section ────────────────────────────────────────────────────────
const ROLE_OPTIONS = [
  { v: 'owner',  label: 'Owner' },
  { v: 'admin',  label: 'Admin' },
  { v: 'member', label: 'Member' },
  { v: 'viewer', label: 'Viewer' },
];

function WorkspaceSection() {
  const { state } = useApp();
  const workspaceId = state.workspaceId;
  const [wsName,     setWsName]     = useState('');
  const [invite,     setInvite]     = useState('');
  const [inviteSent, setInviteSent] = useState('');
  const [wsSaved,    setWsSaved]    = useState(false);
  const [members, setMembers] = useState([]);

  // Load workspace + members from API
  useEffect(() => {
    if (!workspaceId) return;
    workspaceApi.get(workspaceId).then(ws => setWsName(ws.name)).catch(() => {});
    membersApi.list(workspaceId).then(data => {
      if (data.members?.length) setMembers(data.members);
    }).catch(() => {});
  }, [workspaceId]);

  function handleInvite() {
    if (!invite.trim() || !workspaceId) return;
    const email = invite.trim();
    membersApi.invite(workspaceId, email).catch(console.error);
    setInviteSent(email);
    setInvite('');
    setTimeout(() => setInviteSent(''), 4000);
  }

  function handleRoleChange(memberEmail, role) {
    if (!workspaceId) return;
    setMembers(ms => ms.map(m => m.email === memberEmail ? { ...m, role } : m));
    membersApi.updateRole(workspaceId, memberEmail, role).catch(console.error);
  }

  function handleRemoveMember(memberEmail) {
    if (!workspaceId) return;
    setMembers(ms => ms.filter(m => m.email !== memberEmail));
    membersApi.remove(workspaceId, memberEmail).catch(console.error);
  }

  function handleSaveWs() {
    if (workspaceId) workspaceApi.update(workspaceId, { name: wsName }).catch(console.error);
    setWsSaved(true);
    setTimeout(() => setWsSaved(false), 3000);
  }

  return (
    <>
      <Section title="General">
        <Field label="Workspace name">
          <Input value={wsName} onChange={setWsName} />
        </Field>
        <Field label="Workspace ID" hint="Cannot be changed">
          <Input value={workspaceId ?? '—'} disabled />
        </Field>
      </Section>

      <Section title="Members">
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-lg)', overflow: 'hidden', marginBottom: 16 }}>
          {members.map((m, i) => (
            <div
              key={m.name}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                borderBottom: i < members.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              }}
            >
              <Avatar name={m.name} size={28} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-13)', fontWeight: 500, color: 'var(--fg)' }}>{m.name}</div>
                <div style={{ fontSize: 11, color: 'var(--fg-subtle)', fontFamily: 'var(--font-sans)' }}>{m.email ?? m.role}</div>
              </div>
              <select
                value={m.role}
                onChange={e => handleRoleChange(m.email, e.target.value)}
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-sm)', color: 'var(--fg)', fontFamily: 'var(--font-sans)', fontSize: 12, padding: '3px 8px', cursor: m.role === 'owner' ? 'not-allowed' : 'pointer' }}
                disabled={m.role === 'owner'}
              >
                {ROLE_OPTIONS.map(o => <option key={o.v} value={o.v}>{o.label}</option>)}
              </select>
              {m.role !== 'owner' && (
                <button
                  onClick={() => handleRemoveMember(m.email)}
                  className="oc-btn oc-btn--ghost oc-btn--icon"
                  style={{ color: 'var(--fg-subtle)' }}
                >
                  <Icon name="x" size={13} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <Input value={invite} onChange={setInvite} placeholder="Invite by email address…" type="email"
              onKeyDown={e => e.key === 'Enter' && handleInvite()} />
          </div>
          <button className="oc-btn oc-btn--primary" onClick={handleInvite}>
            <Icon name="send" size={13} /> Invite
          </button>
        </div>
        {inviteSent && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, padding: '8px 12px', background: 'rgba(var(--s-done-rgb, 34,197,94),0.1)', border: '1px solid var(--s-done-500)', borderRadius: 'var(--r-md)', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-12)', color: 'var(--s-done-500)' }}>
            <Icon name="check-circle-2" size={13} /> Invite sent to {inviteSent}
          </div>
        )}
      </Section>

      <Section title="Spaces">
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
          {state.spaces.length === 0 && (
            <div style={{ padding: '12px 14px', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-13)', color: 'var(--fg-subtle)' }}>No spaces yet</div>
          )}
          {state.spaces.map((sp, i) => (
            <div
              key={sp.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                borderBottom: i < state.spaces.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              }}
            >
              <span style={{ width: 24, height: 24, borderRadius: 6, background: (sp.color ?? 'var(--accent)') + '22', color: sp.color ?? 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={sp.icon ?? 'layers'} size={13} strokeWidth={2.4} />
              </span>
              <span style={{ flex: 1, fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-13)', color: 'var(--fg)' }}>{sp.name}</span>
              <Badge label="Active" color="green" />
            </div>
          ))}
        </div>
      </Section>

      <Section last>
        <SaveBtn label={wsSaved ? 'Saved!' : 'Save workspace settings'} onClick={handleSaveWs} />
      </Section>
    </>
  );
}

// ─── Appearance section ───────────────────────────────────────────────────────
const THEME_OPTIONS = [
  { v: 'dark',   label: 'Dark',   icon: 'moon',       desc: 'Easy on the eyes' },
  { v: 'light',  label: 'Light',  icon: 'sun',        desc: 'High contrast' },
  { v: 'system', label: 'System', icon: 'monitor',    desc: 'Follows OS setting' },
];

const DENSITY_OPTIONS = [
  { v: 'comfortable', label: 'Comfortable', desc: 'More whitespace' },
  { v: 'compact',     label: 'Compact',     desc: 'Denser layout' },
];

function AppearanceSection({ tweaks, setKey }) {
  return (
    <>
      <Section title="Theme">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {THEME_OPTIONS.map(o => {
            const active = tweaks.theme === o.v || (o.v === 'system' && false);
            const isActive = tweaks.theme === o.v;
            return (
              <button
                key={o.v}
                onClick={() => o.v !== 'system' && setKey('theme', o.v)}
                style={{
                  padding: '14px 12px', borderRadius: 'var(--r-lg)',
                  border: `2px solid ${isActive ? 'var(--accent)' : 'var(--border-subtle)'}`,
                  background: isActive ? 'var(--bg-selected)' : 'var(--bg-card)',
                  cursor: o.v === 'system' ? 'not-allowed' : 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  opacity: o.v === 'system' ? 0.5 : 1,
                  transition: 'border-color var(--dur-fast), background var(--dur-fast)',
                }}
              >
                <Icon name={o.icon} size={20} style={{ color: isActive ? 'var(--accent)' : 'var(--fg-muted)' }} />
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-13)', fontWeight: 600, color: isActive ? 'var(--accent-text)' : 'var(--fg)' }}>{o.label}</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--fg-subtle)' }}>{o.desc}</div>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Density">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          {DENSITY_OPTIONS.map(o => {
            const isActive = tweaks.density === o.v;
            return (
              <button
                key={o.v}
                onClick={() => setKey('density', o.v)}
                style={{
                  padding: '14px 12px', borderRadius: 'var(--r-lg)',
                  border: `2px solid ${isActive ? 'var(--accent)' : 'var(--border-subtle)'}`,
                  background: isActive ? 'var(--bg-selected)' : 'var(--bg-card)',
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  transition: 'border-color var(--dur-fast), background var(--dur-fast)',
                }}
              >
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-13)', fontWeight: 600, color: isActive ? 'var(--accent-text)' : 'var(--fg)' }}>{o.label}</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--fg-subtle)' }}>{o.desc}</div>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Sidebar" last>
        <Field label="Width" hint={`${tweaks.sidebarWidth}px`}>
          <input
            type="range" min={200} max={320} step={4}
            value={tweaks.sidebarWidth}
            onChange={e => setKey('sidebarWidth', parseInt(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent)' }}
          />
        </Field>
        <Field label="Default state">
          <div style={{ display: 'flex', gap: 8 }}>
            {['Expanded', 'Collapsed'].map(v => {
              const val = v.toLowerCase();
              const isActive = tweaks.sidebarCollapsed === (val === 'collapsed');
              return (
                <button
                  key={v}
                  onClick={() => setKey('sidebarCollapsed', val === 'collapsed')}
                  style={{
                    padding: '6px 16px', borderRadius: 'var(--r-md)',
                    border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                    background: isActive ? 'var(--bg-selected)' : 'var(--bg-card)',
                    color: isActive ? 'var(--accent-text)' : 'var(--fg-muted)',
                    fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-13)', fontWeight: isActive ? 600 : 400,
                    cursor: 'pointer',
                  }}
                >{v}</button>
              );
            })}
          </div>
        </Field>
      </Section>
    </>
  );
}

// ─── Notifications section ────────────────────────────────────────────────────
function NotificationsSection() {
  const [prefs, setPrefs] = useState({
    taskAssigned: true, taskMentioned: true, taskCommented: true,
    taskCompleted: false, weeklyDigest: true, releaseNotes: false,
    inAppBadges: true, inAppSounds: false,
  });
  const [saved, setSaved]   = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    usersApi.getNotificationPrefs().then(data => {
      setPrefs({
        taskAssigned:  data.email?.taskAssigned  ?? true,
        taskMentioned: data.email?.taskMentioned ?? true,
        taskCommented: data.email?.taskCommented ?? false,
        taskCompleted: data.email?.taskCompleted ?? false,
        weeklyDigest:  data.email?.weeklyDigest  ?? false,
        releaseNotes:  data.email?.releaseNotes  ?? true,
        inAppBadges:   data.inApp?.badges ?? true,
        inAppSounds:   data.inApp?.sounds ?? false,
      });
    }).catch(() => {});
  }, []);

  const toggle = k => setPrefs(p => ({ ...p, [k]: !p[k] }));

  async function save() {
    setSaving(true);
    try {
      await usersApi.updateNotificationPrefs({
        email: {
          taskAssigned:  prefs.taskAssigned,
          taskMentioned: prefs.taskMentioned,
          taskCommented: prefs.taskCommented,
          taskCompleted: prefs.taskCompleted,
          weeklyDigest:  prefs.weeklyDigest,
          releaseNotes:  prefs.releaseNotes,
        },
        inApp: { badges: prefs.inAppBadges, sounds: prefs.inAppSounds },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save notification prefs:', err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Section title="Email notifications">
        {[
          { k: 'taskAssigned',   label: 'Task assigned to me' },
          { k: 'taskMentioned',  label: 'Mentioned in a comment' },
          { k: 'taskCommented',  label: 'Comment on my task' },
          { k: 'taskCompleted',  label: "Task I'm watching is completed" },
          { k: 'weeklyDigest',   label: 'Weekly digest summary' },
          { k: 'releaseNotes',   label: 'Product release notes' },
        ].map(({ k, label }) => (
          <Toggle key={k} value={prefs[k]} onChange={() => toggle(k)} label={label} />
        ))}
      </Section>

      <Section title="In-app" last>
        {[
          { k: 'inAppBadges', label: 'Show notification badges' },
          { k: 'inAppSounds', label: 'Play notification sounds' },
        ].map(({ k, label }) => (
          <Toggle key={k} value={prefs[k]} onChange={() => toggle(k)} label={label} />
        ))}
        <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
          <SaveBtn onClick={save} disabled={saving} label={saving ? 'Saving…' : 'Save changes'} />
          {saved && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--s-done-500)', fontSize: 'var(--fs-13)', fontFamily: 'var(--font-sans)' }}>
              <Icon name="check" size={14} /> Saved
            </span>
          )}
        </div>
      </Section>
    </>
  );
}

// ─── Integrations section ─────────────────────────────────────────────────────
const INTEGRATIONS_FALLBACK = [
  { id: 'github', name: 'GitHub', icon: 'github',     desc: 'Link PRs and commits to tasks', connected: false },
  { id: 'gitlab', name: 'GitLab', icon: 'git-branch', desc: 'Link merge requests to tasks',   connected: false },
];

const COMING_SOON_INTEGRATIONS = [
  { id: 'slack',    name: 'Slack',    icon: 'slack',      desc: 'Get task updates in Slack' },
  { id: 'linear',   name: 'Linear',   icon: 'zap',        desc: 'Sync issues bidirectionally' },
  { id: 'figma',    name: 'Figma',    icon: 'figma',      desc: 'Attach designs to tasks' },
  { id: 'jira',     name: 'Jira',     icon: 'briefcase',  desc: 'Import from Jira projects' },
  { id: 'webhooks', name: 'Webhooks', icon: 'webhook',    desc: 'Send events to any endpoint' },
];

function IntegrationsSection() {
  const { state } = useApp();
  const workspaceId = state.workspaceId;
  const [list, setList] = useState(INTEGRATIONS_FALLBACK);
  const [toast, setToast] = useState(null); // { provider, success }

  function loadList(wsId) {
    integrationsApi.list(wsId).then(data => {
      const arr = Array.isArray(data) ? data : (data.integrations ?? []);
      if (arr.length) setList(arr);
    }).catch(() => {});
  }

  useEffect(() => {
    if (!workspaceId) return;
    loadList(workspaceId);
  }, [workspaceId]);

  // Listen for OAuth popup result broadcast via localStorage
  useEffect(() => {
    function handleStorage(e) {
      if (e.key !== 'oauth_result' || !e.newValue) return;
      const [provider, status] = e.newValue.split(':');
      localStorage.removeItem('oauth_result');
      setToast({ provider, success: status === 'success' });
      if (status === 'success' && workspaceId) loadList(workspaceId);
      setTimeout(() => setToast(null), 4000);
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [workspaceId]);

  function toggle(id) {
    const item = list.find(x => x.id === id);
    if (!item || !workspaceId) return;

    if (item.connected) {
      // Disconnect — optimistic
      setList(ls => ls.map(x => x.id === id ? { ...x, connected: false, connectedAs: null } : x));
      integrationsApi.disconnect(workspaceId, id).catch(() => {
        setList(ls => ls.map(x => x.id === id ? { ...x, connected: true, connectedAs: item.connectedAs } : x));
      });
    } else {
      // Connect — open OAuth authorization URL
      integrationsApi.connect(workspaceId, id)
        .then(data => {
          if (data?.authUrl) {
            window.open(data.authUrl, '_blank', 'width=600,height=700,noopener');
          } else {
            alert(data?.message ?? `${id} OAuth is not configured on this server.`);
          }
        })
        .catch(err => console.error('connect failed:', err));
    }
  }

  return (
    <Section title="Connected apps" last>
      {toast && (
        <div style={{
          marginBottom: 12, padding: '10px 14px', borderRadius: 'var(--r-md)',
          background: toast.success ? 'var(--green-subtle, rgba(34,197,94,0.1))' : 'var(--red-subtle, rgba(239,68,68,0.1))',
          border: `1px solid ${toast.success ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
          color: toast.success ? 'var(--green, #22c55e)' : 'var(--red, #ef4444)',
          fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-13)',
        }}>
          {toast.success
            ? `${toast.provider.charAt(0).toUpperCase() + toast.provider.slice(1)} connected successfully`
            : `Failed to connect ${toast.provider}. Please try again.`}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {list.map(it => (
          <div
            key={it.id}
            style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
              background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--r-lg)',
            }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 'var(--r-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name={it.icon} size={18} style={{ color: 'var(--fg-muted)' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-13)', fontWeight: 600, color: 'var(--fg)', display: 'flex', alignItems: 'center', gap: 8 }}>
                {it.name}
                {it.connected && <Badge label="Connected" color="green" />}
              </div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--fg-subtle)', marginTop: 2 }}>
                {it.connected && it.connectedAs ? `Connected as ${it.connectedAs}` : it.desc}
              </div>
            </div>
            <button
              onClick={() => toggle(it.id)}
              className={it.connected ? 'oc-btn oc-btn--ghost' : 'oc-btn oc-btn--primary'}
              style={{ flexShrink: 0 }}
            >
              {it.connected ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        ))}
        {COMING_SOON_INTEGRATIONS.map(it => (
          <div
            key={it.id}
            style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
              background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--r-lg)', opacity: 0.5,
            }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 'var(--r-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name={it.icon} size={18} style={{ color: 'var(--fg-muted)' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-13)', fontWeight: 600, color: 'var(--fg)', display: 'flex', alignItems: 'center', gap: 8 }}>
                {it.name}
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--fg-subtle)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--r-xs)', padding: '1px 5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Soon</span>
              </div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--fg-subtle)', marginTop: 2 }}>{it.desc}</div>
            </div>
            <button className="oc-btn oc-btn--secondary" disabled style={{ flexShrink: 0, opacity: 0.5 }}>Connect</button>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─── Security section ─────────────────────────────────────────────────────────
function SecuritySection() {
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [show, setShow] = useState(false);
  const [twofa, setTwofa] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [pwUpdated, setPwUpdated] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  // Load real sessions from API
  useEffect(() => {
    usersApi.listSessions()
      .then(data => { if (data.sessions?.length) setSessions(data.sessions); })
      .catch(() => {});
  }, []);

  async function handleUpdatePassword() {
    if (!currentPw || !newPw || newPw !== confirmPw) return;
    setPwSaving(true);
    setPwError('');
    try {
      await usersApi.changePassword({ current_password: currentPw, new_password: newPw, confirm_password: confirmPw });
      setPwUpdated(true);
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      setTimeout(() => setPwUpdated(false), 3000);
    } catch (err) {
      setPwError(err.message || 'Failed to update password');
    } finally {
      setPwSaving(false);
    }
  }

  function handleRevokeSession(id) {
    setSessions(ss => ss.filter(x => x.id !== id));
    usersApi.revokeSession(id).catch(console.error);
  }

  function strength(pw) {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^a-zA-Z0-9]/.test(pw)) s++;
    return s;
  }
  const s = strength(newPw);
  const strengthColors = ['var(--s-blocked-500)', 'var(--s-review-500)', '#fb923c', 'var(--s-done-500)'];
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];

  return (
    <>
      <Section title="Change password">
        <Field label="Current password">
          <div style={{ position: 'relative' }}>
            <Input value={currentPw} onChange={setCurrentPw} type={show ? 'text' : 'password'} />
            <button
              onClick={() => setShow(s => !s)}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-muted)' }}
            >
              <Icon name={show ? 'eye-off' : 'eye'} size={14} />
            </button>
          </div>
        </Field>
        <Field label="New password">
          <div style={{ position: 'relative' }}>
            <Input value={newPw} onChange={setNewPw} type={show ? 'text' : 'password'} />
            <button
              onClick={() => setShow(s => !s)}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-muted)' }}
            >
              <Icon name={show ? 'eye-off' : 'eye'} size={14} />
            </button>
          </div>
          {newPw && (
            <div style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                {[0,1,2,3].map(i => (
                  <div key={i} style={{ flex: 1, height: 3, borderRadius: 999, background: i < s ? strengthColors[s-1] : 'var(--bg-card)', transition: 'background var(--dur-base)' }} />
                ))}
              </div>
              <div style={{ fontSize: 11, color: strengthColors[s-1] || 'var(--fg-subtle)', fontFamily: 'var(--font-sans)' }}>
                {newPw.length >= 1 ? strengthLabels[s-1] || 'Weak' : ''}
              </div>
            </div>
          )}
        </Field>
        <Field label="Confirm new password">
          <Input value={confirmPw} onChange={setConfirmPw} type={show ? 'text' : 'password'} />
          {confirmPw && newPw !== confirmPw && (
            <div style={{ color: 'var(--s-blocked-500)', fontSize: 11, fontFamily: 'var(--font-sans)', marginTop: 4 }}>Passwords don't match</div>
          )}
        </Field>
        {pwError && (
          <div style={{ color: 'var(--s-blocked-500)', fontSize: 'var(--fs-12)', fontFamily: 'var(--font-sans)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="alert-circle" size={12} /> {pwError}
          </div>
        )}
        <SaveBtn label={pwUpdated ? 'Password updated!' : pwSaving ? 'Updating…' : 'Update password'} onClick={handleUpdatePassword} disabled={!currentPw || !newPw || newPw !== confirmPw || pwSaving} />
      </Section>

      <Section title="Two-factor authentication">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-lg)', marginBottom: 12 }}>
          <Icon name="shield-check" size={24} style={{ color: twofa ? 'var(--s-done-500)' : 'var(--fg-subtle)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-13)', fontWeight: 600, color: 'var(--fg)', display: 'flex', alignItems: 'center', gap: 8 }}>
              Authenticator app
              <Badge label={twofa ? 'Enabled' : 'Disabled'} color={twofa ? 'green' : 'orange'} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--fg-subtle)', fontFamily: 'var(--font-sans)', marginTop: 2 }}>Add an extra layer of security with TOTP</div>
          </div>
          <button className={twofa ? 'oc-btn oc-btn--ghost' : 'oc-btn oc-btn--primary'} onClick={() => setTwofa(t => !t)}>
            {twofa ? 'Disable' : 'Set up'}
          </button>
        </div>
      </Section>

      <Section title="Active sessions" last>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sessions.map(s => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-lg)' }}>
              <Icon name="monitor" size={18} style={{ color: 'var(--fg-muted)', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-13)', fontWeight: 500, color: 'var(--fg)' }}>
                  {s.device}
                  {s.current && <Badge label="Current" color="blue" />}
                </div>
                <div style={{ fontSize: 11, color: 'var(--fg-subtle)', fontFamily: 'var(--font-sans)', marginTop: 2 }}>
                  {s.location} · {s.lastSeen}
                </div>
              </div>
              {!s.current && (
                <button className="oc-btn oc-btn--ghost" style={{ color: 'var(--fg-subtle)', fontSize: 12 }} onClick={() => handleRevokeSession(s.id)}>
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

// ─── Billing section ──────────────────────────────────────────────────────────
function BillingSection() {
  const { state } = useApp();
  const workspaceId = state.workspaceId;
  const [upgradeShown, setUpgradeShown] = useState(false);
  const [manageShown, setManageShown] = useState(false);
  const [sub, setSub] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [payment, setPayment] = useState(null);

  useEffect(() => {
    if (!workspaceId) return;
    billingApi.getSubscription(workspaceId).then(setSub).catch(() => {});
    billingApi.getInvoices(workspaceId).then(data => { if (data.invoices?.length) setInvoices(data.invoices); }).catch(() => {});
    billingApi.getPaymentMethod(workspaceId).then(setPayment).catch(() => {});
  }, [workspaceId]);

  const plan         = sub?.plan           ?? '—';
  const pricePerSeat = sub?.pricePerSeat   ?? 0;
  const seats        = sub?.seats          ?? 0;
  const storage      = sub?.storageTotalGb ?? 0;
  const usedStorage  = sub?.storageUsedGb  ?? 0;
  const apiCalls     = sub?.apiCallsUsed   ?? 0;
  const apiLimit     = sub?.apiCallsLimit  ?? 0;
  const renewal      = sub?.renewalDate    ?? '—';
  const billingCycle = sub?.billingCycle   ?? '—';
  const paymentStr   = payment ? `•••• ${payment.last4} (${payment.brand})` : '—';

  return (
    <>
      {upgradeShown && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(5,5,10,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setUpgradeShown(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 32, width: 400, textAlign: 'center', animation: 'oc-scale-in 200ms var(--ease-out)' }}>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 18, fontWeight: 700, color: 'var(--fg)', marginBottom: 8 }}>Upgrade your plan</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-13)', color: 'var(--fg-muted)', marginBottom: 24 }}>To upgrade or change your plan, contact us and we'll get you set up.</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button className="oc-btn oc-btn--ghost" onClick={() => setUpgradeShown(false)}>Maybe later</button>
              <a href="mailto:support@openclick.dev" className="oc-btn oc-btn--primary" style={{ textDecoration: 'none' }} onClick={() => setUpgradeShown(false)}>Contact us</a>
            </div>
          </div>
        </div>
      )}
      {manageShown && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(5,5,10,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setManageShown(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 32, width: 420, animation: 'oc-scale-in 200ms var(--ease-out)' }}>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 700, color: 'var(--fg)', marginBottom: 16 }}>Manage subscription</div>
            {[{ label: 'Plan', val: `${plan} · $${pricePerSeat}/seat/mo` }, { label: 'Billing cycle', val: billingCycle }, { label: 'Next renewal', val: renewal }, { label: 'Payment method', val: paymentStr }].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-13)' }}>
                <span style={{ color: 'var(--fg-muted)' }}>{r.label}</span>
                <span style={{ color: 'var(--fg)', fontWeight: 500 }}>{r.val}</span>
              </div>
            ))}
            <div style={{ marginTop: 16, padding: 12, background: 'var(--bg-surface)', borderRadius: 'var(--r-md)', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-12)', color: 'var(--fg-muted)' }}>
              To cancel or modify your subscription, email <a href="mailto:support@openclick.dev" style={{ color: 'var(--accent)' }}>support@openclick.dev</a>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="oc-btn oc-btn--secondary" onClick={() => setManageShown(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
      <Section title="Current plan">
        <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg, var(--brand-600), var(--brand-800))', borderRadius: 'var(--r-xl)', color: '#fff', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', opacity: 0.7, marginBottom: 4 }}>CURRENT PLAN</div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 24, fontWeight: 700 }}>{plan}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 24, fontWeight: 700 }}>${pricePerSeat}</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>per seat / month</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            {[[String(seats), 'seats'], [`${storage} GB`, 'storage'], ['Unlimited', 'projects']].map(([val, lbl]) => (
              <div key={lbl}>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 700 }}>{val}</div>
                <div style={{ fontSize: 11, opacity: 0.7 }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="oc-btn oc-btn--primary" onClick={() => setUpgradeShown(true)}><Icon name="zap" size={13} /> Upgrade to Business</button>
          <button className="oc-btn oc-btn--ghost" onClick={() => setManageShown(true)}>Manage subscription</button>
        </div>
      </Section>

      <Section title="Usage">
        {[
          { label: 'Seats', used: seats, total: sub?.seatsLimit ?? seats },
          { label: 'Storage', used: usedStorage, total: storage, unit: 'GB' },
          { label: 'API calls', used: apiCalls, total: apiLimit, unit: '' },
        ].map(({ label, used, total, unit = '' }) => (
          <div key={label} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-12)', color: 'var(--fg-muted)', marginBottom: 6 }}>
              <span>{label}</span>
              <span>{used}{unit} / {total}{unit}</span>
            </div>
            <div style={{ height: 6, background: 'var(--bg-card)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ width: `${(used / total) * 100}%`, height: '100%', background: used >= total ? 'var(--s-blocked-500)' : 'var(--accent)', borderRadius: 999, transition: 'width 300ms' }} />
            </div>
          </div>
        ))}
      </Section>

      <Section title="Billing history" last>
        {invoices.length === 0 ? (
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-13)', color: 'var(--fg-subtle)', padding: '12px 0' }}>No invoices yet</div>
        ) : invoices.map((inv, i) => (
          <div key={inv.id ?? i} style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: i < invoices.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-13)', color: 'var(--fg)' }}>{inv.desc ?? inv.description}</div>
              <div style={{ fontSize: 11, color: 'var(--fg-subtle)', fontFamily: 'var(--font-sans)' }}>{inv.date ?? inv.paidAt}</div>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-13)', color: 'var(--fg)', marginRight: 12 }}>{inv.amount ?? inv.total}</span>
            {inv.url && (
              <a href={inv.url} target="_blank" rel="noreferrer" className="oc-btn oc-btn--ghost oc-btn--icon" title="Download invoice"><Icon name="download" size={13} /></a>
            )}
          </div>
        ))}
      </Section>
    </>
  );
}

// ─── Danger zone section ──────────────────────────────────────────────────────
function DangerSection({ onClose }) {
  const { state } = useApp();
  const workspaceId = state.workspaceId;
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [leaving, setLeaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleLeave() {
    if (!workspaceId) return;
    setLeaving(true);
    try {
      await membersApi.leaveWorkspace(workspaceId);
      onClose();
    } catch (err) {
      console.error('Failed to leave workspace:', err);
    } finally {
      setLeaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteInput !== 'delete my account') return;
    setDeleting(true);
    try {
      await usersApi.deleteAccount();
      onClose();
    } catch (err) {
      console.error('Failed to delete account:', err);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Section title="Danger zone" last>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Leave workspace */}
        <div style={{ padding: '16px 18px', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: confirmLeave ? 12 : 0 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-13)', fontWeight: 600, color: 'var(--fg)' }}>Leave workspace</div>
              <div style={{ fontSize: 11, color: 'var(--fg-subtle)', fontFamily: 'var(--font-sans)', marginTop: 2 }}>You'll lose access to all projects and tasks</div>
            </div>
            {!confirmLeave && (
              <button className="oc-btn oc-btn--ghost" style={{ color: 'var(--s-blocked-500)', borderColor: 'var(--s-blocked-500)' }} onClick={() => setConfirmLeave(true)}>
                Leave workspace
              </button>
            )}
          </div>
          {confirmLeave && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
              <span style={{ flex: 1, fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg-muted)' }}>Are you sure? This action cannot be undone.</span>
              <button className="oc-btn oc-btn--ghost" onClick={() => setConfirmLeave(false)}>Cancel</button>
              <button className="oc-btn" style={{ background: 'var(--s-blocked-500)', color: '#fff', border: 'none', opacity: leaving ? 0.6 : 1 }} disabled={leaving} onClick={handleLeave}>{leaving ? 'Leaving…' : 'Confirm leave'}</button>
            </div>
          )}
        </div>

        {/* Delete account */}
        <div style={{ padding: '16px 18px', border: '1px solid #7f1d1d55', borderRadius: 'var(--r-lg)', background: '#7f1d1d0a' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: confirmDelete ? 12 : 0 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-13)', fontWeight: 600, color: 'var(--s-blocked-500)' }}>Delete account</div>
              <div style={{ fontSize: 11, color: 'var(--fg-subtle)', fontFamily: 'var(--font-sans)', marginTop: 2 }}>Permanently delete your account and all data. Cannot be undone.</div>
            </div>
            {!confirmDelete && (
              <button className="oc-btn" style={{ background: 'var(--s-blocked-500)', color: '#fff', border: 'none' }} onClick={() => setConfirmDelete(true)}>
                Delete account
              </button>
            )}
          </div>
          {confirmDelete && (
            <div style={{ paddingTop: 12, borderTop: '1px solid #7f1d1d44' }}>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg-muted)', marginBottom: 8 }}>
                Type <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--fg)' }}>delete my account</strong> to confirm
              </div>
              <Input value={deleteInput} onChange={setDeleteInput} placeholder="delete my account" />
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button className="oc-btn oc-btn--ghost" onClick={() => { setConfirmDelete(false); setDeleteInput(''); }}>Cancel</button>
                <button
                  className="oc-btn"
                  style={{ background: deleteInput === 'delete my account' ? 'var(--s-blocked-500)' : 'var(--bg-card)', color: deleteInput === 'delete my account' ? '#fff' : 'var(--fg-muted)', border: 'none', cursor: deleteInput === 'delete my account' ? 'pointer' : 'not-allowed', opacity: deleting ? 0.6 : 1 }}
                  disabled={deleteInput !== 'delete my account' || deleting}
                  onClick={handleDeleteAccount}
                >
                  {deleting ? 'Deleting…' : 'Permanently delete'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export function SettingsView({ tweaks, setKey }) {
  const { state, dispatch } = useApp();
  const section = state.ui.settingsSection ?? 'profile';
  const setSection = s => dispatch({ type: A.SET_UI, payload: { settingsSection: s } });
  const close = () => dispatch({ type: A.SET_UI, payload: { settingsOpen: false } });

  const SECTION_TITLES = {
    profile: 'Profile',
    security: 'Security',
    notifications: 'Notifications',
    workspace: 'Workspace',
    appearance: 'Appearance',
    integrations: 'Integrations',
    billing: 'Billing',
    danger: 'Danger zone',
  };

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(5,5,10,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'oc-fade-in 200ms var(--ease-out)',
      }}
      onClick={close}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '88vw', maxWidth: 940, height: '82vh',
          background: 'var(--bg)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-xl)', boxShadow: 'var(--shadow-lg)',
          display: 'flex', overflow: 'hidden',
          animation: 'oc-scale-in 200ms var(--ease-out)',
        }}
      >
        {/* Left nav */}
        <nav style={{
          width: 220, flexShrink: 0,
          background: 'var(--bg-surface)', borderRight: '1px solid var(--border-subtle)',
          display: 'flex', flexDirection: 'column', padding: '16px 10px',
          overflowY: 'auto',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px 16px', borderBottom: '1px solid var(--border-subtle)', marginBottom: 8 }}>
            <Icon name="settings" size={16} style={{ color: 'var(--accent)' }} />
            <span className="t-h3">Settings</span>
          </div>
          {NAV.map(grp => (
            <div key={grp.group} style={{ marginBottom: 6 }}>
              <div className="t-label" style={{ padding: '6px 8px 4px', fontSize: 10 }}>{grp.group}</div>
              {grp.items.map(item => {
                const active = section === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSection(item.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      width: '100%', height: 32, padding: '0 8px',
                      borderRadius: 'var(--r-md)', border: 'none',
                      background: active ? 'var(--bg-selected)' : 'transparent',
                      color: active ? 'var(--accent-text)' : 'var(--fg-muted)',
                      fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-13)',
                      fontWeight: active ? 600 : 400, cursor: 'pointer', textAlign: 'left',
                    }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <Icon name={item.icon} size={14} strokeWidth={active ? 2.2 : 1.75}
                      style={{ color: item.id === 'danger' ? 'var(--s-blocked-500)' : undefined }} />
                    <span style={{ color: item.id === 'danger' && !active ? 'var(--s-blocked-500)' : undefined }}>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Right content */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{
            height: 52, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 28px', borderBottom: '1px solid var(--border-subtle)',
          }}>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-16)', fontWeight: 600, color: 'var(--fg)' }}>
              {SECTION_TITLES[section]}
            </h2>
            <button className="oc-btn oc-btn--ghost oc-btn--icon" onClick={close} title="Close (Esc)">
              <Icon name="x" size={16} />
            </button>
          </div>

          {/* Scrollable body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
            {section === 'profile'       && <ProfileSection />}
            {section === 'security'      && <SecuritySection />}
            {section === 'notifications' && <NotificationsSection />}
            {section === 'workspace'     && <WorkspaceSection />}
            {section === 'appearance'    && <AppearanceSection tweaks={tweaks} setKey={setKey} />}
            {section === 'integrations'  && <IntegrationsSection />}
            {section === 'billing'       && <BillingSection />}
            {section === 'danger'        && <DangerSection onClose={close} />}
          </div>
        </div>
      </div>
    </div>
  );
}
