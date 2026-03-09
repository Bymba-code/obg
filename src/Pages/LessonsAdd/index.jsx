import React, { useState, useEffect } from "react";
import css from "./style.module.css";
import axiosInstance from "../../Services/Api/AxiosInstance";
import {
  BookOpen, ChevronRight, Home, Tag, Clock, Type, Users,
  AlignLeft, ImageIcon, AlertCircle, Plus, Trash2, Save,
  Loader, CheckCircle, Building2, Shield, X
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const TARGET_OPTIONS = [
  { value: "first_unit",  label: "1-р нэгж" },
  { value: "second_unit", label: "2-р нэгж" },
  { value: "third_unit",  label: "3-р нэгж" },
  { value: "fourth_unit", label: "4-р нэгж" },
  { value: "rank",        label: "Цол" },
  { value: "position",    label: "Албан тушаал" },
  { value: "user",        label: "Хэрэглэгч" },
];

const TARGET_ICON = {
  first_unit:  <Building2 size={12} />,
  second_unit: <Building2 size={12} />,
  third_unit:  <Building2 size={12} />,
  fourth_unit: <Building2 size={12} />,
  rank:        <Shield size={12} />,
  position:    <Shield size={12} />,
  user:        <Users size={12} />,
};

const LessonAdd = () => {
  const navigate = useNavigate();

  const [loading,      setLoading]      = useState(false);
  const [toast,        setToast]        = useState(null);
  const [categories,   setCategories]   = useState([]);
  const [firstUnits,   setFirstUnits]   = useState([]);
  const [secondUnits,  setSecondUnits]  = useState([]);
  const [thirdUnits,   setThirdUnits]   = useState([]);
  const [fourthUnits,  setFourthUnits]  = useState([]);
  const [ranks,        setRanks]        = useState([]);
  const [positions,    setPositions]    = useState([]);
  const [users,        setUsers]        = useState([]);

  const [form, setForm] = useState({
    category: "", title: "", instructor: "", time: "", description: "",
  });
  const [imageFile,    setImageFile]    = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [visibilities, setVisibilities] = useState([]);
  const [errors,       setErrors]       = useState({});

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [cat, fu, su, tu, fou, r, p, u] = await Promise.all([
          axiosInstance.get("/lesson-category"),
          axiosInstance.get("/first-units"),
          axiosInstance.get("/second-units"),
          axiosInstance.get("/third-units"),
          axiosInstance.get("/fourth-units"),
          axiosInstance.get("/rank"),
          axiosInstance.get("/positions"),
          axiosInstance.get("/users"),
        ]);
        if (cat?.status === 200) setCategories(cat.data.data  || []);
        if (fu?.status  === 200) setFirstUnits(fu.data.data   || []);
        if (su?.status  === 200) setSecondUnits(su.data.data  || []);
        if (tu?.status  === 200) setThirdUnits(tu.data.data   || []);
        if (fou?.status === 200) setFourthUnits(fou.data.data || []);
        if (r?.status   === 200) setRanks(r.data.data         || []);
        if (p?.status   === 200) setPositions(p.data.data     || []);
        if (u?.status   === 200) setUsers(u.data.data         || []);
      } catch (err) {
        console.error(err);
        showToast("error", "Мэдээлэл татахад алдаа гарлаа");
      }
    };
    fetchAll();
  }, []);

  const getOptions = (target) => {
    switch (target) {
      case "first_unit":  return firstUnits.map(e  => ({ value: e.id, label: e.name }));
      case "second_unit": return secondUnits.map(e => ({ value: e.id, label: e.name }));
      case "third_unit":  return thirdUnits.map(e  => ({ value: e.id, label: e.name }));
      case "fourth_unit": return fourthUnits.map(e => ({ value: e.id, label: e.name }));
      case "rank":        return ranks.map(e        => ({ value: e.id, label: e.name }));
      case "position":    return positions.map(e    => ({ value: e.id, label: e.name }));
      case "user":        return users.map(e        => ({
        value: e.id,
        label: ((e.firstname || "") + " " + (e.lastname || "")).trim() || e.kode,
      }));
      default: return [];
    }
  };

  const addVis    = ()        => setVisibilities(p => [...p, { target: "", requirement: "" }]);
  const removeVis = (i)       => setVisibilities(p => p.filter((_, idx) => idx !== i));
  const changeVis = (i, k, v) => setVisibilities(p =>
    p.map((row, idx) =>
      idx === i ? { ...row, [k]: v, ...(k === "target" ? { requirement: "" } : {}) } : row
    )
  );

  const validate = () => {
    const e = {};
    if (!form.category)           e.category    = "Ангилал сонгоно уу";
    if (!form.title.trim())       e.title       = "Нэр оруулна уу";
    if (!form.description.trim()) e.description = "Тайлбар оруулна уу";
    if (!imageFile)               e.image       = "Зураг оруулна уу";
    visibilities.forEach((v, i) => { if (!v.target) e[`vis_${i}`] = "Төрөл сонгоно уу"; });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) { showToast("error", "Мэдээллээ бүрэн бөглөнө үү"); return; }
    setLoading(true);
    try {
      const cleanVis = visibilities
        .filter(v => v.target)
        .map(v => ({ target: v.target, requirement: v.requirement || null }));

      const fd = new FormData();
      fd.append("category",    form.category);
      fd.append("title",       form.title.trim());
      fd.append("instructor",  form.instructor.trim());
      fd.append("description", form.description.trim());
      if (form.time) fd.append("time", form.time);
      fd.append("file", imageFile);
      if (cleanVis.length > 0) fd.append("visibilities", JSON.stringify(cleanVis));

      const res = await axiosInstance.post("/lesson", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res?.status === 201 || res?.status === 200) {
        const newId = res.data.data?.id;
        showToast("success", "Хичээл амжилттай нэмэгдлээ");
        setTimeout(() => {
          if (newId) navigate(`/lessons-edit/${newId}`);
          else navigate("/lessons-list");
        }, 800);
      }
    } catch (err) {
      showToast("error", err?.response?.data?.message || "Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={css.lessonDetail}>
      {/* Toast */}
      {toast && (
        <div className={`${css.editToast} ${toast.type === "success" ? css.editToastSuccess : css.editToastError}`}>
          {toast.type === "success" ? <CheckCircle size={17} /> : <AlertCircle size={17} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Breadcrumb */}
      <div className={css.editBreadcrumb}>
        <span className={css.editBcItem} onClick={() => navigate("/")}><Home size={14} /> Нүүр</span>
        <ChevronRight size={13} color="var(--ink-4)" />
        <span className={css.editBcItem} onClick={() => navigate("/lessons-list")}><BookOpen size={14} /> Хичээлийн жагсаалт</span>
        <ChevronRight size={13} color="var(--ink-4)" />
        <span className={`${css.editBcItem} ${css.editBcActive}`}><Plus size={14} /> Хичээл нэмэх</span>
      </div>

      <div className={css.mainContent}>
        {/* ── SIDEBAR ── */}
        <div className={css.sidebar}>
          <div className={css.sidebarHeader}>
            <h3>Хичээл нэмэх</h3>
            <span className={css.lessonCount}>Шинэ</span>
          </div>

          <div style={{ padding: "1.125rem 1.125rem", flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* Step indicators */}
            {[
              { label: "Үндсэн мэдээлэл",  done: !!(form.category && form.title && form.instructor) },
              { label: "Зураг",             done: !!imageFile },
              { label: "Тайлбар",           done: !!form.description.trim() },
              { label: "Хамрах хүрээ",      done: true },
            ].map((step, i) => (
              <div
                key={i}
                style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "10px 12px",
                  background: step.done ? "var(--or-light)" : "var(--g50)",
                  border: `1px solid ${step.done ? "var(--or-border)" : "var(--g200)"}`,
                  borderRadius: "var(--r-md)", transition: "all .2s",
                }}
              >
                <div style={{
                  width: 24, height: 24, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: step.done ? "var(--or)" : "var(--g200)",
                  color: step.done ? "white" : "var(--g400)",
                  fontSize: 11, fontWeight: 800, flexShrink: 0,
                  transition: "all .2s",
                }}>
                  {step.done ? <CheckCircle size={13} /> : i + 1}
                </div>
                <span style={{
                  fontSize: 13, fontWeight: 600,
                  color: step.done ? "var(--or)" : "var(--g500)",
                  transition: "color .2s",
                }}>
                  {step.label}
                </span>
              </div>
            ))}

            {/* Info box */}
            <div style={{
              marginTop: "auto",
              padding: "12px 14px",
              background: "var(--g50)",
              border: "1px solid var(--g200)",
              borderRadius: "var(--r-md)",
              fontSize: 12, color: "var(--g500)", lineHeight: 1.65,
            }}>
              <p style={{ margin: "0 0 4px", fontWeight: 700, color: "var(--g700)" }}>Дараагийн алхам</p>
              Хичээл хадгалагдсаны дараа агуулга нэмэх боломжтой болно.
            </div>
          </div>
        </div>

        {/* ── CONTENT AREA ── */}
        <div className={css.contentArea}>
          <div className={css.playerSection}>
            <div className={css.currentLessonHeader}>
              <div>
                <h2 className={css.currentLessonTitle}>Шинэ хичээл нэмэх</h2>
                <div className={css.breadcrumb}>
                  <span>Хичээлийн мэдээлэл оруулна уу</span>
                  <ChevronRight size={14} />
                  <span className={css.breadcrumbActive}>Шинэ хичээл</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Meta fields */}
              <div className={css.contentSection}>
                <div className={css.sectionLabel}><Tag size={16} /> Үндсэн мэдээлэл</div>
                <div className={css.fGrid2}>
                  <div className={css.fGroup}>
                    <label className={css.fLabel}><Tag size={13} /> Ангилал <span className={css.fReq}>*</span></label>
                    <select
                      value={form.category}
                      onChange={e => { setForm(p => ({ ...p, category: e.target.value })); setErrors(p => ({ ...p, category: "" })); }}
                      className={`${css.fSelect} ${errors.category ? css.fErr : ""}`}
                    >
                      <option value="">— Сонгох —</option>
                      {categories.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
                    </select>
                    {errors.category && <span className={css.fErrMsg}>{errors.category}</span>}
                  </div>
                  <div className={css.fGroup}>
                    <label className={css.fLabel}><Clock size={13} /> Хугацаа (мин)</label>
                    <input
                      type="number" min="1" value={form.time}
                      placeholder="60"
                      onChange={e => setForm(p => ({ ...p, time: e.target.value }))}
                      className={css.fInput}
                    />
                  </div>
                </div>
                <div className={css.fGroup}>
                  <label className={css.fLabel}><Type size={13} /> Хичээлийн нэр <span className={css.fReq}>*</span></label>
                  <input
                    type="text" value={form.title} placeholder="Хичээлийн нэр"
                    onChange={e => { setForm(p => ({ ...p, title: e.target.value })); setErrors(p => ({ ...p, title: "" })); }}
                    className={`${css.fInput} ${errors.title ? css.fErr : ""}`}
                  />
                  {errors.title && <span className={css.fErrMsg}>{errors.title}</span>}
                </div>
                <div className={css.fGroup}>
                  <label className={css.fLabel}><Users size={13} /> Багш / Зохиогч</label>
                  <input
                    type="text" value={form.instructor} placeholder="Багшийн нэр"
                    onChange={e => setForm(p => ({ ...p, instructor: e.target.value }))}
                    className={css.fInput}
                  />
                </div>
                <div className={css.fGroup}>
                  <label className={css.fLabel}><AlignLeft size={13} /> Тайлбар <span className={css.fReq}>*</span></label>
                  <textarea
                    value={form.description} rows={4} placeholder="Хичээлийн товч тайлбар..."
                    onChange={e => { setForm(p => ({ ...p, description: e.target.value })); setErrors(p => ({ ...p, description: "" })); }}
                    className={`${css.fTextarea} ${errors.description ? css.fErr : ""}`}
                  />
                  {errors.description && <span className={css.fErrMsg}>{errors.description}</span>}
                </div>
              </div>

              {/* Image */}
              <div className={css.contentSection}>
                <div className={css.sectionLabel}><ImageIcon size={16} /> Зураг <span className={css.fReq}>*</span></div>
                <label className={`${css.fileDropZone} ${errors.image ? css.fErr : ""}`}>
                  {imagePreview ? (
                    <div className={css.imgPreviewWrap}>
                      <img src={imagePreview} alt="preview" className={css.imgPreview} />
                      <div className={css.imgOverlay}><span>Зураг солих</span></div>
                    </div>
                  ) : (
                    <div className={css.fileDropContent}>
                      <ImageIcon size={30} strokeWidth={1.5} color="#D1D5DB" />
                      <p>Зураг оруулах</p>
                      <span>PNG, JPG, WEBP</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={e => {
                    const f = e.target.files[0];
                    if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); setErrors(p => ({ ...p, image: "" })); }
                  }} style={{ display: "none" }} />
                </label>
                {imageFile && <span className={css.newTag}>✓ Зураг: {imageFile.name}</span>}
                {errors.image && <span className={css.fErrMsg}>{errors.image}</span>}
              </div>

              {/* Visibility */}
              <div className={css.contentSection}>
                <div className={css.sectionLabel}><Users size={16} /> Хамрах хүрээ</div>
                <div className={css.visInfoBox}>
                  <AlertCircle size={14} />
                  <span>Тодорхойлохгүй бол <strong>бүх хэрэглэгчид</strong> харагдана.</span>
                </div>
                {visibilities.map((vis, idx) => {
                  const opts = getOptions(vis.target);
                  return (
                    <div key={idx} className={css.visRow}>
                      <span className={css.visIdx}>{idx + 1}</span>
                      <div style={{ flex: 1 }}>
                        <select
                          value={vis.target}
                          onChange={e => changeVis(idx, "target", e.target.value)}
                          className={`${css.fSelect} ${errors[`vis_${idx}`] ? css.fErr : ""}`}
                        >
                          <option value="">Төрөл сонгоно уу</option>
                          {TARGET_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                      <div style={{ flex: 1 }}>
                        <select
                          value={vis.requirement}
                          onChange={e => changeVis(idx, "requirement", e.target.value)}
                          disabled={!vis.target || opts.length === 0}
                          className={css.fSelect}
                        >
                          <option value="">Бүгд</option>
                          {opts.map(o => <option key={o.value} value={String(o.value)}>{o.label}</option>)}
                        </select>
                      </div>
                      <button type="button" className={css.visDelBtn} onClick={() => removeVis(idx)}><Trash2 size={14} /></button>
                    </div>
                  );
                })}
                <button type="button" className={css.addVisBtn} onClick={addVis}><Plus size={14} /> Нөхцөл нэмэх</button>
                {visibilities.some(v => v.target) && (
                  <div className={css.previewTags}>
                    {visibilities.filter(v => v.target).map((v, i) => {
                      const tLabel = TARGET_OPTIONS.find(t => t.value === v.target)?.label;
                      const opts   = getOptions(v.target);
                      const rLabel = v.requirement
                        ? opts.find(o => String(o.value) === String(v.requirement))?.label || v.requirement
                        : "Бүгд";
                      return (
                        <span key={i} className={css.previewTag}>
                          {TARGET_ICON[v.target]} {tLabel}: {rLabel}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className={css.lessonNavigation}>
                <button
                  type="button"
                  className={css.navBtn}
                  onClick={() => navigate("/lessons-list")}
                  disabled={loading}
                >
                  <X size={16} /> Болих
                </button>
                <button type="submit" className={css.completeBtn} disabled={loading}>
                  {loading
                    ? <><Loader size={16} className={css.spinnerInline} /> Нэмж байна...</>
                    : <><Save size={16} /> Хичээл нэмэх</>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonAdd;