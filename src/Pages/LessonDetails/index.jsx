import React, { useState, useEffect, useCallback } from "react";
import {
  PlayCircle, FileText, CheckCircle, Circle, Lock,
  BookOpen, Clock, Star, Award, ChevronRight,
  ChevronLeft, BarChart3, Image, Send, User,
  MessageSquare, AlertCircle, Loader, Plus
} from "lucide-react";
import css from "./style.module.css";
import axiosInstance from "../../Services/Api/AxiosInstance";
import { useParams } from "react-router-dom";
import VideoPlayer from "../../Modules/Lesson/UI/VideoPlayer";
import ExamMake   from "../../Modules/Lesson/UI/ExamMake";
import PDFViewer  from "../../Modules/Lesson/UI/PdfViewer";

const BASE_URL = "http://localhost:3000";
const getUrl = (path) => {
  if (!path) return "";
  return BASE_URL + path.replace(/\\/g, "/");
};

/* ══════════════════════════════════════════════════
   RatingForm — хэрэглэгч үнэлгээ өгөх
══════════════════════════════════════════════════ */
const RatingForm = ({ lessonId, onSubmitted }) => {
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [hover,   setHover]   = useState(0);
  const [form,    setForm]    = useState({ title: "", content: "", rating: 0 });
  const [errors,  setErrors]  = useState({});
  const [sent,    setSent]    = useState(false);

  const validate = () => {
    const e = {};
    if (!form.rating)          e.rating  = "Од өгнө үү";
    if (!form.title.trim())    e.title   = "Гарчиг оруулна уу";
    if (!form.content.trim())  e.content = "Сэтгэгдэл оруулна уу";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await axiosInstance.post("/me/lesson-rating", {
        lesson:  lessonId,
        title:   form.title.trim(),
        content: form.content.trim(),
        rating:  form.rating,
      });
      if (res?.status === 200 || res?.status === 201) {
        setSent(true);
        onSubmitted?.({
          id:      res.data?.data?.id || Date.now(),
          title:   form.title.trim(),
          content: form.content.trim(),
          rating:  form.rating,
          users:   null, /* optimistic — нэр харагдахгүй, reload хийхэд харагдана */
        });
        setForm({ title: "", content: "", rating: 0 });
        setTimeout(() => { setSent(false); setOpen(false); }, 2200);
      }
    } catch (err) {
      setErrors({ submit: err?.response?.data?.message || "Алдаа гарлаа" });
    } finally { setLoading(false); }
  };

  if (!open) return (
    <button className={css.ratingOpenBtn} onClick={() => setOpen(true)}>
      <Plus size={15} /> Үнэлгээ өгөх
    </button>
  );

  return (
    <div className={css.ratingForm}>
      <div className={css.ratingFormHead}>
        <MessageSquare size={18} color="var(--orange)" />
        <span>Үнэлгээ өгөх</span>
        <button className={css.ratingFormClose} onClick={() => setOpen(false)}>✕</button>
      </div>

      {sent ? (
        <div className={css.ratingFormSuccess}>
          <CheckCircle size={32} color="var(--green)" />
          <p>Үнэлгээ амжилттай илгээгдлээ!</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Од сонгох */}
          <div className={css.ratingFormGroup}>
            <label className={css.ratingFormLabel}>Үнэлгээ <span className={css.ratingReq}>*</span></label>
            <div className={css.starPicker}>
              {[1,2,3,4,5].map(n => (
                <button
                  key={n} type="button"
                  className={css.starPickerBtn}
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => { setForm(p => ({ ...p, rating: n })); setErrors(p => ({ ...p, rating: "" })); }}
                >
                  <Star
                    size={28}
                    fill={(hover || form.rating) >= n ? "#F59E0B" : "none"}
                    color={(hover || form.rating) >= n ? "#F59E0B" : "#D1D5DB"}
                    style={{ transition: "all .15s" }}
                  />
                </button>
              ))}
              {form.rating > 0 && (
                <span className={css.starPickerLabel}>
                  {["", "Муу", "Дунд", "Дүйцэхүйц", "Сайн", "Маш сайн"][form.rating]}
                </span>
              )}
            </div>
            {errors.rating && <span className={css.ratingErrMsg}><AlertCircle size={12} />{errors.rating}</span>}
          </div>

          {/* Гарчиг */}
          <div className={css.ratingFormGroup}>
            <label className={css.ratingFormLabel}>Гарчиг <span className={css.ratingReq}>*</span></label>
            <input
              type="text"
              className={`${css.ratingInput} ${errors.title ? css.ratingInputErr : ""}`}
              placeholder="Хичээлийн талаарх богино гарчиг..."
              value={form.title}
              onChange={e => { setForm(p => ({ ...p, title: e.target.value })); setErrors(p => ({ ...p, title: "" })); }}
            />
            {errors.title && <span className={css.ratingErrMsg}><AlertCircle size={12} />{errors.title}</span>}
          </div>

          {/* Сэтгэгдэл */}
          <div className={css.ratingFormGroup}>
            <label className={css.ratingFormLabel}>Сэтгэгдэл <span className={css.ratingReq}>*</span></label>
            <textarea
              className={`${css.ratingTextarea} ${errors.content ? css.ratingInputErr : ""}`}
              placeholder="Хичээлийн талаарх дэлгэрэнгүй сэтгэгдлээ бичнэ үү..."
              rows={4}
              value={form.content}
              onChange={e => { setForm(p => ({ ...p, content: e.target.value })); setErrors(p => ({ ...p, content: "" })); }}
            />
            {errors.content && <span className={css.ratingErrMsg}><AlertCircle size={12} />{errors.content}</span>}
          </div>

          {errors.submit && (
            <div className={css.ratingSubmitErr}><AlertCircle size={14} />{errors.submit}</div>
          )}

          <button type="submit" className={css.ratingSubmitBtn} disabled={loading}>
            {loading
              ? <><Loader size={15} className={css.ratingSpinner} />Илгээж байна...</>
              : <><Send size={15} />Илгээх</>}
          </button>
        </form>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════
   RatingCard — нэг үнэлгээ
══════════════════════════════════════════════════ */
const RatingCard = ({ r }) => {
  const name = r.users
    ? [r.users.firstname, r.users.lastname].filter(Boolean).join(" ") || r.users.kode
    : "Хэрэглэгч";
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className={css.ratingCard}>
      {/* Stars */}
      <div className={css.ratingCardStars}>
        {[1,2,3,4,5].map(i => (
          <Star key={i} size={14}
            fill={i <= r.rating ? "#F59E0B" : "none"}
            color={i <= r.rating ? "#F59E0B" : "#D1D5DB"}
          />
        ))}
        <span className={css.ratingCardScore}>{r.rating}.0</span>
      </div>

      {/* Title & content */}
      <p className={css.ratingCardTitle}>{r.title}</p>
      <p className={css.ratingCardContent}>{r.content}</p>

      {/* User info */}
      <div className={css.ratingCardUser}>
        <div className={css.ratingCardAvatar}>{initial}</div>
        <div>
          <p className={css.ratingCardUserName}>{name}</p>
          {r.users?.kode && <p className={css.ratingCardUserKode}>{r.users.kode}</p>}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════
   RatingTab — rating tab дотор бүгд
══════════════════════════════════════════════════ */
const RatingTab = ({ lesson, onRatingAdded }) => {
  const ratings = lesson.lesson_rating_lesson_rating_lessonTolesson || [];
  const avg     = lesson.avgRating   || 0;
  const count   = lesson.ratingCount || 0;

  /* Star distribution */
  const dist = [5,4,3,2,1].map(n => ({
    star:  n,
    count: ratings.filter(r => r.rating === n).length,
    pct:   count > 0 ? Math.round((ratings.filter(r => r.rating === n).length / count) * 100) : 0,
  }));

  return (
    <div>
      {/* Summary */}
      {count > 0 && (
        <div className={css.ratingSummary}>
          <div className={css.ratingSummaryLeft}>
            <span className={css.ratingSummaryNum}>{Number(avg).toFixed(1)}</span>
            <div className={css.ratingSummaryStars}>
              {[1,2,3,4,5].map(i => (
                <Star key={i} size={18}
                  fill={i <= Math.round(avg) ? "#F59E0B" : "none"}
                  color={i <= Math.round(avg) ? "#F59E0B" : "#D1D5DB"}
                />
              ))}
            </div>
            <span className={css.ratingSummaryCount}>{count} үнэлгээ</span>
          </div>
          <div className={css.ratingSummaryBars}>
            {dist.map(d => (
              <div key={d.star} className={css.ratingDistRow}>
                <span className={css.ratingDistLabel}>{d.star} ★</span>
                <div className={css.ratingDistTrack}>
                  <div className={css.ratingDistFill} style={{ width: `${d.pct}%` }} />
                </div>
                <span className={css.ratingDistCount}>{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form */}
      <RatingForm lessonId={lesson.id} onSubmitted={onRatingAdded} />

      {/* List */}
      {ratings.length > 0 ? (
        <div className={css.ratingList}>
          {ratings.map(r => <RatingCard key={r.id} r={r} />)}
        </div>
      ) : (
        <div className={css.ratingEmpty}>
          <Star size={32} color="#D1D5DB" />
          <p>Одоогоор үнэлгээ байхгүй байна</p>
          <span>Хамгийн эхний үнэлгээгээ үлдээгээрэй!</span>
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════
   MAIN: LessonDetail
══════════════════════════════════════════════════ */
const LessonDetail = () => {
  const { id } = useParams();

  const [lesson,              setLesson]              = useState(null);
  const [loading,             setLoading]             = useState(true);
  const [activeTab,           setActiveTab]           = useState("overview");
  const [currentContentIndex, setCurrentContentIndex] = useState(0);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/me/lesson/${id}`);
        if (res?.status === 200) setLesson(res.data.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    })();
  }, [id]);

  /* ── State update helpers ── */
  const markContentComplete = useCallback((contentId) => {
    setLesson(prev => {
      if (!prev) return prev;
      const FIELD    = "lesson_content_lesson_content_lessonTolesson";
      const contents = prev[FIELD];
      const idx      = contents.findIndex(c => c.id === contentId);
      if (idx === -1 || contents[idx].completed) return prev;
      const newCompleted = prev.progress.completed + 1;
      return {
        ...prev,
        [FIELD]: contents.map((c, i) => {
          if (i === idx)     return { ...c, completed: true, progress: 100 };
          if (i === idx + 1) return { ...c, isLocked: false };
          return c;
        }),
        progress: {
          ...prev.progress,
          completed:   newCompleted,
          percent:     Math.round((newCompleted / prev.progress.total) * 100),
          isCompleted: newCompleted === prev.progress.total,
        },
      };
    });
  }, []);

  const handleVideoComplete = useCallback((contentId) => {
    markContentComplete(contentId);
    axiosInstance.post("/user-content-progress", { content: contentId, progress: 100 }).catch(() => {});
  }, [markContentComplete]);

  const handlePdfComplete = useCallback((contentId) => {
    markContentComplete(contentId);
    axiosInstance.post("/user-content-progress", { content: contentId, progress: 100 }).catch(() => {});
  }, [markContentComplete]);

  const handleTestResult = useCallback((testId, resultData, selectedId) => {
    setLesson(prev => {
      if (!prev) return prev;
      const FIELD = "lesson_content_lesson_content_lessonTolesson";
      return {
        ...prev,
        [FIELD]: prev[FIELD].map((c, i) => {
          if (i !== currentContentIndex) return c;
          return {
            ...c,
            lesson_content_test: c.lesson_content_test.map(t => {
              if (t.test_id !== testId) return t;
              return {
                ...t,
                answered:     true,
                is_correct:   resultData.is_correct,
                score:        resultData.score,
                user_answers: [selectedId],
                answers:      t.answers.map(a => ({
                  ...a,
                  is_correct: resultData.correct_answer_ids
                    ? resultData.correct_answer_ids.some(cid => String(cid) === String(a.id))
                    : a.is_correct,
                })),
              };
            }),
          };
        }),
      };
    });
  }, [currentContentIndex]);

  const handleTestComplete = useCallback((contentId) => {
    setLesson(prev => {
      if (!prev) return prev;
      const FIELD    = "lesson_content_lesson_content_lessonTolesson";
      const contents = prev[FIELD];
      const idx      = contents.findIndex(c => c.id === contentId);
      if (idx === -1 || contents[idx].completed) return prev;
      const newCompleted = prev.progress.completed + 1;
      return {
        ...prev,
        [FIELD]: contents.map((c, i) => {
          if (i === idx)     return { ...c, completed: true, progress: 100 };
          if (i === idx + 1) return { ...c, isLocked: false };
          return c;
        }),
        progress: {
          ...prev.progress,
          completed:   newCompleted,
          percent:     Math.round((newCompleted / prev.progress.total) * 100),
          isCompleted: newCompleted === prev.progress.total,
        },
      };
    });
  }, []);

  /* ── Rating нэмэгдэхэд optimistic update ── */
  const handleRatingAdded = useCallback((newRating) => {
    setLesson(prev => {
      if (!prev) return prev;
      const FIELD   = "lesson_rating_lesson_rating_lessonTolesson";
      const ratings = [newRating, ...(prev[FIELD] || [])];
      const avg     = ratings.reduce((s, r) => s + r.rating, 0) / ratings.length;
      return {
        ...prev,
        [FIELD]:      ratings,
        avgRating:    Math.round(avg * 10) / 10,
        ratingCount:  ratings.length,
      };
    });
  }, []);

  const goToNext = useCallback(() => {
    const len = lesson?.lesson_content_lesson_content_lessonTolesson?.length || 0;
    setCurrentContentIndex(p => Math.min(p + 1, len - 1));
  }, [lesson]);

  const goToPrev = useCallback(() => {
    setCurrentContentIndex(p => Math.max(p - 1, 0));
  }, []);

  if (loading) return (
    <div className={css.loading}>
      <div className={css.loadingSpinner} />
      <span>Уншиж байна...</span>
    </div>
  );
  if (!lesson) return <div className={css.empty}>Хичээл олдсонгүй.</div>;

  const contents       = lesson.lesson_content_lesson_content_lessonTolesson || [];
  const currentContent = contents[currentContentIndex] || null;

  return (
    <div className={css.lessonDetail}>
      <div className={css.mainContent}>

        {/* ── SIDEBAR ── */}
        <div className={css.sidebar}>
          <div className={css.sidebarHeader}>
            <h3>Хөтөлбөр</h3>
            <span className={css.lessonCount}>{contents.length} хичээл</span>
          </div>

          <div className={css.lessonsList}>
            {contents.map((content, index) => (
              <button
                key={content.id}
                className={[
                  css.lessonItem,
                  currentContentIndex === index ? css.activeLessonItem : "",
                  content.completed ? css.completedLesson : "",
                  content.isLocked  ? css.lockedLesson    : "",
                ].filter(Boolean).join(" ")}
                onClick={() => { if (!content.isLocked) setCurrentContentIndex(index); }}
                disabled={content.isLocked}
              >
                <div className={css.lessonNumber}>{index + 1}</div>
                <div className={css.lessonInfo}>
                  <p className={css.lessonName}>{content.title}</p>
                  <div className={css.lessonMeta}>
                    {content.lesson_content_video?.length > 0 && <PlayCircle size={12} />}
                    {content.lesson_content_pdf?.length   > 0 && <FileText   size={12} />}
                    {content.lesson_content_image?.length > 0 && <Image      size={12} />}
                    {content.lesson_content_test?.length  > 0 && <Award      size={12} />}
                    <span>{content.progress || 0}%</span>
                  </div>
                </div>
                <div className={css.lessonStatus}>
                  {content.isLocked                          && <Lock        size={18} />}
                  {!content.isLocked &&  content.completed   && <CheckCircle size={18} className={css.completedIcon} />}
                  {!content.isLocked && !content.completed   && <Circle      size={18} />}
                </div>
              </button>
            ))}
          </div>

          <div className={css.courseStats}>
            <div className={css.statItem}>
              <BarChart3 size={20} />
              <div>
                <p className={css.statLabel}>Явц</p>
                <p className={css.statValue}>{lesson.progress?.percent || 0}%</p>
              </div>
            </div>
            <div className={css.statItem}>
              <CheckCircle size={20} />
              <div>
                <p className={css.statLabel}>Дууссан</p>
                <p className={css.statValue}>{lesson.progress?.completed || 0}/{lesson.progress?.total || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── CONTENT AREA ── */}
        <div className={css.contentArea}>
          {currentContent ? (
            <div className={css.playerSection}>

              {currentContent.lesson_content_video?.length > 0 && (
                <div className={css.videoSection}>
                  {currentContent.lesson_content_video.map(v => (
                    <VideoPlayer key={v.id} src={getUrl(v.video)}
                      completed={currentContent.completed}
                      onComplete={() => handleVideoComplete(currentContent.id)}
                    />
                  ))}
                </div>
              )}

              <div className={css.currentLessonHeader}>
                <div>
                  <h2 className={css.currentLessonTitle}>{currentContent.title}</h2>
                  <div className={css.breadcrumb}>
                    <span>{lesson.title}</span>
                    <ChevronRight size={14} />
                    <span className={css.breadcrumbActive}>Хичээл {currentContentIndex + 1}</span>
                  </div>
                </div>
                {currentContent.completed && (
                  <div className={css.completedBadge}><CheckCircle size={16} />Дууссан</div>
                )}
              </div>

              {currentContent.lesson_content_image?.length > 0 && (
                <div className={css.contentSection}>
                  <div className={css.sectionLabel}><Image size={16} />Зураг</div>
                  {currentContent.lesson_content_image.map(img => (
                    <div key={img.id} className={css.imageContainer}>
                      <img src={getUrl(img.file)} alt={img.alt || img.title || ""} className={css.contentImage} />
                      {img.title && <p className={css.imageTitle}>{img.title}</p>}
                    </div>
                  ))}
                </div>
              )}

              {currentContent.lesson_content_pdf?.length > 0 && (
                <div className={css.contentSection}>
                  {currentContent.lesson_content_pdf.map((pdf, i) => (
                    <PDFViewer key={pdf.id} fileUrl={getUrl(pdf.file)}
                      title={i === 0 ? "PDF Материал" : `PDF ${i + 1}`}
                      duration={300} completed={currentContent.completed}
                      onComplete={() => handlePdfComplete(currentContent.id)}
                    />
                  ))}
                </div>
              )}

              {currentContent.lesson_content_test?.length > 0 && (
                <ExamMake
                  tests={currentContent.lesson_content_test}
                  contentId={currentContent.id}
                  axiosInstance={axiosInstance}
                  getUrl={getUrl}
                  onTestResult={handleTestResult}
                  onComplete={handleTestComplete}
                />
              )}

              <div className={css.lessonNavigation}>
                <button className={css.navBtn} onClick={goToPrev} disabled={currentContentIndex === 0}>
                  <ChevronLeft size={20} /> Өмнөх
                </button>
                <button className={css.navBtn} onClick={goToNext} disabled={currentContentIndex === contents.length - 1}>
                  Дараагийн <ChevronRight size={20} />
                </button>
              </div>
            </div>
          ) : (
            <div className={css.empty}>Агуулга олдсонгүй.</div>
          )}

          {/* ── Tabs ── */}
          <div className={css.tabsSection}>
            <div className={css.tabs}>
              <button
                className={css.tab + (activeTab === "overview" ? " " + css.tabActive : "")}
                onClick={() => setActiveTab("overview")}
              >
                <BookOpen size={18} /> Тойм
              </button>
              <button
                className={css.tab + (activeTab === "rating" ? " " + css.tabActive : "")}
                onClick={() => setActiveTab("rating")}
              >
                <Star size={18} /> Үнэлгээ
                {(lesson.ratingCount || 0) > 0 && (
                  <span className={css.tabBadge}>{lesson.ratingCount}</span>
                )}
              </button>
            </div>

            <div className={css.tabContent}>
              {activeTab === "overview" && (
                <div className={css.overviewContent}>
                  <h3>{lesson.title}</h3>
                  <p>{lesson.description}</p>
                  <div className={css.lessonMetaRow}>
                    <div className={css.metaItem}><Clock size={16} /><span>{lesson.time} мин</span></div>
                    <div className={css.metaItem}>
                      <Star size={16} fill="#F59E0B" color="#F59E0B" />
                      <span>{Number(lesson.avgRating || 0).toFixed(1)} ({lesson.ratingCount || 0} үнэлгээ)</span>
                    </div>
                    <div className={css.metaItem}>
                      <BookOpen size={16} />
                      <span>{lesson._count?.lesson_content_lesson_content_lessonTolesson || 0} хичээл</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "rating" && (
                <RatingTab lesson={lesson} onRatingAdded={handleRatingAdded} />
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LessonDetail;