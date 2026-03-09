import React, { useState, useEffect } from "react";
import css from "./style.module.css";
import axiosInstance from "../../Services/Api/AxiosInstance";
import {
  Newspaper, ChevronRight, Home, Loader,
  CheckCircle, AlertCircle, FileText, Tag,
  ImageIcon, Star, Type, AlignLeft,
  Plus, Trash2, Users, Building2, Shield,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ── Constants ─────────────────────────────────────────── */
const TARGET_OPTIONS = [
  { value: "first_unit",  label: "1-р нэгж"     },
  { value: "second_unit", label: "2-р нэгж"     },
  { value: "third_unit",  label: "3-р нэгж"     },
  { value: "fourth_unit", label: "4-р нэгж"     },
  { value: "rank",        label: "Цол"          },
  { value: "position",    label: "Албан тушаал" },
  { value: "user",        label: "Хэрэглэгч"   },
];

const TARGET_ICON = {
  first_unit:  <Building2 size={12} />,
  second_unit: <Building2 size={12} />,
  third_unit:  <Building2 size={12} />,
  fourth_unit: <Building2 size={12} />,
  rank:        <Shield    size={12} />,
  position:    <Shield    size={12} />,
  user:        <Users     size={12} />,
};

const EMPTY_VIS = { target: "", requirement: "" };

/* ── Component ─────────────────────────────────────────── */
const NewsAdd = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast,   setToast]   = useState(null);

  /* lookup data */
  const [categories,  setCategories]  = useState([]);
  const [firstUnits,  setFirstUnits]  = useState([]);
  const [secondUnits, setSecondUnits] = useState([]);
  const [thirdUnits,  setThirdUnits]  = useState([]);
  const [fourthUnits, setFourthUnits] = useState([]);
  const [ranks,       setRanks]       = useState([]);
  const [positions,   setPositions]   = useState([]);
  const [users,       setUsers]       = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [cat, fu, su, tu, fou, r, p, u] = await Promise.all([
          axiosInstance.get("/news-category"),
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
      } catch (err) { console.error(err); }
    })();
  }, []);

  const getOptions = (target) => {
    switch (target) {
      case "first_unit":  return firstUnits.map(e  => ({ value: e.id, label: e.name }));
      case "second_unit": return secondUnits.map(e => ({ value: e.id, label: e.name }));
      case "third_unit":  return thirdUnits.map(e  => ({ value: e.id, label: e.name }));
      case "fourth_unit": return fourthUnits.map(e => ({ value: e.id, label: e.name }));
      case "rank":        return ranks.map(e       => ({ value: e.id, label: e.name }));
      case "position":    return positions.map(e   => ({ value: e.id, label: e.name }));
      case "user":        return users.map(e       => ({
        value: e.id,
        label: ((e.firstname || "") + " " + (e.lastname || "")).trim() || e.kode,
      }));
      default: return [];
    }
  };

  /* form state */
  const [form,         setForm]         = useState({ category: "", title: "", description: "", feature: false });
  const [imageFile,    setImageFile]    = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [visibilities, setVisibilities] = useState([]);
  const [errors,       setErrors]       = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: "" }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    if (errors.image) setErrors(p => ({ ...p, image: "" }));
  };

  const addVis     = ()          => setVisibilities(p => [...p, { ...EMPTY_VIS }]);
  const removeVis  = (i)         => setVisibilities(p => p.filter((_, idx) => idx !== i));
  const changeVis  = (i, k, v)   => setVisibilities(p =>
    p.map((row, idx) => idx === i
      ? { ...row, [k]: v, ...(k === "target" ? { requirement: "" } : {}) }
      : row
    )
  );

  const validate = () => {
    const e = {};
    if (!form.category)           e.category    = "Ангилал сонгоно уу";
    if (!form.title.trim())       e.title       = "Гарчиг оруулна уу";
    if (!form.description.trim()) e.description = "Тайлбар оруулна уу";
    visibilities.forEach((v, i) => {
      if (!v.target) e[`vis_${i}`] = "Төрөл сонгоно уу";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { showToast("error", "Мэдээллээ бүрэн бөглөнө үү"); return; }
    setLoading(true);
    try {
      const cleanVis = visibilities
        .filter(v => v.target)
        .map(v => ({ target: v.target, requirement: v.requirement || null }));

      const fd = new FormData();
      fd.append("category",    form.category);
      fd.append("title",       form.title.trim());
      fd.append("description", form.description.trim());
      fd.append("feature",     form.feature ? "true" : "false");
      if (imageFile)       fd.append("file", imageFile);
      if (cleanVis.length) fd.append("visibilities", JSON.stringify(cleanVis));

      const res = await axiosInstance.post("/news", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res?.status === 200 || res?.status === 201) {
        showToast("success", res.data.message || "Мэдээ амжилттай нэмэгдлээ");
        setForm({ category: "", title: "", description: "", feature: false });
        setImageFile(null); setImagePreview(null); setVisibilities([]);
        setTimeout(() => navigate("/news"), 2000);
      }
    } catch (err) {
      console.error(err);
      showToast("error", err?.response?.data?.message || "Алдаа гарлаа");
    } finally { setLoading(false); }
  };

  /* ── Render ──────────────────────────────────────────── */
  return (
    <div className={css.container}>

      {/* Toast */}
      {toast && (
        <div className={`${css.notification} ${css[toast.type]}`}>
          {toast.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Breadcrumb */}
      <div className={css.breadcrumb}>
        <div className={css.breadcrumbItem} onClick={() => navigate("/")}>
          <Home size={14} /><span>Нүүр</span>
        </div>
        <ChevronRight size={14} className={css.breadcrumbSeparator} />
        <div className={css.breadcrumbItem} onClick={() => navigate("/news")}>
          <Newspaper size={14} /><span>Мэдээ</span>
        </div>
        <ChevronRight size={14} className={css.breadcrumbSeparator} />
        <div className={`${css.breadcrumbItem} ${css.active}`}>
          <Plus size={14} /><span>Мэдээ нэмэх</span>
        </div>
      </div>

      {/* Page header */}
      <div className={css.pageHeader}>
        <div className={css.headerContent}>
          <div className={css.headerIcon}><Newspaper size={26} /></div>
          <div className={css.headerText}>
            <h1>Мэдээ нэмэх</h1>
            <p>Шинэ мэдээ бүртгэх</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className={css.formContainer}>
        <form onSubmit={handleSubmit} className={css.form}>

          {/* ── Section 1: Үндсэн мэдээлэл ── */}
          <div className={css.formSection}>
            <div className={css.sectionHeader}>
              <FileText size={18} />
              <h3>Үндсэн мэдээлэл</h3>
              <span className={css.sectionBadge}>Заавал</span>
            </div>

            {/* Ангилал + Гарчиг */}
            <div className={css.formGrid}>
              <div className={css.formGroup}>
                <label className={css.label}>
                  <Tag size={14} /><span>Ангилал</span><span className={css.required}>*</span>
                </label>
                <select
                  name="category" value={form.category} onChange={handleChange}
                  className={`${css.select} ${errors.category ? css.error : ""}`}
                >
                  <option value="">— Ангилал сонгох —</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.category && <span className={css.errorMessage}>{errors.category}</span>}
              </div>

              <div className={css.formGroup}>
                <label className={css.label}>
                  <Type size={14} /><span>Гарчиг</span><span className={css.required}>*</span>
                </label>
                <div className={css.inputWrapper}>
                  <Type size={15} className={css.inputIcon} />
                  <input
                    type="text" name="title" value={form.title} onChange={handleChange}
                    placeholder="Мэдээний гарчиг..."
                    className={`${css.input} ${errors.title ? css.error : ""}`}
                  />
                </div>
                {errors.title && <span className={css.errorMessage}>{errors.title}</span>}
              </div>
            </div>

            {/* Тайлбар */}
            <div className={css.formGroup}>
              <label className={css.label}>
                <AlignLeft size={14} /><span>Тайлбар</span><span className={css.required}>*</span>
              </label>
              <textarea
                name="description" value={form.description} onChange={handleChange}
                placeholder="Мэдээний дэлгэрэнгүй тайлбар..." rows={5}
                className={`${css.textarea} ${errors.description ? css.error : ""}`}
              />
              {errors.description && <span className={css.errorMessage}>{errors.description}</span>}
            </div>

            {/* Онцлох */}
            <div className={css.formGroup}>
              <label className={css.label}>
                <Star size={14} /><span>Онцлох мэдээ</span>
              </label>
              <label className={css.checkboxWrapper}>
                <input
                  type="checkbox" name="feature"
                  checked={form.feature} onChange={handleChange}
                  className={css.checkbox}
                />
                <span className={css.checkboxCustom} />
                <span>Онцлох мэдээнд оруулах</span>
                {form.feature && (
                  <span className={css.featureBadge}><Star size={11} /> Онцлох</span>
                )}
              </label>
            </div>
          </div>

          {/* ── Section 2: Зураг ── */}
          <div className={css.formSection}>
            <div className={css.sectionHeader}>
              <ImageIcon size={18} />
              <h3>Зураг</h3>
              <span className={css.sectionBadge} style={{ background: "rgba(100,116,139,.08)", color: "#64748B", borderColor: "rgba(100,116,139,.15)" }}>
                Заавал биш
              </span>
            </div>

            <div className={css.formGroup}>
              <label className={css.label}>
                <ImageIcon size={14} /><span>Мэдээний зураг</span>
              </label>
              <label className={css.fileDropZone}>
                {imagePreview ? (
                  <div className={css.imagePreviewWrapper}>
                    <img src={imagePreview} alt="preview" className={css.imagePreview} />
                    <div className={css.imagePreviewOverlay}><span>Зураг солих</span></div>
                  </div>
                ) : (
                  <div className={css.fileDropContent}>
                    <ImageIcon size={28} strokeWidth={1.5} color="#CBD5E1" />
                    <p>Зураг оруулах</p>
                    <span>PNG, JPG, WEBP</span>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleImage} style={{ display: "none" }} />
              </label>
              {imageFile && (
                <span className={css.fileHint}>✓ {imageFile.name}</span>
              )}
            </div>
          </div>

          {/* ── Section 3: Хамрах хүрээ ── */}
          <div className={css.formSection}>
            <div className={css.sectionHeader}>
              <Users size={18} />
              <h3>Хамрах хүрээ</h3>
              <span className={css.sectionBadge} style={{ background: "rgba(100,116,139,.08)", color: "#64748B", borderColor: "rgba(100,116,139,.15)" }}>
                Заавал биш
              </span>
            </div>

            <div className={css.visibilityInfo}>
              <AlertCircle size={15} />
              <span>
                Хамрах хүрээ тодорхойлохгүй бол <strong>бүх хэрэглэгчид</strong> харагдана.
                Олон нөхцөл нэмэх боломжтой — аль нэгэнд тохирвол харагдана.
              </span>
            </div>

            <div className={css.visibilityList}>
              {visibilities.map((vis, idx) => {
                const opts = getOptions(vis.target);
                return (
                  <div key={idx} className={css.visibilityRow}>
                    <div className={css.visibilityIndex}>{idx + 1}</div>

                    <div className={css.visibilityField}>
                      <label className={css.visibilityLabel}>Төрөл</label>
                      <select
                        value={vis.target}
                        onChange={e => changeVis(idx, "target", e.target.value)}
                        className={`${css.visibilitySelect} ${errors[`vis_${idx}`] ? css.error : ""}`}
                      >
                        <option value="">Сонгоно уу</option>
                        {TARGET_OPTIONS.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                      {errors[`vis_${idx}`] && (
                        <span className={css.errorMessage}>{errors[`vis_${idx}`]}</span>
                      )}
                    </div>

                    <div className={css.visibilityField}>
                      <label className={css.visibilityLabel}>
                        Утга <span className={css.optionalTag}>заавал биш</span>
                      </label>
                      <select
                        value={vis.requirement}
                        onChange={e => changeVis(idx, "requirement", e.target.value)}
                        disabled={!vis.target || opts.length === 0}
                        className={css.visibilitySelect}
                      >
                        <option value="">Бүгд</option>
                        {opts.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>

                    <button type="button" className={css.removeVisibilityBtn} onClick={() => removeVis(idx)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>

            <button type="button" className={css.addVisibilityBtn} onClick={addVis}>
              <Plus size={14} /> Нөхцөл нэмэх
            </button>

            {/* Preview tags */}
            {visibilities.some(v => v.target) && (
              <div className={css.visibilityPreview}>
                <p className={css.previewTitle}>Хамрах хүрээ:</p>
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
              </div>
            )}
          </div>

          {/* ── Actions ── */}
          <div className={css.formActions}>
            <button type="button" className={css.cancelButton}
              onClick={() => navigate("/news")} disabled={loading}>
              Цуцлах
            </button>
            <button type="submit" className={css.submitButton} disabled={loading}>
              {loading
                ? <><Loader size={16} className={css.spinner} /><span>Нэмж байна...</span></>
                : <><Newspaper size={16} /><span>Мэдээ нэмэх</span></>}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default NewsAdd;