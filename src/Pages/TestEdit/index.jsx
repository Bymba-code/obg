import React, { useState, useEffect } from "react";
import css from "./style.module.css";
import axiosInstance from "../../Services/Api/AxiosInstance";
import {
  CheckCircle, ChevronRight, Tag, Type, ImageIcon,
  Plus, Trash2, Save, Loader, AlertCircle,
  Home, RefreshCw, Edit3, TestTube, X,
  BarChart3, Star
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

/* ─── helpers ─── */
const BASE_URL = "http://localhost:3000";
const getUrl = (path) => {
  if (!path) return "";
  const clean = path.replace(/\\/g, "/");
  if (clean.startsWith("http")) return clean;
  return BASE_URL + (clean.startsWith("/") ? clean : "/" + clean);
};

/* ══════════════════════════════════════════════════
   Toast
══════════════════════════════════════════════════ */
const Toast = ({ toast }) => {
  if (!toast) return null;
  return (
    <div className={`${css.editToast} ${toast.type === "success" ? css.editToastSuccess : css.editToastError}`}>
      {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
      <span>{toast.msg}</span>
    </div>
  );
};

/* ══════════════════════════════════════════════════
   AnswerEditor — нэг хариулт засах
══════════════════════════════════════════════════ */
const AnswerEditor = ({ answer, onUpdate, onDelete, showToast }) => {
  const [saving,     setSaving]     = useState(false);
  const [localTitle, setLocalTitle] = useState(answer.title || "");
  const [isSuccess,  setIsSuccess]  = useState(answer.isSuccess === true);

  /* Хариулт хадгалах */
  const save = async (overrideSuccess) => {
    const titleVal   = localTitle.trim();
    const successVal = overrideSuccess !== undefined ? overrideSuccess : isSuccess;

    if (!titleVal) { showToast("error", "Хариулт хоосон байна"); return; }
    setSaving(true);
    try {
      await axiosInstance.put(`/test-answers/${answer.id}`, {
        title:     titleVal,
        isSuccess: successVal,
      });
      onUpdate(answer.id, { title: titleVal, isSuccess: successVal });
      showToast("success", "Хариулт хадгалагдлаа");
    } catch { showToast("error", "Хадгалахад алдаа гарлаа"); }
    finally { setSaving(false); }
  };

  /* Хариулт устгах */
  const remove = async () => {
    if (!window.confirm("Энэ хариултыг устгах уу?")) return;
    try {
      await axiosInstance.delete(`/test-answers/${answer.id}`);
      onDelete(answer.id);
      showToast("success", "Хариулт устгагдлаа");
    } catch { showToast("error", "Устгахад алдаа гарлаа"); }
  };

  /* Зөв/буруу toggle */
  const toggleSuccess = () => {
    const next = !isSuccess;
    setIsSuccess(next);
    save(next);
  };

  return (
    <div className={css.playerSection}>
      {/* Header */}
      <div className={css.currentLessonHeader}>
        <div style={{ flex: 1 }}>
          <div className={css.editorTitleRow}>
            <Edit3 size={16} color="var(--or)" style={{ flexShrink: 0 }} />
            <input
              className={css.editorTitleInput}
              value={localTitle}
              onChange={e => setLocalTitle(e.target.value)}
              onBlur={() => save()}
              onKeyDown={e => e.key === "Enter" && (e.preventDefault(), save())}
              placeholder="Хариултын текст..."
            />
            {saving && <Loader size={14} className={css.spinnerInline} />}
          </div>
          <div className={css.breadcrumb}>
            <span>Хариулт засах</span>
            <ChevronRight size={12} />
            <span className={css.breadcrumbActive}>ID: {answer.id}</span>
          </div>
        </div>
        <button className={css.deleteLessonBtn} onClick={remove} title="Устгах">
          <Trash2 size={15} />
        </button>
      </div>

      {/* Зөв / Буруу toggle */}
      <div className={css.contentSection}>
        <div className={css.sectionLabel}>
          <CheckCircle size={14} /> Хариултын төрөл
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {/* Зөв */}
          <button
            onClick={() => !isSuccess && toggleSuccess()}
            style={{
              flex: 1, minWidth: 140,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "14px 20px",
              border: `2px solid ${isSuccess ? "var(--gr)" : "var(--g200)"}`,
              borderRadius: "var(--r-lg)",
              background: isSuccess ? "var(--gr-light)" : "var(--g50)",
              color: isSuccess ? "var(--gr)" : "var(--g400)",
              fontWeight: 700, fontSize: 14,
              cursor: isSuccess ? "default" : "pointer",
              transition: "all .18s",
              fontFamily: "inherit",
            }}
          >
            <CheckCircle size={18} />
            Зөв хариулт
            {isSuccess && (
              <span style={{ marginLeft: 4, fontSize: 11, background: "var(--gr)", color: "white", borderRadius: 20, padding: "2px 8px" }}>
                Сонгогдсон
              </span>
            )}
          </button>

          {/* Буруу */}
          <button
            onClick={() => isSuccess && toggleSuccess()}
            style={{
              flex: 1, minWidth: 140,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "14px 20px",
              border: `2px solid ${!isSuccess ? "var(--re)" : "var(--g200)"}`,
              borderRadius: "var(--r-lg)",
              background: !isSuccess ? "var(--re-light)" : "var(--g50)",
              color: !isSuccess ? "var(--re)" : "var(--g400)",
              fontWeight: 700, fontSize: 14,
              cursor: !isSuccess ? "default" : "pointer",
              transition: "all .18s",
              fontFamily: "inherit",
            }}
          >
            <X size={18} />
            Буруу хариулт
            {!isSuccess && (
              <span style={{ marginLeft: 4, fontSize: 11, background: "var(--re)", color: "white", borderRadius: 20, padding: "2px 8px" }}>
                Сонгогдсон
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Тайлбар */}
      <div className={css.contentSection} style={{ borderBottom: "none" }}>
        <div
          style={{
            display: "flex", alignItems: "flex-start", gap: 10,
            padding: "12px 16px",
            background: isSuccess ? "var(--gr-light)" : "var(--re-light)",
            border: `1px solid ${isSuccess ? "var(--gr-border)" : "var(--re-border)"}`,
            borderRadius: "var(--r-md)",
            fontSize: 13, fontWeight: 500,
            color: isSuccess ? "#065F46" : "#7F1D1D",
          }}
        >
          {isSuccess
            ? <><CheckCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} /> Энэ нь <strong>зөв хариулт</strong> болно. Хэрэглэгч энэ хариултыг сонговол оноо авна.</>
            : <><X size={15} style={{ flexShrink: 0, marginTop: 1 }} /> Энэ нь <strong>буруу хариулт</strong> болно. Хэрэглэгч энэ хариултыг сонговол оноо авахгүй.</>
          }
        </div>
      </div>

      <div className={css.lessonNavigation}>
        <p style={{ fontSize: 12, color: "var(--g400)", margin: 0 }}>
          💡 Гарчигт Enter дарах эсвэл хулганаа хөдөлгөхөд автоматаар хадгалагдана
        </p>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════
   TestInfoEditor — тестийн үндсэн мэдээлэл засах
══════════════════════════════════════════════════ */
const TestInfoEditor = ({ test, categories, onSaved, showToast, id }) => {
  const [loading,      setLoading]      = useState(false);
  const [form,         setForm]         = useState({
    category: test.category ? String(test.category) : "",
    name:     test.name     || "",
  });
  const [imageFile,    setImageFile]    = useState(null);
  const [imagePreview, setImagePreview] = useState(test.img ? getUrl(test.img) : null);
  const [errors,       setErrors]       = useState({});

  const validate = () => {
    const e = {};
    if (!form.category)    e.category = "Ангилал сонгоно уу";
    if (!form.name.trim()) e.name     = "Тестийн нэр оруулна уу";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) { showToast("error", "Мэдээллээ бүрэн бөглөнө үү"); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("category", form.category);
      fd.append("name",     form.name.trim());
      if (imageFile) fd.append("file", imageFile);

      const res = await axiosInstance.put(`/test/${id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res?.status === 200) {
        showToast("success", "Тест амжилттай шинэчлэгдлээ");
        onSaved?.(form);
      }
    } catch (err) {
      showToast("error", err?.response?.data?.message || "Алдаа гарлаа");
    } finally { setLoading(false); }
  };

  return (
    <div className={css.playerSection}>
      <div className={css.currentLessonHeader}>
        <div>
          <h2 className={css.currentLessonTitle}>Тестийн мэдээлэл засах</h2>
          <div className={css.breadcrumb}>
            <span>Үндсэн тохиргоо</span>
            <ChevronRight size={12} />
            <span className={css.breadcrumbActive}>Тест #{id}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Үндсэн мэдээлэл */}
        <div className={css.contentSection}>
          <div className={css.sectionLabel}><Tag size={14} /> Үндсэн мэдээлэл</div>

          <div className={css.fGroup}>
            <label className={css.fLabel}><Tag size={12} /> Ангилал <span className={css.fReq}>*</span></label>
            <select
              value={form.category}
              onChange={e => { setForm(p => ({ ...p, category: e.target.value })); setErrors(p => ({ ...p, category: "" })); }}
              className={`${css.fSelect} ${errors.category ? css.fErr : ""}`}
            >
              <option value="">— Ангилал сонгох —</option>
              {categories.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
            </select>
            {errors.category && <span className={css.fErrMsg}>{errors.category}</span>}
          </div>

          <div className={css.fGroup}>
            <label className={css.fLabel}><Type size={12} /> Тестийн нэр <span className={css.fReq}>*</span></label>
            <input
              type="text"
              value={form.name}
              placeholder="Тестийн нэр..."
              onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setErrors(p => ({ ...p, name: "" })); }}
              className={`${css.fInput} ${errors.name ? css.fErr : ""}`}
            />
            {errors.name && <span className={css.fErrMsg}>{errors.name}</span>}
          </div>
        </div>

        {/* Зураг */}
        <div className={css.contentSection}>
          <div className={css.sectionLabel}><ImageIcon size={14} /> Тестийн зураг</div>
          <label className={css.fileDropZone}>
            {imagePreview ? (
              <div className={css.imgPreviewWrap}>
                <img src={imagePreview} alt="preview" className={css.imgPreview} onError={e => e.target.style.display = "none"} />
                <div className={css.imgOverlay}><span>Зураг солих</span></div>
              </div>
            ) : (
              <div className={css.fileDropContent}>
                <ImageIcon size={28} strokeWidth={1.4} color="#9CA3AF" />
                <p>Зураг оруулах</p>
                <span>PNG, JPG, WEBP</span>
              </div>
            )}
            <input
              type="file" accept="image/*"
              onChange={e => { const f = e.target.files[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); } }}
              style={{ display: "none" }}
            />
          </label>
          {imageFile && <span className={css.newTag}>✓ Шинэ зураг: {imageFile.name}</span>}
        </div>

        <div className={css.lessonNavigation}>
          <button type="submit" className={css.completeBtn} disabled={loading}>
            {loading
              ? <><Loader size={15} className={css.spinnerInline} /> Хадгалж байна...</>
              : <><Save size={15} /> Хадгалах</>}
          </button>
        </div>
      </form>
    </div>
  );
};

/* ══════════════════════════════════════════════════
   MAIN: TestEdit
══════════════════════════════════════════════════ */
const TestEdit = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [test,       setTest]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [toast,      setToast]      = useState(null);
  const [categories, setCategories] = useState([]);
  const [answers,    setAnswers]    = useState([]);

  const [selectedIdx,     setSelectedIdx]     = useState("info");
  const [newAnswerTitle,  setNewAnswerTitle]   = useState("");
  const [addingAnswer,    setAddingAnswer]     = useState(false);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4500);
  };

  /* ── Fetch ── */
  useEffect(() => {
    (async () => {
      try {
        const [catRes, testRes] = await Promise.all([
          axiosInstance.get("/test-category"),
          axiosInstance.get(`/test/${id}`),
        ]);

        if (catRes?.status  === 200) setCategories(catRes.data.data || []);
        if (testRes?.status === 200) {
          const d = testRes.data.data;
          setTest(d);

          /* ✅ API-ын field нэрийг зөв авна */
          const raw = d.test_answers_test_answers_testTotest
            || d.test_answers
            || [];

          setAnswers(raw.map(a => ({
            id:        a.id,
            title:     a.title     || "",
            isSuccess: a.isSuccess === true,
          })));
        }
      } catch { showToast("error", "Мэдээлэл татахад алдаа гарлаа"); }
      finally { setLoading(false); }
    })();
  }, [id]);

  /* ── Answer CRUD handlers ── */
  const handleAnswerUpdate = (answerId, patch) => {
    setAnswers(p => p.map(a => a.id === answerId ? { ...a, ...patch } : a));
  };

  const handleAnswerDelete = (answerId) => {
    const idx = answers.findIndex(a => a.id === answerId);
    setAnswers(p => p.filter(a => a.id !== answerId));
    if (selectedIdx === idx) setSelectedIdx("info");
  };

  const addAnswer = async () => {
    if (!newAnswerTitle.trim()) { showToast("error", "Хариулт хоосон байна"); return; }
    setAddingAnswer(true);
    try {
      const res = await axiosInstance.post("/test-answers", {
        test:      Number(id),
        title:     newAnswerTitle.trim(),
        isSuccess: false,
      });
      if (res?.status === 200 || res?.status === 201) {
        const nc = res.data.data;
        const newLen = answers.length;
        setAnswers(p => [...p, { id: nc.id, title: nc.title || "", isSuccess: nc.isSuccess === true }]);
        setNewAnswerTitle("");
        setSelectedIdx(newLen);
        showToast("success", "Хариулт нэмэгдлээ");
      }
    } catch (err) {
      showToast("error", err?.response?.data?.message || "Хариулт нэмэхэд алдаа");
    } finally { setAddingAnswer(false); }
  };

  /* ── Loading / Empty states ── */
  if (loading) return (
    <div className={css.lessonDetail}>
      <div className={css.loading}><div className={css.loadingSpinner} /><span>Тестийн мэдээлэл татаж байна...</span></div>
    </div>
  );
  if (!test) return (
    <div className={css.lessonDetail}><div className={css.empty}>Тест олдсонгүй.</div></div>
  );

  /* ── Derived state ── */
  const currentAnswer  = selectedIdx !== "info" ? answers[selectedIdx] : null;
  const correctCount   = answers.filter(a =>  a.isSuccess).length;
  const incorrectCount = answers.filter(a => !a.isSuccess).length;

  return (
    <div className={css.lessonDetail}>
      <Toast toast={toast} />

      {/* Breadcrumb */}
      <div className={css.editBreadcrumb}>
        <span className={css.editBcItem} onClick={() => navigate("/")}><Home size={13} /> Нүүр</span>
        <ChevronRight size={12} color="var(--g300)" />
        <span className={css.editBcItem} onClick={() => navigate("/test-list")}><TestTube size={13} /> Тестийн жагсаалт</span>
        <ChevronRight size={12} color="var(--g300)" />
        <span className={`${css.editBcItem} ${css.editBcActive}`}><RefreshCw size={13} /> Тест засах</span>
      </div>

      <div className={css.mainContent}>

        {/* ══════════ SIDEBAR ══════════ */}
        <div className={css.sidebar}>

          {/* Header */}
          <div className={css.sidebarHeader}>
            <h3>Тест засах</h3>
            <span className={css.lessonCount}>#{id}</span>
          </div>

          {/* Stat chips */}
          <div className={css.editStatsGrid}>
            <div className={css.editStatCard}>
              <BarChart3 size={14} />
              <span>{answers.length}</span>
              <small>Нийт</small>
            </div>
            <div className={css.editStatCard}>
              <CheckCircle size={14} style={{ color: "var(--gr)" }} />
              <span style={{ color: "var(--gr)" }}>{correctCount}</span>
              <small>Зөв</small>
            </div>
            <div className={css.editStatCard}>
              <X size={14} style={{ color: "var(--re)" }} />
              <span style={{ color: "var(--re)" }}>{incorrectCount}</span>
              <small>Буруу</small>
            </div>
            <div className={css.editStatCard}>
              <Tag size={14} />
              <span style={{ fontSize: 11, textAlign: "center", lineHeight: 1.2 }}>
                {test.test_category?.name || "—"}
              </span>
              <small>Ангилал</small>
            </div>
          </div>

          {/* List */}
          <div className={css.lessonsList}>

            {/* Info item */}
            <button
              className={`${css.lessonItem} ${selectedIdx === "info" ? css.activeLessonItem : ""}`}
              onClick={() => setSelectedIdx("info")}
            >
              <div className={css.lessonNumber} style={selectedIdx === "info" ? { background: "var(--or)", color: "white", borderColor: "var(--or)" } : {}}>
                <Edit3 size={13} />
              </div>
              <div className={css.lessonInfo}>
                <p className={css.lessonName}>Үндсэн мэдээлэл</p>
                <div className={css.lessonMeta}><Tag size={10} /><span>{test.test_category?.name || "Ангилал"}</span></div>
              </div>
              <div className={css.lessonStatus}><ChevronRight size={14} /></div>
            </button>

            <div className={css.sidebarDivider}><span>Хариултууд ({answers.length})</span></div>

            {/* Answer items */}
            {answers.map((answer, index) => {
              const isActive = selectedIdx === index;
              return (
                <button
                  key={answer.id}
                  className={`${css.lessonItem} ${isActive ? css.activeLessonItem : ""}`}
                  onClick={() => setSelectedIdx(index)}
                >
                  <div
                    className={css.lessonNumber}
                    style={isActive
                      ? { background: "var(--or)", color: "white", borderColor: "var(--or)" }
                      : answer.isSuccess
                        ? { background: "var(--gr-light)", borderColor: "var(--gr-border)", color: "var(--gr)" }
                        : {}
                    }
                  >
                    {isActive ? index + 1 : answer.isSuccess ? <CheckCircle size={13} /> : index + 1}
                  </div>
                  <div className={css.lessonInfo}>
                    <p className={css.lessonName}>{answer.title || "Хариулт"}</p>
                    <div className={css.lessonMeta}>
                      {answer.isSuccess
                        ? <><CheckCircle size={10} style={{ color: "var(--gr)" }} /><span style={{ color: "var(--gr)" }}>Зөв хариулт</span></>
                        : <><X size={10} style={{ color: "var(--re)" }} /><span style={{ color: "var(--re)" }}>Буруу хариулт</span></>
                      }
                    </div>
                  </div>
                  <div className={css.lessonStatus}><ChevronRight size={14} /></div>
                </button>
              );
            })}

            {answers.length === 0 && (
              <div style={{ padding: "28px 12px", textAlign: "center", color: "var(--g400)", fontSize: 13, fontStyle: "italic" }}>
                Хариулт байхгүй байна<br />
                <span style={{ fontSize: 11 }}>Доороос нэмнэ үү</span>
              </div>
            )}
          </div>

          {/* Add answer */}
          <div className={css.addContentArea}>
            <input
              className={css.addContentInput}
              value={newAnswerTitle}
              onChange={e => setNewAnswerTitle(e.target.value)}
              onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addAnswer())}
              placeholder="Шинэ хариулт нэмэх..."
            />
            <button
              className={css.addContentBtn}
              onClick={addAnswer}
              disabled={addingAnswer || !newAnswerTitle.trim()}
            >
              {addingAnswer ? <Loader size={14} className={css.spinnerInline} style={{ color: "white" }} /> : <Plus size={14} />}
            </button>
          </div>

          {/* Bottom stats */}
          <div className={css.courseStats}>
            <div className={css.statItem}>
              <CheckCircle size={18} style={{ color: "var(--gr)" }} />
              <div>
                <p className={css.statLabel}>Зөв хариулт</p>
                <p className={css.statValue}>{correctCount} ширхэг</p>
              </div>
            </div>
            <div className={css.statItem}>
              <X size={18} style={{ color: "var(--re)" }} />
              <div>
                <p className={css.statLabel}>Буруу хариулт</p>
                <p className={css.statValue}>{incorrectCount} ширхэг</p>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════ CONTENT AREA ══════════ */}
        <div className={css.contentArea}>
          {selectedIdx === "info" ? (
            <TestInfoEditor
              test={test}
              categories={categories}
              showToast={showToast}
              id={id}
              onSaved={form => setTest(p => ({ ...p, ...form }))}
            />
          ) : currentAnswer ? (
            <AnswerEditor
              answer={currentAnswer}
              onUpdate={handleAnswerUpdate}
              onDelete={handleAnswerDelete}
              showToast={showToast}
            />
          ) : (
            <div className={css.playerSection}>
              <div className={css.empty}>Хариулт сонгоно уу.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestEdit;