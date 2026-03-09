import React, { useState, useRef, useEffect } from "react";
import {
  FileText, Download, ZoomIn, ZoomOut, RotateCcw,
  CheckCircle, BookOpen, Clock, Timer
} from "lucide-react";
import css from "./style.module.css";

/**
 * PDFViewer
 * Props:
 *   fileUrl      — PDF файлын URL
 *   title        — Гарчиг (заавал биш)
 *   duration     — Хэдэн секунд үзвэл дуусна (default: 300 = 5 мин)
 *   onComplete   — Хугацаа дуусахад дуудагдах callback
 *   completed    — Аль хэдийн дуусгасан эсэх
 */
const PDFViewer = ({
  fileUrl,
  title,
  duration = 300,
  onComplete,
  completed: initialCompleted = false,
}) => {
  const [zoom, setZoom]           = useState(100);
  const [elapsed, setElapsed]     = useState(0);
  const [active, setActive]       = useState(false);          // tab focus байгаа эсэх
  const [completed, setCompleted] = useState(initialCompleted);
  const [showDone, setShowDone]   = useState(false);

  const completedRef  = useRef(initialCompleted);
  const intervalRef   = useRef(null);
  const iframeRef     = useRef(null);

  // Sync prop
  useEffect(() => {
    setCompleted(initialCompleted);
    completedRef.current = initialCompleted;
    if (initialCompleted) setElapsed(duration);
  }, [initialCompleted, duration]);

  // Таймер эхлүүлэх/зогсоох
  const startTimer = () => {
    if (completedRef.current) return;
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      setElapsed(prev => {
        const next = prev + 1;
        if (next >= duration && !completedRef.current) {
          completedRef.current = true;
          setCompleted(true);
          setShowDone(true);
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          onComplete && onComplete();
          setTimeout(() => setShowDone(false), 5000);
        }
        return next;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Хуудас focus авахад таймер эхэлнэ, алдахад зогсоно
  useEffect(() => {
    const onFocus = () => { setActive(true);  startTimer(); };
    const onBlur  = () => { setActive(false); stopTimer();  };
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur",  onBlur);
    // Хэрэв эхнээс л focus байвал шууд эхлүүл
    if (document.hasFocus()) { setActive(true); startTimer(); }
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur",  onBlur);
      stopTimer();
    };
  }, []);                       // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup
  useEffect(() => () => stopTimer(), []);

  // Утга тооцох
  const pct         = completed ? 100 : Math.min(Math.round((elapsed / duration) * 100), 100);
  const remaining   = Math.max(duration - elapsed, 0);
  const remMin      = Math.floor(remaining / 60);
  const remSec      = remaining % 60;
  const elMin       = Math.floor(elapsed  / 60);
  const elSec       = elapsed  % 60;
  const fmt = (m, s) => `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;

  // SVG ring
  const R   = 18;
  const C   = 2 * Math.PI * R;
  const arc = C - (pct / 100) * C;

  return (
    <div className={css.viewer}>

      {/* ── TOOLBAR ───────────────────────────────────────── */}
      <div className={css.toolbar}>

        {/* Left */}
        <div className={css.toolbarLeft}>
          <div className={css.fileIcon}>
            <FileText size={15} />
          </div>
          <span className={css.toolbarTitle}>{title || "PDF Материал"}</span>
          {completed && (
            <span className={css.donePill}>
              <CheckCircle size={12} /> Үзсэн
            </span>
          )}
        </div>

        {/* Center: timer progress */}
        <div className={css.progressArea}>
          <svg className={css.ring} width="44" height="44" viewBox="0 0 44 44">
            <circle
              cx="22" cy="22" r={R}
              fill="none" stroke="var(--border-light, #E8E2D9)" strokeWidth="3"
            />
            <circle
              cx="22" cy="22" r={R}
              fill="none"
              stroke={completed ? "var(--sage,#3D6B52)" : "var(--terracotta,#B85C38)"}
              strokeWidth="3"
              strokeDasharray={C}
              strokeDashoffset={arc}
              strokeLinecap="round"
              transform="rotate(-90 22 22)"
              style={{ transition: "stroke-dashoffset .8s ease, stroke .4s ease" }}
            />
            <text x="22" y="26" textAnchor="middle" fontSize="9" fontWeight="700"
              fill={completed ? "var(--sage,#3D6B52)" : "var(--terracotta,#B85C38)"}
            >
              {pct}%
            </text>
          </svg>

          <div className={css.timerInfo}>
            <div className={css.progressTrack}>
              <div
                className={[css.progressFill, completed ? css.progressFillDone : ""].filter(Boolean).join(" ")}
                style={{ width: pct + "%", transition: "width .8s ease" }}
              />
            </div>
            <div className={css.timerRow}>
              <span className={css.timerElapsed}>
                <Timer size={11} /> {fmt(elMin, elSec)}
              </span>
              {!completed && (
                <span className={css.timerRemaining}>
                  <Clock size={11} /> {fmt(remMin, remSec)} үлдсэн
                </span>
              )}
              {/* Active indicator */}
              <span className={[css.activeDot, active && !completed ? css.activeDotOn : ""].filter(Boolean).join(" ")} />
            </div>
          </div>
        </div>

        {/* Right: zoom + download */}
        <div className={css.controls}>
          <button
            className={css.ctrlBtn}
            onClick={() => setZoom(z => Math.max(z - 10, 50))}
            title="Жижигрүүлэх"
            disabled={zoom <= 50}
          >
            <ZoomOut size={15} />
          </button>
          <span className={css.zoomLabel}>{zoom}%</span>
          <button
            className={css.ctrlBtn}
            onClick={() => setZoom(z => Math.min(z + 10, 200))}
            title="Томруулах"
            disabled={zoom >= 200}
          >
            <ZoomIn size={15} />
          </button>
          <button
            className={css.ctrlBtn}
            onClick={() => setZoom(100)}
            title="Анхны хэмжээ"
          >
            <RotateCcw size={14} />
          </button>
          <div className={css.divider} />
          <a href={fileUrl} download className={css.downloadBtn}>
            <Download size={14} />
            <span>Татах</span>
          </a>
        </div>
      </div>

      {/* ── PDF IFRAME ────────────────────────────────────── */}
      <div className={css.frameWrap}>
        <div
          className={css.frameScale}
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
        >
          <iframe
            ref={iframeRef}
            src={fileUrl + "#toolbar=0&navpanes=0"}
            className={css.iframe}
            title={title || "PDF"}
          />
        </div>
      </div>

      {/* ── COMPLETION TOAST ──────────────────────────────── */}
      <div className={[css.toast, showDone ? css.toastVisible : ""].filter(Boolean).join(" ")}>
        <CheckCircle size={18} />
        <div>
          <p className={css.toastTitle}>PDF материалыг бүрэн үзлээ!</p>
          <p className={css.toastSub}>Агуулга амжилттай дууссан гэж тэмдэглэгдлээ.</p>
        </div>
      </div>

      {/* ── STATUS BAR ────────────────────────────────────── */}
      <div className={css.statusBar}>
        <div className={css.statusLeft}>
          <BookOpen size={13} />
          <span>{completed ? "Бүрэн үзсэн" : "Хуудсыг нээлттэй байлгана уу"}</span>
        </div>
        <span className={css.statusRight}>
          {completed
            ? `✓ ${fmt(Math.floor(duration/60), duration%60)} үзсэн`
            : active
              ? `⏱ ${fmt(elMin, elSec)} / ${fmt(Math.floor(duration/60), duration%60)}`
              : "⏸ Түр зогссон"}
        </span>
      </div>
    </div>
  );
};

export default PDFViewer;