import { createContext, useContext, useCallback, useState, useRef, useEffect } from "react";

// ─── Design Tokens ────────────────────────────────────────────
const TYPES = {
  success: {
    icon: "✓",
    accent: "#00ff87",
    bg: "linear-gradient(135deg, #001a0d 0%, #002b14 100%)",
    border: "#00ff8740",
    glow: "0 0 40px #00ff8725, 0 20px 60px rgba(0,0,0,0.85)",
    iconBg: "#00ff8712",
    label: "Амжилттай",
  },
  error: {
    icon: "✕",
    accent: "#ff3b3b",
    bg: "linear-gradient(135deg, #1a0000 0%, #2b0606 100%)",
    border: "#ff3b3b40",
    glow: "0 0 40px #ff3b3b25, 0 20px 60px rgba(0,0,0,0.85)",
    iconBg: "#ff3b3b12",
    label: "Алдаа",
  },
  warning: {
    icon: "!",
    accent: "#ffb800",
    bg: "linear-gradient(135deg, #1a1000 0%, #2b1c00 100%)",
    border: "#ffb80040",
    glow: "0 0 40px #ffb80025, 0 20px 60px rgba(0,0,0,0.85)",
    iconBg: "#ffb80012",
    label: "Анхааруулга",
  },
  info: {
    icon: "i",
    accent: "#00c8ff",
    bg: "linear-gradient(135deg, #00101a 0%, #001a2b 100%)",
    border: "#00c8ff40",
    glow: "0 0 40px #00c8ff25, 0 20px 60px rgba(0,0,0,0.85)",
    iconBg: "#00c8ff12",
    label: "Мэдээлэл",
  },
  loading: {
    icon: null,
    accent: "#bf87ff",
    bg: "linear-gradient(135deg, #0d0014 0%, #180025 100%)",
    border: "#bf87ff40",
    glow: "0 0 40px #bf87ff25, 0 20px 60px rgba(0,0,0,0.85)",
    iconBg: "#bf87ff12",
    label: "Ачааллаж байна",
  },
};

// ─── CSS injection ────────────────────────────────────────────
const STYLES = `
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes toast-drop {
    0%   { transform: translateY(-110%) scale(0.88); opacity: 0; filter: blur(4px); }
    55%  { transform: translateY(6px) scale(1.015); opacity: 1; filter: blur(0); }
    75%  { transform: translateY(-3px) scale(0.998); }
    100% { transform: translateY(0) scale(1); opacity: 1; filter: blur(0); }
  }
  @keyframes toast-up {
    0%   { transform: translateY(0) scale(1); opacity: 1; }
    100% { transform: translateY(-115%) scale(0.9); opacity: 0; }
  }
  @keyframes pdot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.35; transform: scale(0.6); }
  }
  @keyframes scanline {
    0%   { transform: translateY(-100%); }
    100% { transform: translateY(400%); }
  }
`;

let cssInjected = false;
function injectOnce() {
  if (cssInjected || typeof document === "undefined") return;
  const s = document.createElement("style");
  s.textContent = STYLES;
  document.head.appendChild(s);
  cssInjected = true;
}

// ─── Spinner ──────────────────────────────────────────────────
function Spinner({ color }) {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none"
      style={{ animation: "spin 0.7s linear infinite", display: "block" }}>
      <circle cx="7.5" cy="7.5" r="5.5" stroke={color} strokeOpacity="0.15" strokeWidth="2" />
      <path d="M7.5 2a5.5 5.5 0 0 1 5.5 5.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// ─── Loading dots ─────────────────────────────────────────────
function Dots({ color }) {
  return (
    <span style={{ display: "inline-flex", gap: 3, alignItems: "center", marginLeft: 4 }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 3.5, height: 3.5, borderRadius: "50%",
          background: color,
          display: "inline-block",
          animation: `pdot 1.1s ease-in-out ${i * 0.18}s infinite`,
        }} />
      ))}
    </span>
  );
}

// ─── Single Toast ─────────────────────────────────────────────
function ToastItem({ toast, dismiss }) {
  const t = TYPES[toast.type] || TYPES.info;
  const isLoading = toast.type === "loading";
  const [hovered, setHovered] = useState(false);
  const [progress, setProgress] = useState(100);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!toast.duration || isLoading) return;
    const start = Date.now();
    const tick = () => {
      const p = Math.max(0, 100 - ((Date.now() - start) / toast.duration) * 100);
      setProgress(p);
      if (p > 0) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [toast.duration, isLoading]);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "14px 15px 14px 17px",
        borderRadius: 15,
        background: t.bg,
        border: `1px solid ${t.border}`,
        boxShadow: hovered
          ? t.glow.replace("0.85", "1").replace("25,", "45,")
          : t.glow,
        color: "#e8f0ff",
        fontFamily: "'DM Sans', 'Pretendard', system-ui, sans-serif",
        fontSize: 14,
        minWidth: 310,
        maxWidth: 430,
        animation: toast.visible
          ? "toast-drop 0.48s cubic-bezier(0.34,1.52,0.64,1) forwards"
          : "toast-up 0.28s ease-in forwards",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        cursor: "default",
        transition: "box-shadow 0.25s",
      }}
    >
      {/* Scanline sweep */}
      <div style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        borderRadius: 15,
        pointerEvents: "none",
        opacity: hovered ? 0.4 : 0,
        transition: "opacity 0.3s",
      }}>
        <div style={{
          position: "absolute",
          left: 0, right: 0,
          height: "25%",
          background: `linear-gradient(180deg, transparent, ${t.accent}0a, transparent)`,
          animation: "scanline 2.5s linear infinite",
        }} />
      </div>

      {/* Top shimmer line */}
      <div style={{
        position: "absolute",
        top: 0, left: "10%", right: "10%",
        height: 1,
        background: `linear-gradient(90deg, transparent, ${t.accent}99, transparent)`,
        borderRadius: 1,
        opacity: 0.7,
      }} />

      {/* Left neon stripe */}
      <div style={{
        position: "absolute",
        left: 0, top: 0, bottom: 0,
        width: 3,
        background: `linear-gradient(180deg, ${t.accent}ff 0%, ${t.accent}55 60%, transparent 100%)`,
        borderRadius: "15px 0 0 15px",
        boxShadow: `2px 0 12px ${t.accent}55`,
      }} />

      {/* Icon */}
      <div style={{
        flexShrink: 0,
        width: 34, height: 34,
        borderRadius: 10,
        background: t.iconBg,
        border: `1px solid ${t.accent}33`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: t.accent,
        fontSize: isLoading ? 0 : 15,
        fontWeight: 900,
        boxShadow: `0 0 16px ${t.accent}30`,
        marginTop: 1,
      }}>
        {isLoading ? <Spinner color={t.accent} /> : t.icon}
      </div>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0, paddingTop: 1 }}>
        {/* Badge row */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "2px 9px",
            borderRadius: 20,
            background: `${t.accent}18`,
            border: `1px solid ${t.accent}30`,
            color: t.accent,
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: 0.8,
            textTransform: "uppercase",
            gap: 4,
          }}>
            <span style={{
              width: 5, height: 5, borderRadius: "50%",
              background: t.accent,
              boxShadow: `0 0 6px ${t.accent}`,
              display: "inline-block",
              flexShrink: 0,
            }} />
            {toast.title || t.label}
          </span>
          {isLoading && <Dots color={t.accent} />}
        </div>

        {toast.message && (
          <div style={{
            color: "#aabbd0",
            fontSize: 13.5,
            lineHeight: 1.55,
            fontWeight: 400,
          }}>
            {toast.message}
          </div>
        )}
        {toast.description && (
          <div style={{ color: "#485a72", fontSize: 12, marginTop: 5, lineHeight: 1.4 }}>
            {toast.description}
          </div>
        )}
        {toast.action && (
          <button
            onClick={() => { toast.action.onClick(); dismiss(toast.id); }}
            style={{
              marginTop: 10,
              padding: "5px 13px",
              borderRadius: 8,
              border: `1px solid ${t.accent}44`,
              background: `${t.accent}14`,
              color: t.accent,
              fontSize: 12, fontWeight: 700,
              cursor: "pointer",
              letterSpacing: 0.2,
              boxShadow: `0 0 10px ${t.accent}20`,
              transition: "all 0.15s",
            }}
            onMouseEnter={e => {
              e.target.style.background = `${t.accent}26`;
              e.target.style.boxShadow = `0 0 18px ${t.accent}40`;
            }}
            onMouseLeave={e => {
              e.target.style.background = `${t.accent}14`;
              e.target.style.boxShadow = `0 0 10px ${t.accent}20`;
            }}
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* Close */}
      <button
        onClick={() => dismiss(toast.id)}
        style={{
          flexShrink: 0,
          background: hovered ? "rgba(255,255,255,0.05)" : "transparent",
          border: "none",
          color: hovered ? "#7a8fa8" : "#344560",
          width: 24, height: 24,
          borderRadius: 7,
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, fontWeight: 200, lineHeight: 1,
          transition: "all 0.15s",
          marginTop: 2,
        }}
      >
        ×
      </button>

      {/* Progress bar */}
      {toast.duration > 0 && !isLoading && (
        <div style={{
          position: "absolute",
          bottom: 0, left: 0,
          height: 2,
          width: `${progress}%`,
          background: `linear-gradient(90deg, ${t.accent}44, ${t.accent})`,
          boxShadow: `0 0 8px ${t.accent}bb`,
          transition: "width 0.08s linear",
        }} />
      )}
    </div>
  );
}

// ─── Container ────────────────────────────────────────────────
function ToastContainer({ toasts, dismiss, position }) {
  const posMap = {
    "top-right":     { top: 20, right: 20 },
    "top-left":      { top: 20, left: 20 },
    "top-center":    { top: 20, left: "50%", transform: "translateX(-50%)" },
    "bottom-right":  { bottom: 20, right: 20 },
    "bottom-left":   { bottom: 20, left: 20 },
    "bottom-center": { bottom: 20, left: "50%", transform: "translateX(-50%)" },
  };
  const isBottom = position.startsWith("bottom");

  return (
    <div style={{
      position: "fixed",
      zIndex: 9999,
      display: "flex",
      flexDirection: isBottom ? "column-reverse" : "column",
      gap: 10,
      pointerEvents: "none",
      ...posMap[position],
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{ pointerEvents: "auto" }}>
          <ToastItem toast={t} dismiss={dismiss} />
        </div>
      ))}
    </div>
  );
}

// ─── Context & Provider ───────────────────────────────────────
const ToastContext = createContext(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast нь <ToastProvider> дотор байх ёстой!");
  return ctx;
}

export function ToastProvider({
  children,
  maxToasts = 5,
  defaultDuration = 4000,
  position = "top-right",
}) {
  injectOnce();
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts(p => p.map(t => t.id === id ? { ...t, visible: false } : t));
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 300);
  }, []);

  const add = useCallback((message, opts = {}) => {
    const id = ++counter.current;
    const type = opts.type || "info";
    const duration = opts.duration ?? (type === "loading" ? 0 : defaultDuration);
    const toast = {
      id, message, type, duration,
      title: opts.title,
      action: opts.action || null,
      description: opts.description || null,
      visible: true,
    };
    setToasts(p => [toast, ...p].slice(0, maxToasts));
    if (duration > 0) setTimeout(() => dismiss(id), duration);
    return id;
  }, [defaultDuration, maxToasts, dismiss]);

  const update = useCallback((id, upd) =>
    setToasts(p => p.map(t => t.id === id ? { ...t, ...upd } : t)), []);

  const dismissAll = useCallback(() => {
    setToasts(p => p.map(t => ({ ...t, visible: false })));
    setTimeout(() => setToasts([]), 300);
  }, []);

  const success = useCallback((m, o) => add(m, { ...o, type: "success" }), [add]);
  const error   = useCallback((m, o) => add(m, { ...o, type: "error"   }), [add]);
  const warning = useCallback((m, o) => add(m, { ...o, type: "warning" }), [add]);
  const info    = useCallback((m, o) => add(m, { ...o, type: "info"    }), [add]);
  const loading = useCallback((m, o) => add(m, { ...o, type: "loading", duration: 0 }), [add]);

  const promise = useCallback((fn, msgs = {}) => {
    const id = add(msgs.loading || "Хүлээнэ үү...", { type: "loading", duration: 0 });
    fn.then(res => {
      const m = typeof msgs.success === "function" ? msgs.success(res) : msgs.success || "Амжилттай!";
      update(id, { type: "success", message: m, title: undefined, duration: defaultDuration, visible: true });
      setTimeout(() => dismiss(id), defaultDuration);
    }).catch(err => {
      const m = typeof msgs.error === "function" ? msgs.error(err) : msgs.error || "Алдаа гарлаа!";
      update(id, { type: "error", message: m, title: undefined, duration: defaultDuration, visible: true });
      setTimeout(() => dismiss(id), defaultDuration);
    });
    return id;
  }, [add, update, dismiss, defaultDuration]);

  const value = { toast: add, success, error, warning, info, loading, promise, dismiss, dismissAll, update, toasts };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} position={position} />
    </ToastContext.Provider>
  );
}