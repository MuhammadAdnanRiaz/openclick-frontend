import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Icon } from '../components/primitives.jsx';

const ToastContext = createContext(null);

const ICONS = { success: 'check-circle', error: 'alert-circle', info: 'info' };
const COLORS = {
  success: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', text: '#10B981' },
  error:   { bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.25)',  text: '#EF4444' },
  info:    { bg: 'rgba(91,91,255,0.12)',  border: 'rgba(91,91,255,0.25)',  text: '#7878FF' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current[id]);
    setToasts(ts => ts.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now().toString();
    setToasts(ts => [...ts.slice(-4), { id, message, type }]);
    timers.current[id] = setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={{
        position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
        zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8,
        alignItems: 'center', pointerEvents: 'none',
      }}>
        {toasts.map(t => {
          const c = COLORS[t.type] ?? COLORS.info;
          return (
            <div
              key={t.id}
              onClick={() => dismiss(t.id)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '9px 14px', borderRadius: 'var(--r-lg)',
                background: 'var(--bg-elevated)', border: `1px solid ${c.border}`,
                boxShadow: 'var(--shadow-lg)',
                fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-13)', color: 'var(--fg)',
                whiteSpace: 'nowrap', pointerEvents: 'auto', cursor: 'pointer',
                animation: 'oc-scale-in 160ms var(--ease-out)',
              }}
            >
              <Icon name={ICONS[t.type]} size={14} style={{ color: c.text, flexShrink: 0 }} />
              {t.message}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
