import * as LucideIcons from 'lucide-react';
import { AVATAR_COLORS, STATUSES } from '../data.js';

function toPascalCase(name) {
  return name.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join('');
}

export function Icon({ name, size = 16, strokeWidth = 2, style = {}, className = '' }) {
  const iconName = toPascalCase(name);
  const LucideIcon = LucideIcons[iconName];
  if (!LucideIcon) return <span style={{ width: size, height: size, display: 'inline-flex', flexShrink: 0 }} />;
  return (
    <LucideIcon
      size={size}
      strokeWidth={strokeWidth}
      style={{ color: 'currentColor', flexShrink: 0, ...style }}
      className={className}
    />
  );
}

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function Avatar({ name, size = 22, className = '' }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const color = AVATAR_COLORS[hashStr(name) % AVATAR_COLORS.length];
  const sizeClass = size >= 28 ? 'oc-avatar--lg' : size <= 18 ? 'oc-avatar--sm' : '';
  return (
    <span
      className={`oc-avatar ${sizeClass} ${className}`}
      style={{ background: color, width: size, height: size, fontSize: Math.round(size * 0.42) }}
      title={name}
    >
      {initials}
    </span>
  );
}

export function AvatarStack({ names, max = 3, size = 22 }) {
  const shown = names.slice(0, max);
  const extra = names.length - shown.length;
  return (
    <span className="oc-avatar-stack">
      {shown.map(n => <Avatar key={n} name={n} size={size} />)}
      {extra > 0 && (
        <span className="oc-avatar" style={{
          width: size, height: size, fontSize: Math.round(size * 0.42),
          background: 'var(--bg-elevated)', color: 'var(--fg-muted)',
          border: '1px solid var(--border)',
        }}>+{extra}</span>
      )}
    </span>
  );
}

export function StatusChip({ status }) {
  const s = STATUSES[status] || STATUSES.open;
  return (
    <span className={`oc-chip ${s.cls}`}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: s.dot }} />
      {s.label}
    </span>
  );
}

export function Priority({ level }) {
  return <span className={`oc-pri oc-pri--${level}`} title={level} />;
}

export function BranchPill({ name }) {
  return (
    <span className="oc-branch">
      <Icon name="git-branch" size={11} strokeWidth={2.2} />
      {name}
    </span>
  );
}

export function PRPill({ id, state = 'open' }) {
  const icon = state === 'merged' ? 'git-merge' : state === 'draft' ? 'git-pull-request-draft' : 'git-pull-request';
  return (
    <span className={`oc-pr oc-pr--${state}`}>
      <Icon name={icon} size={11} strokeWidth={2.2} />
      #{id}
    </span>
  );
}
