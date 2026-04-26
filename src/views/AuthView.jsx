import { useState } from 'react';
import { Icon } from '../components/primitives.jsx';
import * as authApi from '../api/auth.js';

// ─── Responsive + spinner animation ──────────────────────────────────────────
const GLOBAL_STYLES = `
  @keyframes oc-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes oc-auth-in {
    from { opacity: 0; transform: scale(0.97) translateY(8px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  .auth-brand { display: flex; flex-direction: column; }
  @media (max-width: 768px) { .auth-brand { display: none !important; } }
`;

// ─── Validators ───────────────────────────────────────────────────────────────
const V = {
  name:     v => !v.trim() ? 'Name is required' : v.trim().length < 2 ? 'Must be at least 2 characters' : '',
  email:    v => !v.trim() ? 'Email is required' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? 'Enter a valid email address' : '',
  password: v => !v ? 'Password is required' : v.length < 8 ? 'Password must be at least 8 characters' : '',
};

// ─── Field hook ───────────────────────────────────────────────────────────────
function useField(validator) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  function check(val) {
    const err = validator ? validator(val) : '';
    setError(err);
    return !err;
  }

  return {
    value, error,
    onChange: e => { setValue(e.target.value); if (touched) check(e.target.value); },
    onBlur:   ()  => { setTouched(true); check(value); },
    validate: ()  => { setTouched(true); return check(value); },
  };
}

// ─── Shared form primitives ───────────────────────────────────────────────────

function AuthInput({ label, id, required, error, type = 'text', onBlur: onBlurProp, ...rest }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label htmlFor={id} style={{ fontSize: 'var(--fs-13)', fontWeight: 500, color: 'var(--fg)' }}>
        {label}
        {required && <span aria-hidden="true" style={{ color: 'var(--s-blocked-500)', marginLeft: 2 }}>*</span>}
      </label>
      <input
        id={id}
        type={type}
        style={{
          height: 40, padding: '0 12px', width: '100%', boxSizing: 'border-box',
          background: 'var(--bg-card)',
          border: `1px solid ${error ? 'var(--s-blocked-500)' : focused ? 'var(--brand-500)' : 'var(--border)'}`,
          borderRadius: 'var(--r-lg)',
          color: 'var(--fg)', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-14)',
          outline: 'none',
          boxShadow: focused ? '0 0 0 3px rgba(91, 91, 255, 0.16)' : 'none',
          transition: 'border-color var(--dur-fast), box-shadow var(--dur-fast)',
        }}
        onFocus={() => setFocused(true)}
        onBlur={e => { setFocused(false); onBlurProp?.(e); }}
        {...rest}
      />
      {error && (
        <span role="alert" style={{ fontSize: 'var(--fs-12)', color: 'var(--s-blocked-500)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon name="alert-circle" size={11} /> {error}
        </span>
      )}
    </div>
  );
}

function PasswordInput({ label, id, required, error, value, onChange, onBlur: onBlurProp, autoComplete = 'current-password' }) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label htmlFor={id} style={{ fontSize: 'var(--fs-13)', fontWeight: 500, color: 'var(--fg)' }}>
        {label}
        {required && <span aria-hidden="true" style={{ color: 'var(--s-blocked-500)', marginLeft: 2 }}>*</span>}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          style={{
            height: 40, padding: '0 42px 0 12px', width: '100%', boxSizing: 'border-box',
            background: 'var(--bg-card)',
            border: `1px solid ${error ? 'var(--s-blocked-500)' : focused ? 'var(--brand-500)' : 'var(--border)'}`,
            borderRadius: 'var(--r-lg)',
            color: 'var(--fg)', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-14)',
            outline: 'none',
            boxShadow: focused ? '0 0 0 3px rgba(91, 91, 255, 0.16)' : 'none',
            transition: 'border-color var(--dur-fast), box-shadow var(--dur-fast)',
          }}
          onFocus={() => setFocused(true)}
          onBlur={e => { setFocused(false); onBlurProp?.(e); }}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow(s => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
          style={{
            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--fg-subtle)', display: 'flex', alignItems: 'center', padding: 4,
          }}
        >
          <Icon name={show ? 'eye-off' : 'eye'} size={15} />
        </button>
      </div>
      {error && (
        <span role="alert" style={{ fontSize: 'var(--fs-12)', color: 'var(--s-blocked-500)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon name="alert-circle" size={11} /> {error}
        </span>
      )}
    </div>
  );
}

function OAuthButton({ provider, icon, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        background: hovered ? 'var(--bg-hover)' : 'var(--bg-card)',
        border: `1px solid ${hovered ? 'var(--border-strong)' : 'var(--border)'}`,
        borderRadius: 'var(--r-lg)', color: 'var(--fg)',
        fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-13)', fontWeight: 500,
        cursor: 'pointer', transition: 'background var(--dur-fast), border-color var(--dur-fast)',
      }}
    >
      {icon}
      {provider}
    </button>
  );
}

function AuthDivider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0' }}>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      <span style={{ fontSize: 'var(--fs-12)', color: 'var(--fg-subtle)', whiteSpace: 'nowrap' }}>or continue with</span>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  );
}

function Spinner() {
  return (
    <span style={{
      display: 'inline-block', width: 14, height: 14, flexShrink: 0,
      border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
      borderRadius: '50%', animation: 'oc-spin 0.65s linear infinite',
    }} />
  );
}

function FormLogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 32 }}>
      <span className="oc-logo" style={{ width: 28, height: 28, fontSize: 'var(--fs-13)' }}>OC</span>
      <span style={{ fontSize: 'var(--fs-15)', fontWeight: 700, letterSpacing: '-0.02em' }}>OpenClick</span>
    </div>
  );
}

// ─── OAuth brand icons ────────────────────────────────────────────────────────
function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}


// ─── Brand panel ──────────────────────────────────────────────────────────────

function MiniBoard() {
  const cols = [
    { label: 'Open',        dot: 'var(--s-open-500)',     tasks: ['Auth p99 latency', 'Webhook HMAC'] },
    { label: 'In Progress', dot: 'var(--s-progress-500)', tasks: ['Scheduler core'] },
    { label: 'In Review',   dot: 'var(--s-review-500)',   tasks: ['Retry policy'] },
  ];
  return (
    <div style={{
      borderRadius: 'var(--r-xl)', border: '1px solid var(--border)',
      overflow: 'hidden', boxShadow: 'var(--shadow-lg)', background: 'var(--bg)',
    }}>
      {/* fake window chrome */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 5, padding: '8px 12px',
        borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)',
      }}>
        {['#EF4444','#F59E0B','#10B981'].map(c => (
          <div key={c} style={{ width: 7, height: 7, borderRadius: 999, background: c }} />
        ))}
        <span style={{ fontSize: 10, color: 'var(--fg-subtle)', marginLeft: 8, fontFamily: 'var(--font-mono)' }}>
          Runtime · v0.8
        </span>
        <div style={{ flex: 1 }} />
        <div style={{ width: 48, height: 6, borderRadius: 3, background: 'var(--border)' }} />
      </div>
      {/* mini kanban */}
      <div style={{ display: 'flex', gap: 8, padding: 10 }}>
        {cols.map(col => (
          <div key={col.label} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 6px' }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: col.dot, flexShrink: 0 }} />
              <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--fg-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {col.label}
              </span>
            </div>
            {col.tasks.map(t => (
              <div key={t} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--r-md)', padding: '6px 8px',
              }}>
                <div style={{ fontSize: 10, color: 'var(--fg)', fontWeight: 500, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 999, background: 'var(--brand-500)', opacity: 0.7 }} />
                  <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--bg-elevated)' }}>
                    <div style={{ width: `${Math.random() > 0.5 ? 65 : 30}%`, height: '100%', borderRadius: 2, background: col.dot, opacity: 0.6 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const FEATURES = [
  { icon: 'kanban',      text: 'Board, List, Calendar & Timeline views' },
  { icon: 'git-branch',  text: 'Git-native: branches, PRs, commits' },
  { icon: 'zap',         text: 'Command palette with keyboard-first UX' },
  { icon: 'users',       text: 'Real-time collaboration for your team' },
];

function BrandPanel() {
  return (
    <div
      className="auth-brand"
      style={{
        width: 480, flexShrink: 0,
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        padding: '44px 48px',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Subtle grid */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
        opacity: 0.5,
      }} />
      {/* Accent glow */}
      <div style={{
        position: 'absolute', top: -120, left: -80, width: 400, height: 400,
        borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(91,91,255,0.08) 0%, transparent 70%)',
      }} />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 52 }}>
          <span className="oc-logo" style={{ width: 30, height: 30, fontSize: 'var(--fs-14)' }}>OC</span>
          <span style={{ fontSize: 'var(--fs-16)', fontWeight: 700, letterSpacing: '-0.02em' }}>OpenClick</span>
        </div>

        {/* Hero copy */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{
            margin: 0, fontSize: 'var(--fs-28)', fontWeight: 700,
            letterSpacing: '-0.025em', lineHeight: 1.15, color: 'var(--fg)',
          }}>
            Ship your backlog,<br />not your velocity.
          </h2>
          <p style={{ margin: '12px 0 0', fontSize: 'var(--fs-14)', color: 'var(--fg-muted)', lineHeight: 1.65 }}>
            Git-native project management built for engineering teams that move fast.
          </p>
        </div>

        {/* Mini board preview */}
        <MiniBoard />

        {/* Feature list */}
        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 11 }}>
          {FEATURES.map(f => (
            <div key={f.icon} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <span style={{
                width: 26, height: 26, borderRadius: 'var(--r-md)', flexShrink: 0,
                background: 'var(--accent-subtle)', border: '1px solid rgba(91, 91, 255, 0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name={f.icon} size={13} style={{ color: 'var(--accent-text)' }} />
              </span>
              <span style={{ fontSize: 'var(--fs-13)', color: 'var(--fg-muted)' }}>{f.text}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 'auto', paddingTop: 28, borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ display: 'flex', gap: -4 }}>
            {['Maya Chen','Dev Patel','Rae Wong','Priya Kapoor'].map((n, i) => (
              <div key={n} style={{
                width: 22, height: 22, borderRadius: 999,
                border: '2px solid var(--bg-surface)',
                background: ['#5B5BFF','#10B981','#F59E0B','#8B5CF6'][i],
                marginLeft: i > 0 ? -6 : 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 8, fontWeight: 700, color: '#fff',
              }}>
                {n[0]}
              </div>
            ))}
          </div>
          <span style={{ fontSize: 'var(--fs-12)', color: 'var(--fg-subtle)' }}>
            Trusted by <strong style={{ color: 'var(--fg)' }}>2,400+</strong> engineering teams
          </span>
        </div>
      </div>
    </div>
  );
}

function GitLabIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 01-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 014.82 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.49h8.1l2.44-7.51a.42.42 0 01.11-.18.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.51 1.22 3.78a.84.84 0 01-.3.94z"/>
    </svg>
  );
}

// ─── OAuth redirects ──────────────────────────────────────────────────────────
function redirectToGitHub() {
  const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
  if (!clientId) { alert('GitHub OAuth is not configured.'); return; }
  window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=user:email&state=auth`;
}

function redirectToGitLab() {
  const clientId = import.meta.env.VITE_GITLAB_CLIENT_ID;
  if (!clientId) { alert('GitLab OAuth is not configured.'); return; }
  const backendUrl = import.meta.env.VITE_API_BASE_URL;
  const redirectUri = encodeURIComponent(`${backendUrl}/auth/gitlab/callback`);
  window.location.href = `https://gitlab.com/oauth/authorize?client_id=${clientId}&response_type=code&scope=read_user&redirect_uri=${redirectUri}`;
}

// ─── Login screen ─────────────────────────────────────────────────────────────

function LoginForm({ onAuth, onForgot, onSignup }) {
  const email    = useField(V.email);
  const password = useField(V.password);
  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const a = email.validate();
    const b = password.validate();
    if (!a || !b) return;
    setLoading(true);
    setApiError('');
    try {
      const data = await authApi.login({ email: email.value.trim(), password: password.value });
      onAuth(data);
    } catch (err) {
      setApiError(err.message || 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: 400, animation: 'oc-auth-in 220ms var(--ease-out)' }}>
      <FormLogo />
      <h1 style={{ margin: '0 0 4px', fontSize: 'var(--fs-24)', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--fg)' }}>
        Welcome back
      </h1>
      <p style={{ margin: '0 0 24px', fontSize: 'var(--fs-14)', color: 'var(--fg-muted)' }}>
        Sign in to your workspace
      </p>

      <div style={{ display: 'flex', gap: 8 }}>
        <OAuthButton provider="GitHub" icon={<GitHubIcon />} onClick={redirectToGitHub} />
        <OAuthButton provider="GitLab" icon={<GitLabIcon />} onClick={redirectToGitLab} />
      </div>

      <AuthDivider />

      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <AuthInput
          label="Email" id="login-email" type="email"
          autoComplete="email" required
          placeholder="you@company.com"
          value={email.value} onChange={email.onChange} onBlur={email.onBlur} error={email.error}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <PasswordInput
            label="Password" id="login-password" required
            value={password.value} onChange={password.onChange} onBlur={password.onBlur} error={password.error}
            autoComplete="current-password"
          />
          <button
            type="button" onClick={onForgot}
            style={{
              alignSelf: 'flex-end', background: 'none', border: 'none',
              color: 'var(--accent-text)', fontSize: 'var(--fs-12)', fontFamily: 'var(--font-sans)',
              cursor: 'pointer', padding: 0,
            }}
          >
            Forgot password?
          </button>
        </div>

        {apiError && (
          <div role="alert" style={{ padding: '10px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--r-md)', fontSize: 'var(--fs-13)', color: 'var(--s-blocked-500)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="alert-circle" size={13} /> {apiError}
          </div>
        )}
        <button
          type="submit" disabled={loading}
          className="oc-btn oc-btn--primary"
          style={{ height: 40, fontSize: 'var(--fs-14)', fontWeight: 600, width: '100%', marginTop: 4, opacity: loading ? 0.8 : 1 }}
        >
          {loading ? <><Spinner /> Signing in…</> : 'Sign in'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: 20, fontSize: 'var(--fs-13)', color: 'var(--fg-muted)', margin: '20px 0 0' }}>
        Don&rsquo;t have an account?{' '}
        <LinkBtn onClick={onSignup}>Create one</LinkBtn>
      </p>
    </div>
  );
}

// ─── Signup screen ────────────────────────────────────────────────────────────

function SignupForm({ onAuth, onLogin }) {
  const name     = useField(V.name);
  const email    = useField(V.email);
  const password = useField(V.password);
  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const a = name.validate();
    const b = email.validate();
    const c = password.validate();
    if (!a || !b || !c) return;
    setLoading(true);
    setApiError('');
    try {
      const data = await authApi.signup({
        name: name.value.trim(),
        email: email.value.trim(),
        password: password.value,
      });
      onAuth(data);
    } catch (err) {
      setApiError(err.message || 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: 400, animation: 'oc-auth-in 220ms var(--ease-out)' }}>
      <FormLogo />
      <h1 style={{ margin: '0 0 4px', fontSize: 'var(--fs-24)', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--fg)' }}>
        Create your account
      </h1>
      <p style={{ margin: '0 0 24px', fontSize: 'var(--fs-14)', color: 'var(--fg-muted)' }}>
        Start managing projects the git-native way.
      </p>

      <div style={{ display: 'flex', gap: 8 }}>
        <OAuthButton provider="GitHub" icon={<GitHubIcon />} onClick={redirectToGitHub} />
        <OAuthButton provider="GitLab" icon={<GitLabIcon />} onClick={redirectToGitLab} />
      </div>

      <AuthDivider />

      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <AuthInput
          label="Full name" id="signup-name" required
          autoComplete="name" placeholder="Maya Chen"
          value={name.value} onChange={name.onChange} onBlur={name.onBlur} error={name.error}
        />
        <AuthInput
          label="Work email" id="signup-email" type="email" required
          autoComplete="email" placeholder="you@company.com"
          value={email.value} onChange={email.onChange} onBlur={email.onBlur} error={email.error}
        />
        <PasswordInput
          label="Password" id="signup-password" required
          value={password.value} onChange={password.onChange} onBlur={password.onBlur} error={password.error}
          autoComplete="new-password"
        />
        {password.value && !password.error && (
          <PasswordStrength value={password.value} />
        )}

        <p style={{ fontSize: 'var(--fs-12)', color: 'var(--fg-subtle)', margin: 0, lineHeight: 1.6 }}>
          By creating an account you agree to our{' '}
          <a href="#" style={{ color: 'var(--accent-text)' }}>Terms of Service</a>{' '}
          and{' '}
          <a href="#" style={{ color: 'var(--accent-text)' }}>Privacy Policy</a>.
        </p>

        {apiError && (
          <div role="alert" style={{ padding: '10px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--r-md)', fontSize: 'var(--fs-13)', color: 'var(--s-blocked-500)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="alert-circle" size={13} /> {apiError}
          </div>
        )}
        <button
          type="submit" disabled={loading}
          className="oc-btn oc-btn--primary"
          style={{ height: 40, fontSize: 'var(--fs-14)', fontWeight: 600, width: '100%', marginTop: 2, opacity: loading ? 0.8 : 1 }}
        >
          {loading ? <><Spinner /> Creating account…</> : 'Create account'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: 20, fontSize: 'var(--fs-13)', color: 'var(--fg-muted)', margin: '20px 0 0' }}>
        Already have an account?{' '}
        <LinkBtn onClick={onLogin}>Sign in</LinkBtn>
      </p>
    </div>
  );
}

// ─── Forgot password screen ───────────────────────────────────────────────────

function ForgotForm({ onSent, onLogin }) {
  const email = useField(V.email);
  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.validate()) return;
    setLoading(true);
    setApiError('');
    try {
      await authApi.forgotPassword({ email: email.value.trim() });
      onSent(email.value.trim());
    } catch (err) {
      setApiError(err.message || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: 400, animation: 'oc-auth-in 220ms var(--ease-out)' }}>
      <FormLogo />
      <button
        type="button" onClick={onLogin}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 24,
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--fg-muted)', fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-13)', padding: 0,
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--fg)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--fg-muted)'}
      >
        <Icon name="arrow-left" size={14} /> Back to sign in
      </button>

      <div style={{
        width: 44, height: 44, borderRadius: 'var(--r-xl)', marginBottom: 20,
        background: 'var(--accent-subtle)', border: '1px solid rgba(91, 91, 255, 0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name="key-round" size={20} style={{ color: 'var(--accent-text)' }} />
      </div>

      <h1 style={{ margin: '0 0 4px', fontSize: 'var(--fs-24)', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--fg)' }}>
        Reset your password
      </h1>
      <p style={{ margin: '0 0 24px', fontSize: 'var(--fs-14)', color: 'var(--fg-muted)', lineHeight: 1.6 }}>
        Enter your email and we&rsquo;ll send you a link to reset your password.
      </p>

      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <AuthInput
          label="Email" id="forgot-email" type="email" required
          autoComplete="email" placeholder="you@company.com"
          value={email.value} onChange={email.onChange} onBlur={email.onBlur} error={email.error}
        />
        {apiError && (
          <div role="alert" style={{ padding: '10px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--r-md)', fontSize: 'var(--fs-13)', color: 'var(--s-blocked-500)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="alert-circle" size={13} /> {apiError}
          </div>
        )}
        <button
          type="submit" disabled={loading}
          className="oc-btn oc-btn--primary"
          style={{ height: 40, fontSize: 'var(--fs-14)', fontWeight: 600, width: '100%', marginTop: 4, opacity: loading ? 0.8 : 1 }}
        >
          {loading ? <><Spinner /> Sending…</> : 'Send reset link'}
        </button>
      </form>
    </div>
  );
}

function ForgotSent({ sentTo, onLogin }) {
  return (
    <div style={{ width: '100%', maxWidth: 400, animation: 'oc-auth-in 220ms var(--ease-out)', textAlign: 'center' }}>
      <FormLogo />
      <div style={{
        width: 56, height: 56, borderRadius: 'var(--r-xl)', margin: '0 auto 20px',
        background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name="mail-check" size={24} style={{ color: 'var(--s-merged-500)' }} />
      </div>

      <h1 style={{ margin: '0 0 8px', fontSize: 'var(--fs-24)', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--fg)' }}>
        Check your email
      </h1>
      <p style={{ margin: '0 0 6px', fontSize: 'var(--fs-14)', color: 'var(--fg-muted)', lineHeight: 1.6 }}>
        We sent a reset link to
      </p>
      <p style={{ margin: '0 0 28px', fontSize: 'var(--fs-14)', fontWeight: 600, color: 'var(--fg)' }}>
        {sentTo}
      </p>

      <div style={{
        padding: '12px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)', fontSize: 'var(--fs-13)', color: 'var(--fg-muted)',
        marginBottom: 24, lineHeight: 1.6, textAlign: 'left',
      }}>
        <Icon name="info" size={13} style={{ color: 'var(--fg-subtle)', verticalAlign: -2, marginRight: 6 }} />
        Check your spam folder if you don&rsquo;t see it within a few minutes.
      </div>

      <button
        type="button" onClick={onLogin}
        className="oc-btn oc-btn--secondary"
        style={{ height: 40, fontSize: 'var(--fs-14)', width: '100%' }}
      >
        <Icon name="arrow-left" size={14} /> Back to sign in
      </button>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function LinkBtn({ onClick, children }) {
  return (
    <button
      type="button" onClick={onClick}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--accent-text)', fontFamily: 'var(--font-sans)',
        fontSize: 'inherit', padding: 0, fontWeight: 500,
      }}
    >
      {children}
    </button>
  );
}

function PasswordStrength({ value }) {
  const score = [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(r => r.test(value)).length;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', 'var(--s-blocked-500)', 'var(--p-high)', 'var(--s-open-500)', 'var(--s-merged-500)'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{ display: 'flex', gap: 3 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i <= score ? colors[score] : 'var(--border)',
            transition: 'background 0.2s',
          }} />
        ))}
      </div>
      <span style={{ fontSize: 'var(--fs-11)', color: colors[score] || 'var(--fg-subtle)' }}>
        {labels[score] || ''}
      </span>
    </div>
  );
}

// ─── Root AuthView ────────────────────────────────────────────────────────────

export function AuthView({ onAuth }) {
  const [screen, setScreen] = useState('login');
  const [sentTo, setSentTo] = useState('');

  function handleSent(email) {
    setSentTo(email);
    setScreen('sent');
  }

  return (
    <>
      <style>{GLOBAL_STYLES}</style>
      <div style={{
        width: '100vw', height: '100dvh', display: 'flex',
        background: 'var(--bg)', animation: 'oc-fade-in 280ms var(--ease-out)',
      }}>
        <BrandPanel />

        {/* Form panel */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '40px 24px', overflow: 'auto',
        }}>
          {screen === 'login'  && <LoginForm  onAuth={onAuth} onForgot={() => setScreen('forgot')} onSignup={() => setScreen('signup')} />}
          {screen === 'signup' && <SignupForm  onAuth={onAuth} onLogin={() => setScreen('login')} />}
          {screen === 'forgot' && <ForgotForm  onSent={handleSent} onLogin={() => setScreen('login')} />}
          {screen === 'sent'   && <ForgotSent  sentTo={sentTo} onLogin={() => setScreen('login')} />}
        </div>
      </div>
    </>
  );
}
