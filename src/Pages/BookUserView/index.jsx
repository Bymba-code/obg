import React, { useState, useEffect, useRef, useCallback } from "react";
import css from "./style.module.css";
import axiosInstance from "../../Services/Api/AxiosInstance";
import {
  BookOpen, ChevronRight, Home, ArrowLeft,
  FileText, Star, ChevronLeft, ChevronDown,
  Eye, Download, X, Maximize2, Minimize2,
  ZoomIn, ZoomOut, Hash, Tag, CheckCircle,
  RotateCcw, Award, BookMarked, Send,
  AlertCircle, Loader, Plus, MessageSquare,
  Users, BookText
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const BASE_URL = "http://localhost:3000";
const getUrl   = (path) => {
  if (!path) return null;
  const clean = path.replace(/\\/g, "/");
  return BASE_URL + (clean.startsWith("/") ? clean : "/" + clean);
};

/* ══════════════════════════════════════════════
   ProgressRing
══════════════════════════════════════════════ */
const ProgressRing = ({ pct = 0, size = 64, stroke = 5 }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct / 100;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,.18)" strokeWidth={stroke} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={pct >= 100 ? "#4ADE80" : "#FFD700"}
        strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray .7s cubic-bezier(.34,1.56,.64,1)" }}
      />
    </svg>
  );
};

/* ══════════════════════════════════════════════
   StarPicker
══════════════════════════════════════════════ */
const STAR_LABELS = ["", "Муу", "Дунд", "Дүйцэхүйц", "Сайн", "Маш сайн"];
const StarPicker  = ({ value, onChange }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className={css.starPicker}>
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button" className={css.starPickBtn}
          onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}>
          <Star size={26}
            fill={(hover || value) >= n ? "#D4AF37" : "none"}
            color={(hover || value) >= n ? "#D4AF37" : "#D1D5DB"}
            style={{ transition: "all .12s" }} />
        </button>
      ))}
      {(hover || value) > 0 && (
        <span className={css.starLabel}>{STAR_LABELS[hover || value]}</span>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════
   RatingForm
══════════════════════════════════════════════ */
const RatingForm = ({ bookId, onSubmitted }) => {
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [form,    setForm]    = useState({ rating: 0, title: "", content: "" });
  const [errors,  setErrors]  = useState({});

  const validate = () => {
    const e = {};
    if (!form.rating)         e.rating  = "Од өгнө үү";
    if (!form.title.trim())   e.title   = "Гарчиг оруулна уу";
    if (!form.content.trim()) e.content = "Сэтгэгдэл оруулна уу";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await axiosInstance.post("/me/book-rating", {
        book: bookId, title: form.title.trim(),
        content: form.content.trim(), rating: form.rating,
      });
      if (res?.status === 200 || res?.status === 201) {
        setDone(true);
        onSubmitted?.({
          id: Date.now(), title: form.title.trim(),
          content: form.content.trim(), rating: form.rating, users: null,
        });
        setForm({ rating: 0, title: "", content: "" });
        setTimeout(() => { setDone(false); setOpen(false); }, 2400);
      }
    } catch (err) {
      setErrors({ submit: err?.response?.data?.message || "Алдаа гарлаа" });
    } finally { setLoading(false); }
  };

  if (!open) return (
    <button className={css.ratingOpenBtn} onClick={() => setOpen(true)}>
      <Plus size={14} /> Үнэлгээ өгөх
    </button>
  );

  return (
    <div className={css.ratingForm}>
      <div className={css.ratingFormHead}>
        <MessageSquare size={16} color="#D4AF37" />
        <span>Үнэлгээ өгөх</span>
        <button className={css.ratingFormClose} onClick={() => setOpen(false)}>✕</button>
      </div>

      {done ? (
        <div className={css.ratingFormSuccess}>
          <CheckCircle size={30} color="#22C55E" />
          <p>Үнэлгээ амжилттай илгээгдлээ!</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className={css.rfGroup}>
            <label className={css.rfLabel}>Үнэлгээ <span className={css.req}>*</span></label>
            <StarPicker value={form.rating} onChange={v => { setForm(p => ({ ...p, rating: v })); setErrors(p => ({ ...p, rating: "" })); }} />
            {errors.rating && <span className={css.rfErr}>{errors.rating}</span>}
          </div>
          <div className={css.rfGroup}>
            <label className={css.rfLabel}>Гарчиг <span className={css.req}>*</span></label>
            <input className={`${css.rfInput} ${errors.title ? css.rfInputErr : ""}`}
              placeholder="Товч гарчиг..." value={form.title}
              onChange={e => { setForm(p => ({ ...p, title: e.target.value })); setErrors(p => ({ ...p, title: "" })); }} />
            {errors.title && <span className={css.rfErr}>{errors.title}</span>}
          </div>
          <div className={css.rfGroup}>
            <label className={css.rfLabel}>Сэтгэгдэл <span className={css.req}>*</span></label>
            <textarea className={`${css.rfTextarea} ${errors.content ? css.rfInputErr : ""}`}
              placeholder="Дэлгэрэнгүй сэтгэгдэл..." rows={4} value={form.content}
              onChange={e => { setForm(p => ({ ...p, content: e.target.value })); setErrors(p => ({ ...p, content: "" })); }} />
            {errors.content && <span className={css.rfErr}>{errors.content}</span>}
          </div>
          {errors.submit && <div className={css.rfSubmitErr}><AlertCircle size={13} />{errors.submit}</div>}
          <button type="submit" className={css.rfSubmitBtn} disabled={loading}>
            {loading ? <><Loader size={14} className={css.spin} />Илгээж байна...</> : <><Send size={14} />Илгээх</>}
          </button>
        </form>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════
   PDF VIEWER — inline with page tracking
══════════════════════════════════════════════ */
const PDFViewer = ({ url, title, totalPages, currentPage, onPageChange, onComplete, completed }) => {
  const [fullscreen, setFullscreen] = useState(false);
  const [zoom,       setZoom]       = useState(100);

  const zoomUrl = `${url}#toolbar=0&navpanes=0&scrollbar=1&zoom=${zoom}`;

  const openFull  = () => { setFullscreen(true);  document.body.style.overflow = "hidden"; };
  const closeFull = () => { setFullscreen(false); document.body.style.overflow = ""; };

  const pctRead = totalPages > 0 ? Math.min(100, Math.round((currentPage / totalPages) * 100)) : 0;

  return (
    <>
      {/* ── Inline viewer ── */}
      <div className={css.pdfViewerWrap}>
        {/* Toolbar */}
        <div className={css.pdfToolbar}>
          <div className={css.pdfToolLeft}>
            <FileText size={15} color="#D4AF37" />
            <span className={css.pdfTitle}>{title}</span>
          </div>
          <div className={css.pdfToolRight}>
            <button className={css.pdfToolBtn} onClick={() => setZoom(z => Math.max(50, z - 10))} title="Багасгах">
              <ZoomOut size={13} />
            </button>
            <span className={css.pdfZoom}>{zoom}%</span>
            <button className={css.pdfToolBtn} onClick={() => setZoom(z => Math.min(200, z + 10))} title="Томруулах">
              <ZoomIn size={13} />
            </button>
            <div className={css.pdfToolDivider} />
            <a href={url} download className={css.pdfToolBtn} title="Татаж авах">
              <Download size={13} />
            </a>
            <button className={css.pdfToolBtn} onClick={openFull} title="Дэлгэц дүүргэх">
              <Maximize2 size={13} />
            </button>
          </div>
        </div>

        {/* iFrame */}
        <div className={css.pdfFrame}>
          <iframe src={zoomUrl} title={title} className={css.pdfIframe} />
        </div>

        {/* Page controls + progress */}
        <div className={css.pdfFooter}>
          <div className={css.pdfPageRow}>
            <button className={css.pdfPageBtn}
              onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage <= 1}>
              <ChevronLeft size={14} />
            </button>
            <span className={css.pdfPageInfo}>
              <strong>{currentPage}</strong> / {totalPages} хуудас
            </span>
            <button className={css.pdfPageBtn}
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage >= totalPages}>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Progress bar */}
          <div className={css.pdfProgressBar}>
            <div className={css.pdfProgressFill} style={{ width: `${pctRead}%`,
              background: pctRead >= 100 ? "linear-gradient(90deg,#22C55E,#16A34A)" : "linear-gradient(90deg,#D4AF37,#FFD700)" }} />
          </div>
          <span className={css.pdfProgressPct}>{pctRead}% уншигдлаа</span>

          {/* Complete button */}
          {!completed && currentPage >= totalPages && (
            <button className={css.pdfCompleteBtn} onClick={onComplete}>
              <CheckCircle size={15} /> Уншиж дуусав
            </button>
          )}
          {completed && (
            <div className={css.pdfCompletedBadge}>
              <CheckCircle size={13} /> Уншиж дуусгасан
            </div>
          )}
        </div>
      </div>

      {/* ── Fullscreen modal ── */}
      {fullscreen && (
        <>
          <div className={css.pdfBackdrop} onClick={closeFull} />
          <div className={css.pdfFullModal}>
            <div className={css.pdfFullHeader}>
              <div className={css.pdfToolLeft}>
                <FileText size={15} color="#D4AF37" />
                <span className={css.pdfTitle}>{title}</span>
              </div>
              <div className={css.pdfToolRight}>
                <button className={css.pdfToolBtn} onClick={() => setZoom(z => Math.max(50, z - 10))}><ZoomOut size={13} /></button>
                <span className={css.pdfZoom}>{zoom}%</span>
                <button className={css.pdfToolBtn} onClick={() => setZoom(z => Math.min(200, z + 10))}><ZoomIn size={13} /></button>
                <a href={url} download className={css.pdfToolBtn}><Download size={13} /></a>
                <button className={`${css.pdfToolBtn} ${css.pdfCloseBtn}`} onClick={closeFull}><X size={13} /></button>
              </div>
            </div>
            <iframe src={zoomUrl} title={title} className={css.pdfFullIframe} />
          </div>
        </>
      )}
    </>
  );
};

/* ══════════════════════════════════════════════
   MAIN: BookDetail
══════════════════════════════════════════════ */
const BookDetail = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [book,        setBook]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [activeTab,   setActiveTab]   = useState("read"); // "read" | "info" | "rating"
  const [currentPage, setCurrentPage] = useState(1);
  const [completed,   setCompleted]   = useState(false);
  const [progress,    setProgress]    = useState(0);

  /* Fetch */
  useEffect(() => {
    (async () => {
      try {
        const [bookRes, progressRes] = await Promise.all([
          axiosInstance.get(`/me/book/${id}`),
          axiosInstance.get(`/me/book-progress/${id}`).catch(() => null),
        ]);
        if (bookRes?.status === 200) setBook(bookRes.data.data);
        if (progressRes?.status === 200) {
          const p = progressRes.data.data;
          if (p) {
            setProgress(Number(p.progress) || 0);
            setCompleted(!!p.completed);
            setCurrentPage(Number(p.progress) || 1);
          }
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    })();
  }, [id]);

  /* Progress save — debounced fire-and-forget */
  const saveTimer = useRef(null);
  const saveProgress = useCallback((page, done = false) => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      axiosInstance.post("/me/book-progress", {
        book: id, progress: page, completed: done,
      }).catch(() => {});
    }, 600);
  }, [id]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setProgress(page);
    saveProgress(page, false);
  };

  const handleComplete = () => {
    setCompleted(true);
    setProgress(book?.pageNumber || currentPage);
    axiosInstance.post("/me/book-progress", {
      book: id, progress: book?.pageNumber || currentPage, completed: true,
    }).catch(() => {});
  };

  const handleRatingAdded = useCallback((r) => {
    setBook(prev => {
      if (!prev) return prev;
      const ratings = [r, ...(prev.book_rating || [])];
      const avg     = ratings.reduce((s, x) => s + (x.rating || 0), 0) / ratings.length;
      return { ...prev, book_rating: ratings, avgRating: avg, ratingCount: ratings.length };
    });
  }, []);

  /* ── Loading ── */
  if (loading) return (
    <div className={css.shell}>
      <div className={css.loadingWrap}>
        <div className={css.loader} />
        <span>Ном ачааллаж байна...</span>
      </div>
    </div>
  );

  if (!book) return (
    <div className={css.shell}>
      <div className={css.emptyWrap}>
        <BookOpen size={48} color="#D1D5DB" strokeWidth={1} />
        <p>Ном олдсонгүй</p>
        <button className={css.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={14} /> Буцах
        </button>
      </div>
    </div>
  );

  const pdfUrl     = getUrl(book.book_files?.[0]?.file);
  const imgUrl     = getUrl(book.image);
  const totalPages = book.pageNumber || 1;
  const pctRead    = Math.min(100, Math.round((currentPage / totalPages) * 100));
  const ratings    = book.book_rating || [];
  const avg        = book.avgRating || (ratings.length
    ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length : 0);

  return (
    <div className={css.shell}>

      {/* ── Top hero banner ── */}
      <div className={css.hero}>
        {imgUrl && <img src={imgUrl} alt={book.title} className={css.heroBg} />}
        <div className={css.heroOverlay} />

        <div className={css.heroContent}>
          {/* Breadcrumb */}
          <div className={css.heroBreads}>
            <span onClick={() => navigate("/")} className={css.bread}><Home size={13} />Нүүр</span>
            <ChevronRight size={12} color="rgba(255,255,255,.4)" />
            <span onClick={() => navigate("/books")} className={css.bread}><BookOpen size={13} />Номын сан</span>
            <ChevronRight size={12} color="rgba(255,255,255,.4)" />
            <span className={`${css.bread} ${css.breadActive}`}>{book.title}</span>
          </div>

          {/* Book info */}
          <div className={css.heroBody}>
            <div className={css.heroCover}>
              {imgUrl
                ? <img src={imgUrl} alt={book.title} className={css.heroCoverImg} />
                : <div className={css.heroCoverFallback}><BookOpen size={40} color="#D4AF37" strokeWidth={1} /></div>
              }
              {completed && (
                <div className={css.heroCoverDone}><CheckCircle size={18} color="white" /></div>
              )}
            </div>

            <div className={css.heroInfo}>
              {book.books_category && (
                <span className={css.heroCat}><Tag size={11} />{book.books_category.name}</span>
              )}
              <h1 className={css.heroTitle}>{book.title}</h1>

              {/* Stars */}
              <div className={css.heroStars}>
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={15}
                    fill={i <= Math.round(avg) ? "#D4AF37" : "none"}
                    color={i <= Math.round(avg) ? "#D4AF37" : "rgba(255,255,255,.3)"}
                  />
                ))}
                <span className={css.heroRatingVal}>{avg > 0 ? avg.toFixed(1) : "—"}</span>
                <span className={css.heroRatingCnt}>({book.ratingCount || ratings.length})</span>
              </div>

              {/* Meta chips */}
              <div className={css.heroMeta}>
                <div className={css.heroChip}><Hash size={12} />{totalPages} хуудас</div>
                <div className={css.heroChip}><FileText size={12} />{pdfUrl ? "PDF байна" : "PDF байхгүй"}</div>
                {completed && <div className={`${css.heroChip} ${css.heroChipDone}`}><Award size={12} />Уншиж дуусгасан</div>}
              </div>

              {/* Progress */}
              <div className={css.heroProgress}>
                <div className={css.heroProgressRing}>
                  <ProgressRing pct={pctRead} size={56} stroke={4} />
                  <span className={css.heroProgressPct}>{pctRead}%</span>
                </div>
                <div>
                  <div className={css.heroProgressBar}>
                    <div className={css.heroProgressFill}
                      style={{ width: `${pctRead}%`,
                        background: completed ? "linear-gradient(90deg,#4ADE80,#22C55E)" : "linear-gradient(90deg,#D4AF37,#FFD700)" }} />
                  </div>
                  <p className={css.heroProgressTxt}>
                    {currentPage} / {totalPages} хуудас уншсан
                    {completed ? " · Дуусгасан ✓" : ""}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Back button */}
          <button className={css.heroBack} onClick={() => navigate(-1)}>
            <ArrowLeft size={14} /> Буцах
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className={css.tabBar}>
        {[
          { key: "read",   label: "Унших",   icon: <BookText size={15} /> },
          { key: "info",   label: "Мэдээлэл",icon: <BookMarked size={15} /> },
          { key: "rating", label: `Үнэлгээ${ratings.length ? ` (${ratings.length})` : ""}`, icon: <Star size={15} /> },
        ].map(t => (
          <button key={t.key}
            className={`${css.tabBtn} ${activeTab === t.key ? css.tabBtnActive : ""}`}
            onClick={() => setActiveTab(t.key)}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div className={css.tabContent}>

        {/* ─ READ tab ─ */}
        {activeTab === "read" && (
          <div className={css.readTab}>
            {pdfUrl ? (
              <PDFViewer
                url={pdfUrl}
                title={book.title}
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onComplete={handleComplete}
                completed={completed}
              />
            ) : (
              <div className={css.noPdf}>
                <FileText size={40} color="#D1D5DB" strokeWidth={1} />
                <p>PDF файл байхгүй байна</p>
              </div>
            )}
          </div>
        )}

        {/* ─ INFO tab ─ */}
        {activeTab === "info" && (
          <div className={css.infoTab}>
            <div className={css.infoCard}>
              <div className={css.infoCardHead}>
                <BookMarked size={16} color="#D4AF37" />
                <h3>Номын тухай</h3>
              </div>
              <p className={css.infoDesc}>{book.description}</p>
              <div className={css.infoGrid}>
                <div className={css.infoCell}>
                  <span className={css.infoCellLbl}><Tag size={11} /> Ангилал</span>
                  <span className={css.infoCellVal}>{book.books_category?.name || "—"}</span>
                </div>
                <div className={css.infoCell}>
                  <span className={css.infoCellLbl}><Hash size={11} /> Нийт хуудас</span>
                  <span className={css.infoCellVal}>{totalPages}</span>
                </div>
                <div className={css.infoCell}>
                  <span className={css.infoCellLbl}><Eye size={11} /> Уншилтын явц</span>
                  <span className={css.infoCellVal}>
                    {currentPage} / {totalPages}
                    <span style={{ fontSize: 11, color: "#94A3B8", marginLeft: 6 }}>({pctRead}%)</span>
                  </span>
                </div>
                <div className={css.infoCell}>
                  <span className={css.infoCellLbl}><CheckCircle size={11} /> Статус</span>
                  <span className={`${css.infoCellVal} ${completed ? css.infoDone : css.infoReading}`}>
                    {completed ? "✓ Уншиж дуусгасан" : "Уншиж байна"}
                  </span>
                </div>
                <div className={css.infoCell}>
                  <span className={css.infoCellLbl}><Star size={11} /> Дундаж үнэлгээ</span>
                  <span className={css.infoCellVal}>{avg > 0 ? avg.toFixed(1) : "—"}</span>
                </div>
                <div className={css.infoCell}>
                  <span className={css.infoCellLbl}><Users size={11} /> Нийт үнэлгээ</span>
                  <span className={css.infoCellVal}>{book.ratingCount || ratings.length}</span>
                </div>
              </div>

              {/* Reset progress */}
              {(currentPage > 1 || completed) && (
                <button className={css.resetBtn}
                  onClick={() => {
                    setCurrentPage(1); setProgress(1); setCompleted(false);
                    axiosInstance.post("/me/book-progress", { book: id, progress: 1, completed: false }).catch(() => {});
                  }}>
                  <RotateCcw size={13} /> Явцыг дахин тохируулах
                </button>
              )}
            </div>
          </div>
        )}

        {/* ─ RATING tab ─ */}
        {activeTab === "rating" && (
          <div className={css.ratingTab}>

            {/* Summary */}
            {ratings.length > 0 && (
              <div className={css.ratingSummary}>
                <div className={css.rsSide}>
                  <span className={css.rsNum}>{avg.toFixed(1)}</span>
                  <div className={css.rsStars}>
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} size={18}
                        fill={i <= Math.round(avg) ? "#D4AF37" : "none"}
                        color={i <= Math.round(avg) ? "#D4AF37" : "#E2E8F0"} />
                    ))}
                  </div>
                  <span className={css.rsCnt}>{ratings.length} үнэлгээ</span>
                </div>
                <div className={css.rsBars}>
                  {[5,4,3,2,1].map(n => {
                    const c = ratings.filter(r => r.rating === n).length;
                    const p = ratings.length ? Math.round(c / ratings.length * 100) : 0;
                    return (
                      <div key={n} className={css.rsRow}>
                        <span className={css.rsRowLbl}>{n} ★</span>
                        <div className={css.rsTrack}><div className={css.rsFill} style={{ width: `${p}%` }} /></div>
                        <span className={css.rsRowCnt}>{c}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Form */}
            <RatingForm bookId={book.id} onSubmitted={handleRatingAdded} />

            {/* List */}
            {ratings.length > 0 ? (
              <div className={css.ratingList}>
                {ratings.map((r, i) => {
                  const name = r.users
                    ? [r.users.firstname, r.users.lastname].filter(Boolean).join(" ") || r.users.kode
                    : "Хэрэглэгч";
                  return (
                    <div key={r.id ?? i} className={css.ratingCard}>
                      <div className={css.rcStars}>
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} size={13}
                            fill={s <= r.rating ? "#D4AF37" : "none"}
                            color={s <= r.rating ? "#D4AF37" : "#E2E8F0"} />
                        ))}
                        <span className={css.rcScore}>{r.rating}.0</span>
                      </div>
                      <p className={css.rcTitle}>{r.title}</p>
                      <p className={css.rcContent}>{r.content}</p>
                      <div className={css.rcUser}>
                        <div className={css.rcAvatar}>{name.charAt(0).toUpperCase()}</div>
                        <div>
                          <p className={css.rcName}>{name}</p>
                          {r.users?.kode && <p className={css.rcKode}>{r.users.kode}</p>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={css.ratingEmpty}>
                <Star size={36} color="#E2E8F0" />
                <p>Одоогоор үнэлгээ байхгүй</p>
                <span>Хамгийн эхний үнэлгээгээ үлдээгээрэй!</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetail;