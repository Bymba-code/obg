import React, { useState, useEffect } from "react";
import css from "./style.module.css";
import axiosInstance from "../../Services/Api/AxiosInstance";
import {
  PlayCircle, FileText, CheckCircle, BookOpen, Clock,
  Star, Award, ChevronRight, BarChart3, Image,
  Users, Building2, Shield, Plus, Trash2, Save, Loader,
  AlertCircle, Home, RefreshCw, Edit3, List,
  Video, TestTube, X, Tag, Type, AlignLeft, ImageIcon
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const BASE_URL = "http://localhost:3000";
const getUrl = (path) => {
  if (!path) return "";
  const clean = path.replace(/\\/g, "/");
  if (clean.startsWith("/undefined")) return "";
  return BASE_URL + clean;
};

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

const ContentEditor = ({ content, tests, allImages, allPdfs, allVideos, allContentTests, onUpdate, onDelete, showToast }) => {
  const [saving,     setSaving]     = useState(false);
  const [localTitle, setLocalTitle] = useState(content.title || "");
  const [newImages,  setNewImages]  = useState([]);
  const [newPdfs,    setNewPdfs]    = useState([]);
  const [newVideos,  setNewVideos]  = useState([]);
  const [newTestId,  setNewTestId]  = useState("");

  const images       = allImages.filter(i => i.content === content.id);
  const pdfs         = allPdfs.filter(p => p.content === content.id);
  const videos       = allVideos.filter(v => v.content === content.id);
  const contentTests = allContentTests.filter(ct => ct.content === content.id);

  const saveTitle = async () => {
    if (!localTitle.trim() || localTitle.trim() === content.title) return;
    setSaving(true);
    try {
      await axiosInstance.put(`/lesson-content/${content.id}`, { title: localTitle.trim() });
      onUpdate(content.id, { title: localTitle.trim() });
      showToast("success", "Гарчиг хадгалагдлаа");
    } catch { showToast("error", "Алдаа гарлаа"); }
    finally { setSaving(false); }
  };

  const deleteContent = async () => {
    if (!window.confirm("Энэ агуулгыг устгах уу?")) return;
    try {
      await axiosInstance.delete(`/lesson-content/${content.id}`);
      onDelete(content.id);
      showToast("success", "Устгагдлаа");
    } catch { showToast("error", "Устгахад алдаа"); }
  };

  const pickImages = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(p => [...p, ...files.map(f => ({ file: f, preview: URL.createObjectURL(f) }))]);
  };
  const uploadImages = async () => {
    if (!newImages.length) return; setSaving(true);
    try {
      for (const img of newImages) {
        const fd = new FormData(); fd.append("content", content.id); fd.append("file", img.file);
        const res = await axiosInstance.post("/lesson-content-image", fd, { headers: { "Content-Type": "multipart/form-data" } });
        if (res?.data?.data) onUpdate(content.id, { _addImage: { ...res.data.data, content: content.id } });
      }
      setNewImages([]); showToast("success", "Зураг нэмэгдлээ");
    } catch { showToast("error", "Зураг нэмэхэд алдаа"); } finally { setSaving(false); }
  };
  const deleteImage = async (imgId) => {
    try { await axiosInstance.delete(`/lesson-content-image/${imgId}`); onUpdate(content.id, { _removeImage: imgId }); showToast("success", "Зураг устгагдлаа"); }
    catch { showToast("error", "Алдаа"); }
  };

  const pickPdf = (e) => { const f = e.target.files[0]; if (f) setNewPdfs(p => [...p, { file: f }]); };
  const uploadPdfs = async () => {
    if (!newPdfs.length) return; setSaving(true);
    try {
      for (const pdf of newPdfs) {
        const fd = new FormData(); fd.append("content", content.id); fd.append("file", pdf.file);
        const res = await axiosInstance.post("/lesson-content-pdf", fd, { headers: { "Content-Type": "multipart/form-data" } });
        if (res?.data?.data) onUpdate(content.id, { _addPdf: { ...res.data.data, content: content.id } });
      }
      setNewPdfs([]); showToast("success", "PDF нэмэгдлээ");
    } catch { showToast("error", "PDF нэмэхэд алдаа"); } finally { setSaving(false); }
  };
  const deletePdf = async (pdfId) => {
    try { await axiosInstance.delete(`/lesson-content-pdf/${pdfId}`); onUpdate(content.id, { _removePdf: pdfId }); showToast("success", "PDF устгагдлаа"); }
    catch { showToast("error", "Алдаа"); }
  };

  const uploadVideos = async () => {
    const valid = newVideos.filter(v => v.url.trim());
    if (!valid.length) return; setSaving(true);
    try {
      for (const vid of valid) {
        const res = await axiosInstance.post("/lesson-content-video", { content: content.id, video: vid.url.trim() });
        if (res?.data?.data) onUpdate(content.id, { _addVideo: { ...res.data.data, content: content.id } });
      }
      setNewVideos([]); showToast("success", "Видео нэмэгдлээ");
    } catch { showToast("error", "Видео нэмэхэд алдаа"); } finally { setSaving(false); }
  };
  const deleteVideo = async (vidId) => {
    try { await axiosInstance.delete(`/lesson-content-video/${vidId}`); onUpdate(content.id, { _removeVideo: vidId }); showToast("success", "Видео устгагдлаа"); }
    catch { showToast("error", "Алдаа"); }
  };

  const addTest = async () => {
    if (!newTestId) return; setSaving(true);
    try {
      const res = await axiosInstance.post("/lesson-content-test", { content: content.id, test: Number(newTestId) });
      if (res?.data?.data) { onUpdate(content.id, { _addContentTest: { ...res.data.data, content: content.id } }); setNewTestId(""); showToast("success", "Тест холбогдлоо"); }
    } catch { showToast("error", "Тест нэмэхэд алдаа"); } finally { setSaving(false); }
  };
  const deleteContentTest = async (ctId) => {
    try { await axiosInstance.delete(`/lesson-content-test/${ctId}`); onUpdate(content.id, { _removeContentTest: ctId }); showToast("success", "Тест устгагдлаа"); }
    catch { showToast("error", "Алдаа"); }
  };

  return (
    <div className={css.playerSection}>
      {/* Header */}
      <div className={css.currentLessonHeader}>
        <div style={{ flex: 1 }}>
          <div className={css.editorTitleRow}>
            <Edit3 size={16} color="var(--terracotta)" style={{ flexShrink: 0 }} />
            <input
              className={css.editorTitleInput}
              value={localTitle}
              onChange={e => setLocalTitle(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={e => e.key === "Enter" && (e.preventDefault(), saveTitle())}
              placeholder="Агуулгын гарчиг..."
            />
            {saving && <Loader size={15} color="var(--terracotta)" className={css.spinnerInline} />}
          </div>
          <div className={css.breadcrumb}>
            <span>Агуулга засах</span>
            <ChevronRight size={14} />
            <span className={css.breadcrumbActive}>ID: {content.id}</span>
          </div>
        </div>
        <button className={css.deleteLessonBtn} onClick={deleteContent}><Trash2 size={16} /></button>
      </div>

      {/* IMAGES */}
      <div className={css.contentSection}>
        <div className={css.sectionLabel}>
          <ImageIcon size={16} /> Зургууд
          <span className={css.sectionBadge}>{images.length + newImages.length}</span>
        </div>
        {(images.length > 0 || newImages.length > 0) && (
          <div className={css.thumbGrid}>
            {images.map(img => (
              <div key={img.id} className={css.thumb}>
                <img src={getUrl(img.file)} alt="" className={css.thumbImg} onError={e => e.target.style.display = "none"} />
                <button className={css.thumbDel} onClick={() => deleteImage(img.id)}><X size={11} /></button>
              </div>
            ))}
            {newImages.map((img, i) => (
              <div key={"ni_" + i} className={`${css.thumb} ${css.thumbNew}`}>
                <img src={img.preview} alt="" className={css.thumbImg} />
                <button className={css.thumbDel} style={{ opacity: 1 }} onClick={() => setNewImages(p => p.filter((_, idx) => idx !== i))}><X size={11} /></button>
              </div>
            ))}
          </div>
        )}
        <div className={css.mediaActions}>
          <label className={css.mediaAddBtn}><Plus size={14} /> Зураг нэмэх<input type="file" accept="image/*" multiple onChange={pickImages} style={{ display: "none" }} /></label>
          {newImages.length > 0 && <button className={css.mediaSaveBtn} onClick={uploadImages} disabled={saving}><Save size={13} /> {newImages.length} зураг хадгалах</button>}
        </div>
      </div>

      {/* PDFs */}
      <div className={css.contentSection}>
        <div className={css.sectionLabel}>
          <FileText size={16} /> PDF файлууд
          <span className={css.sectionBadge}>{pdfs.length + newPdfs.length}</span>
        </div>
        {(pdfs.length > 0 || newPdfs.length > 0) && (
          <div className={css.fileList}>
            {pdfs.map(pdf => {
              const fname = pdf.file?.replace(/\\/g, "/").split("/").pop();
              return (
                <div key={pdf.id} className={css.fileItem}>
                  <FileText size={15} className={css.fileItemIcon} />
                  <span className={css.fileName}>{fname || "PDF"}</span>
                  <button className={css.fileItemDel} onClick={() => deletePdf(pdf.id)}><Trash2 size={13} /></button>
                </div>
              );
            })}
            {newPdfs.map((p, i) => (
              <div key={"np_" + i} className={`${css.fileItem} ${css.fileItemNew}`}>
                <FileText size={15} className={css.fileItemIcon} />
                <span className={`${css.fileName} ${css.fileNameNew}`}>{p.file.name}</span>
                <button className={css.fileItemDel} onClick={() => setNewPdfs(prev => prev.filter((_, idx) => idx !== i))}><X size={13} /></button>
              </div>
            ))}
          </div>
        )}
        <div className={css.mediaActions}>
          <label className={css.mediaAddBtn}><Plus size={14} /> PDF нэмэх<input type="file" accept="application/pdf" onChange={pickPdf} style={{ display: "none" }} /></label>
          {newPdfs.length > 0 && <button className={css.mediaSaveBtn} onClick={uploadPdfs} disabled={saving}><Save size={13} /> {newPdfs.length} PDF хадгалах</button>}
        </div>
      </div>

      {/* VIDEOS */}
      <div className={css.contentSection}>
        <div className={css.sectionLabel}>
          <Video size={16} /> Видео
          <span className={css.sectionBadge}>{videos.length + newVideos.filter(v => v.url.trim()).length}</span>
        </div>
        {(videos.length > 0 || newVideos.length > 0) && (
          <div className={css.fileList}>
            {videos.map(vid => (
              <div key={vid.id} className={css.fileItem}>
                <PlayCircle size={15} className={css.fileItemIcon} />
                <span className={css.fileName}>{vid.video || "—"}</span>
                <button className={css.fileItemDel} onClick={() => deleteVideo(vid.id)}><Trash2 size={13} /></button>
              </div>
            ))}
            {newVideos.map((v, i) => (
              <div key={"nv_" + i} className={`${css.fileItem} ${css.fileItemNew}`}>
                <PlayCircle size={15} className={css.fileItemIcon} />
                <input
                  className={css.urlInput}
                  value={v.url}
                  placeholder="Видео URL оруулна уу..."
                  onChange={e => setNewVideos(p => p.map((x, idx) => idx === i ? { ...x, url: e.target.value } : x))}
                />
                <button className={css.fileItemDel} onClick={() => setNewVideos(p => p.filter((_, idx) => idx !== i))}><X size={13} /></button>
              </div>
            ))}
          </div>
        )}
        <div className={css.mediaActions}>
          <button className={css.mediaAddBtn} onClick={() => setNewVideos(p => [...p, { url: "" }])}><Plus size={14} /> URL нэмэх</button>
          {newVideos.filter(v => v.url.trim()).length > 0 && <button className={css.mediaSaveBtn} onClick={uploadVideos} disabled={saving}><Save size={13} /> Видео хадгалах</button>}
        </div>
      </div>

      {/* TESTS */}
      <div className={css.contentSection} style={{ borderBottom: "none" }}>
        <div className={css.sectionLabel}>
          <TestTube size={16} /> Тестүүд
          <span className={css.sectionBadge}>{contentTests.length}</span>
        </div>
        {contentTests.length > 0 && (
          <div className={css.fileList}>
            {contentTests.map(ct => {
              const ti = tests.find(t => String(t.id) === String(ct.test));
              return (
                <div key={ct.id} className={css.fileItem}>
                  <TestTube size={15} className={css.fileItemIcon} />
                  <span className={css.fileName}>{ti?.name || `Тест #${ct.test}`}</span>
                  <button className={css.fileItemDel} onClick={() => deleteContentTest(ct.id)}><Trash2 size={13} /></button>
                </div>
              );
            })}
          </div>
        )}
        <div className={css.mediaActions}>
          <select className={css.testSelect} value={newTestId} onChange={e => setNewTestId(e.target.value)}>
            <option value="">— Тест сонгох —</option>
            {tests.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          {newTestId && <button className={css.mediaSaveBtn} onClick={addTest} disabled={saving}><Plus size={13} /> Нэмэх</button>}
        </div>
      </div>

      <div className={css.lessonNavigation}>
        <p style={{ fontSize: ".8125rem", color: "var(--gray-400)", margin: 0 }}>
          Гарчиг Enter эсвэл хулганаа хөдөлгөж хадгалах
        </p>
      </div>
    </div>
  );
};


const LessonInfoEditor = ({ lesson, categories, firstUnits, secondUnits, thirdUnits, fourthUnits, ranks, positions, users, onSaved, showToast, id }) => {
  const [loading,      setLoading]      = useState(false);
  const [form,         setForm]         = useState({ category: lesson.category ? String(lesson.category) : "", title: lesson.title || "", instructor: lesson.instructor || "", time: lesson.time ? String(lesson.time) : "", description: lesson.description || "" });
  const [imageFile,    setImageFile]    = useState(null);
  const [imagePreview, setImagePreview] = useState(getUrl(lesson.image) || null);
  const [visibilities, setVisibilities] = useState((lesson.lesson_visiblity || []).map(v => ({ id: v.id, target: v.target || "", requirement: v.requirement ? String(v.requirement) : "" })));
  const [errors,       setErrors]       = useState({});

  const getOptions = (target) => {
    switch (target) {
      case "first_unit":  return firstUnits.map(e  => ({ value: e.id, label: e.name }));
      case "second_unit": return secondUnits.map(e => ({ value: e.id, label: e.name }));
      case "third_unit":  return thirdUnits.map(e  => ({ value: e.id, label: e.name }));
      case "fourth_unit": return fourthUnits.map(e => ({ value: e.id, label: e.name }));
      case "rank":        return ranks.map(e        => ({ value: e.id, label: e.name }));
      case "position":    return positions.map(e    => ({ value: e.id, label: e.name }));
      case "user":        return users.map(e        => ({ value: e.id, label: ((e.firstname || "") + " " + (e.lastname || "")).trim() || e.kode }));
      default: return [];
    }
  };

  const addVis    = ()        => setVisibilities(p => [...p, { target: "", requirement: "" }]);
  const removeVis = (i)       => setVisibilities(p => p.filter((_, idx) => idx !== i));
  const changeVis = (i, k, v) => setVisibilities(p => p.map((row, idx) => idx === i ? { ...row, [k]: v, ...(k === "target" ? { requirement: "" } : {}) } : row));

  const handleDeleteVis = async (visId, index) => {
    try { await axiosInstance.delete(`/lesson-visiblity/${visId}`); showToast("success", "Амжилттай"); removeVis(index); }
    catch { showToast("error", "Алдаа"); }
  };

  const validate = () => {
    const e = {};
    if (!form.category)           e.category    = "Ангилал сонгоно уу";
    if (!form.title.trim())       e.title       = "Нэр оруулна уу";
    if (!form.description.trim()) e.description = "Тайлбар оруулна уу";
    if (!imageFile && !imagePreview) e.image    = "Зураг оруулна уу";
    visibilities.forEach((v, i) => { if (!v.target) e[`vis_${i}`] = "Төрөл сонгоно уу"; });
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) { showToast("error", "Мэдээллээ бүрэн бөглөнө үү"); return; }
    setLoading(true);
    try {
      const cleanVis = visibilities.filter(v => v.target).map(v => ({ target: v.target, requirement: v.requirement || null }));
      const fd = new FormData();
      fd.append("category",    form.category);
      fd.append("title",       form.title.trim());
      fd.append("instructor",  form.instructor.trim());
      fd.append("description", form.description.trim());
      if (form.time) fd.append("time", form.time);
      if (imageFile) fd.append("file", imageFile);
      if (cleanVis.length > 0) fd.append("visibilities", JSON.stringify(cleanVis));
      const res = await axiosInstance.put(`/lesson/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      if (res?.status === 200) { showToast("success", "Хичээл амжилттай шинэчлэгдлээ"); onSaved && onSaved(form); }
    } catch (err) { showToast("error", err?.response?.data?.message || "Алдаа гарлаа"); }
    finally { setLoading(false); }
  };

  return (
    <div className={css.playerSection}>
      <div className={css.currentLessonHeader}>
        <div>
          <h2 className={css.currentLessonTitle}>Хичээлийн мэдээлэл засах</h2>
          <div className={css.breadcrumb}>
            <span>Үндсэн тохиргоо</span>
            <ChevronRight size={14} />
            <span className={css.breadcrumbActive}>Хичээл #{id}</span>
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
              <select value={form.category} onChange={e => { setForm(p => ({ ...p, category: e.target.value })); setErrors(p => ({ ...p, category: "" })); }} className={`${css.fSelect} ${errors.category ? css.fErr : ""}`}>
                <option value="">— Сонгох —</option>
                {categories.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
              </select>
              {errors.category && <span className={css.fErrMsg}>{errors.category}</span>}
            </div>
            <div className={css.fGroup}>
              <label className={css.fLabel}><Clock size={13} /> Хугацаа (мин)</label>
              <input type="number" min="1" value={form.time} placeholder="60" onChange={e => setForm(p => ({ ...p, time: e.target.value }))} className={css.fInput} />
            </div>
          </div>
          <div className={css.fGroup}>
            <label className={css.fLabel}><Type size={13} /> Хичээлийн нэр <span className={css.fReq}>*</span></label>
            <input type="text" value={form.title} placeholder="Хичээлийн нэр" onChange={e => { setForm(p => ({ ...p, title: e.target.value })); setErrors(p => ({ ...p, title: "" })); }} className={`${css.fInput} ${errors.title ? css.fErr : ""}`} />
            {errors.title && <span className={css.fErrMsg}>{errors.title}</span>}
          </div>
          <div className={css.fGroup}>
            <label className={css.fLabel}><Users size={13} /> Багш / Зохиогч</label>
            <input type="text" value={form.instructor} placeholder="Багшийн нэр" onChange={e => setForm(p => ({ ...p, instructor: e.target.value }))} className={css.fInput} />
          </div>
          <div className={css.fGroup}>
            <label className={css.fLabel}><AlignLeft size={13} /> Тайлбар <span className={css.fReq}>*</span></label>
            <textarea value={form.description} rows={4} placeholder="Хичээлийн товч тайлбар..." onChange={e => { setForm(p => ({ ...p, description: e.target.value })); setErrors(p => ({ ...p, description: "" })); }} className={`${css.fTextarea} ${errors.description ? css.fErr : ""}`} />
            {errors.description && <span className={css.fErrMsg}>{errors.description}</span>}
          </div>
        </div>

        {/* Image */}
        <div className={css.contentSection}>
          <div className={css.sectionLabel}><ImageIcon size={16} /> Зураг</div>
          <label className={`${css.fileDropZone} ${errors.image ? css.fErr : ""}`}>
            {imagePreview ? (
              <div className={css.imgPreviewWrap}>
                <img src={imagePreview} alt="preview" className={css.imgPreview} onError={e => e.target.style.display = "none"} />
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
          {imageFile && <span className={css.newTag}>✓ Шинэ зураг: {imageFile.name}</span>}
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
                  <select value={vis.target} onChange={e => changeVis(idx, "target", e.target.value)} className={`${css.fSelect} ${errors[`vis_${idx}`] ? css.fErr : ""}`}>
                    <option value="">Төрөл сонгоно уу</option>
                    {TARGET_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <select value={vis.requirement} onChange={e => changeVis(idx, "requirement", e.target.value)} disabled={!vis.target || opts.length === 0} className={css.fSelect}>
                    <option value="">Бүгд</option>
                    {opts.map(o => <option key={o.value} value={String(o.value)}>{o.label}</option>)}
                  </select>
                </div>
                <button type="button" className={css.visDelBtn} onClick={() => vis.id ? handleDeleteVis(vis.id, idx) : removeVis(idx)}><Trash2 size={14} /></button>
              </div>
            );
          })}
          <button type="button" className={css.addVisBtn} onClick={addVis}><Plus size={14} /> Нөхцөл нэмэх</button>
          {visibilities.some(v => v.target) && (
            <div className={css.previewTags}>
              {visibilities.filter(v => v.target).map((v, i) => {
                const tLabel = TARGET_OPTIONS.find(t => t.value === v.target)?.label;
                const opts   = getOptions(v.target);
                const rLabel = v.requirement ? opts.find(o => String(o.value) === String(v.requirement))?.label || v.requirement : "Бүгд";
                return <span key={i} className={css.previewTag}>{TARGET_ICON[v.target]} {tLabel}: {rLabel}</span>;
              })}
            </div>
          )}
        </div>

        <div className={css.lessonNavigation}>
          <button type="submit" className={css.completeBtn} disabled={loading}>
            {loading ? <><Loader size={16} className={css.spinnerInline} /> Хадгалж байна...</> : <><Save size={16} /> Хадгалах</>}
          </button>
        </div>
      </form>
    </div>
  );
};

/* ══════════════════════════════════════
   MAIN: LessonEdit
══════════════════════════════════════ */
const LessonEdit = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [lesson,   setLesson]   = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [toast,    setToast]    = useState(null);

  const [categories,  setCategories]  = useState([]);
  const [firstUnits,  setFirstUnits]  = useState([]);
  const [secondUnits, setSecondUnits] = useState([]);
  const [thirdUnits,  setThirdUnits]  = useState([]);
  const [fourthUnits, setFourthUnits] = useState([]);
  const [ranks,       setRanks]       = useState([]);
  const [positions,   setPositions]   = useState([]);
  const [users,       setUsers]       = useState([]);
  const [tests,       setTests]       = useState([]);

  const [contents,        setContents]        = useState([]);
  const [allImages,       setAllImages]       = useState([]);
  const [allPdfs,         setAllPdfs]         = useState([]);
  const [allVideos,       setAllVideos]       = useState([]);
  const [allContentTests, setAllContentTests] = useState([]);

  const [selectedIdx,     setSelectedIdx]     = useState("info");
  const [newContentTitle, setNewContentTitle] = useState("");
  const [addingContent,   setAddingContent]   = useState(false);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [cat, fu, su, tu, fou, r, p, u, ts, les] = await Promise.all([
          axiosInstance.get("/lesson-category"),
          axiosInstance.get("/first-units"),
          axiosInstance.get("/second-units"),
          axiosInstance.get("/third-units"),
          axiosInstance.get("/fourth-units"),
          axiosInstance.get("/rank"),
          axiosInstance.get("/positions"),
          axiosInstance.get("/users"),
          axiosInstance.get("/test"),
          axiosInstance.get(`/lesson/${id}`),
        ]);
        if (cat?.status === 200) setCategories(cat.data.data   || []);
        if (fu?.status  === 200) setFirstUnits(fu.data.data    || []);
        if (su?.status  === 200) setSecondUnits(su.data.data   || []);
        if (tu?.status  === 200) setThirdUnits(tu.data.data    || []);
        if (fou?.status === 200) setFourthUnits(fou.data.data  || []);
        if (r?.status   === 200) setRanks(r.data.data          || []);
        if (p?.status   === 200) setPositions(p.data.data      || []);
        if (u?.status   === 200) setUsers(u.data.data          || []);
        if (ts?.status  === 200) setTests(ts.data.data         || []);
        if (les?.status === 200) {
          const d = les.data.data;
          setLesson(d);
          const rawContents = d.contents || d.lesson_content || [];
          const sorted = [...rawContents].sort((a, b) => Number(a.index) - Number(b.index));
          setContents(sorted.map(c => ({ id: c.id, title: c.title || "", index: c.index })));
          setAllImages(rawContents.flatMap(c       => (c.lesson_content_image  || []).map(x => ({ ...x, content: c.id }))));
          setAllPdfs(rawContents.flatMap(c         => (c.lesson_content_pdf    || []).map(x => ({ ...x, content: c.id }))));
          setAllVideos(rawContents.flatMap(c       => (c.lesson_content_video  || []).map(x => ({ ...x, content: c.id }))));
          setAllContentTests(rawContents.flatMap(c => (c.lesson_content_test   || []).map(x => ({ ...x, content: c.id }))));
        }
      } catch (err) { console.error(err); showToast("error", "Мэдээлэл татахад алдаа гарлаа"); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, [id]);

  const handleContentUpdate = (cId, patch) => {
    if (patch._addImage)          setAllImages(p        => [...p, patch._addImage]);
    if (patch._removeImage)       setAllImages(p        => p.filter(x => x.id !== patch._removeImage));
    if (patch._addPdf)            setAllPdfs(p          => [...p, patch._addPdf]);
    if (patch._removePdf)         setAllPdfs(p          => p.filter(x => x.id !== patch._removePdf));
    if (patch._addVideo)          setAllVideos(p        => [...p, patch._addVideo]);
    if (patch._removeVideo)       setAllVideos(p        => p.filter(x => x.id !== patch._removeVideo));
    if (patch._addContentTest)    setAllContentTests(p  => [...p, patch._addContentTest]);
    if (patch._removeContentTest) setAllContentTests(p  => p.filter(x => x.id !== patch._removeContentTest));
    if (patch.title)              setContents(p         => p.map(c => c.id === cId ? { ...c, title: patch.title } : c));
  };

  const handleContentDelete = (cId) => {
    const idx = contents.findIndex(c => c.id === cId);
    setContents(p        => p.filter(c => c.id !== cId));
    setAllImages(p       => p.filter(x => x.content !== cId));
    setAllPdfs(p         => p.filter(x => x.content !== cId));
    setAllVideos(p       => p.filter(x => x.content !== cId));
    setAllContentTests(p => p.filter(x => x.content !== cId));
    if (selectedIdx === idx) setSelectedIdx("info");
  };

  const addContent = async () => {
    if (!newContentTitle.trim()) return;
    setAddingContent(true);
    try {
      const res = await axiosInstance.post("/lesson-content", { lesson: Number(id), title: newContentTitle.trim(), index: contents.length + 1 });
      if (res?.status === 200 || res?.status === 201) {
        const nc = res.data.data;
        const newLen = contents.length;
        setContents(p => [...p, { id: nc.id, title: nc.title || "", index: nc.index }]);
        setNewContentTitle("");
        setSelectedIdx(newLen);
        showToast("success", "Агуулга нэмэгдлээ");
      }
    } catch { showToast("error", "Агуулга нэмэхэд алдаа"); }
    finally { setAddingContent(false); }
  };

  const getMediaIcons = (cId) => ({
    hasImg:  allImages.some(x => x.content === cId),
    hasPdf:  allPdfs.some(x => x.content === cId),
    hasVid:  allVideos.some(x => x.content === cId),
    hasTest: allContentTests.some(x => x.content === cId),
  });

  if (loading) return (
    <div className={css.lessonDetail}>
      <div className={css.loading}><div className={css.loadingSpinner} /><span>Хичээлийн мэдээлэл татаж байна...</span></div>
    </div>
  );
  if (!lesson) return <div className={css.lessonDetail}><div className={css.empty}>Хичээл олдсонгүй.</div></div>;

  const currentContent = selectedIdx !== "info" ? contents[selectedIdx] : null;
  const stats = lesson.stats || {};
  const ratings = lesson.ratings || [];

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
        <span className={`${css.editBcItem} ${css.editBcActive}`}><RefreshCw size={14} /> Хичээл засах</span>
      </div>

      <div className={css.mainContent}>
        {/* ── SIDEBAR ── */}
        <div className={css.sidebar}>
          <div className={css.sidebarHeader}>
            <h3>Хичээл засах</h3>
            <span className={css.lessonCount}>#{id}</span>
          </div>

          {/* Stats */}
          <div className={css.editStatsGrid}>
            <div className={css.editStatCard}><BarChart3 size={15} color="var(--terracotta)" /><span>{stats.totalContent || 0}</span><small>Агуулга</small></div>
            <div className={css.editStatCard}><Star size={15} color="#B8860B" /><span>{Number(stats.avgRating || 0).toFixed(1)}</span><small>Үнэлгээ</small></div>
            <div className={css.editStatCard}><Users size={15} color="var(--sage)" /><span>{stats.activeUsers || 0}</span><small>Хэрэглэгч</small></div>
            <div className={css.editStatCard}><CheckCircle size={15} color="var(--ink-2)" /><span>{stats.completedUsers || 0}</span><small>Дуусгасан</small></div>
          </div>

          <div className={css.lessonsList}>
            {/* Info item */}
            <button
              className={[css.lessonItem, selectedIdx === "info" ? css.activeLessonItem : ""].filter(Boolean).join(" ")}
              onClick={() => setSelectedIdx("info")}
            >
              <div className={css.lessonNumber} style={selectedIdx === "info" ? { background: "var(--terracotta)", color: "white" } : {}}>
                <Edit3 size={14} />
              </div>
              <div className={css.lessonInfo}>
                <p className={css.lessonName}>Үндсэн мэдээлэл</p>
                <div className={css.lessonMeta}>
                  <Tag size={11} />
                  <span>{lesson.lesson_category?.name || "Ангилал"}</span>
                </div>
              </div>
              <div className={css.lessonStatus}><ChevronRight size={15} /></div>
            </button>

            {/* Divider */}
            <div className={css.sidebarDivider}><span>Агуулгууд ({contents.length})</span></div>

            {/* Content items */}
            {contents.map((content, index) => {
              const { hasImg, hasPdf, hasVid, hasTest } = getMediaIcons(content.id);
              const isActive = selectedIdx === index;
              return (
                <button
                  key={content.id}
                  className={[css.lessonItem, isActive ? css.activeLessonItem : ""].filter(Boolean).join(" ")}
                  onClick={() => setSelectedIdx(index)}
                >
                  <div className={css.lessonNumber} style={isActive ? { background: "var(--terracotta)", color: "white" } : {}}>
                    {index + 1}
                  </div>
                  <div className={css.lessonInfo}>
                    <p className={css.lessonName}>{content.title || "Гарчиггүй"}</p>
                    <div className={css.lessonMeta}>
                      {hasVid  && <PlayCircle size={11} />}
                      {hasPdf  && <FileText size={11} />}
                      {hasImg  && <Image size={11} />}
                      {hasTest && <Award size={11} />}
                      {!hasVid && !hasPdf && !hasImg && !hasTest && <span style={{ color: "var(--ink-4)" }}>Хоосон</span>}
                    </div>
                  </div>
                  <div className={css.lessonStatus}><ChevronRight size={15} /></div>
                </button>
              );
            })}
          </div>

          {/* Add content */}
          <div className={css.addContentArea}>
            <input
              className={css.addContentInput}
              value={newContentTitle}
              onChange={e => setNewContentTitle(e.target.value)}
              onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addContent())}
              placeholder="Шинэ агуулгын гарчиг..."
            />
            <button className={css.addContentBtn} onClick={addContent} disabled={addingContent || !newContentTitle.trim()}>
              {addingContent ? <Loader size={15} className={css.spinnerInline} /> : <Plus size={15} />}
            </button>
          </div>

          {/* Stats bottom */}
          <div className={css.courseStats}>
            <div className={css.statItem}>
              <BarChart3 size={20} />
              <div>
                <p className={css.statLabel}>Дуусгасан хэрэглэгч</p>
                <p className={css.statValue}>{stats.completedUsers || 0} хүн</p>
              </div>
            </div>
            <div className={css.statItem}>
              <Star size={20} />
              <div>
                <p className={css.statLabel}>Дундаж үнэлгээ</p>
                <p className={css.statValue}>{Number(stats.avgRating || 0).toFixed(1)} / {stats.ratingCount || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── CONTENT AREA ── */}
        <div className={css.contentArea}>
          {selectedIdx === "info" ? (
            <LessonInfoEditor
              lesson={lesson} categories={categories}
              firstUnits={firstUnits} secondUnits={secondUnits}
              thirdUnits={thirdUnits} fourthUnits={fourthUnits}
              ranks={ranks} positions={positions} users={users}
              showToast={showToast} id={id}
              onSaved={(form) => setLesson(p => ({ ...p, ...form }))}
            />
          ) : currentContent ? (
            <ContentEditor
              content={currentContent} tests={tests}
              allImages={allImages} allPdfs={allPdfs}
              allVideos={allVideos} allContentTests={allContentTests}
              onUpdate={handleContentUpdate} onDelete={handleContentDelete}
              showToast={showToast}
            />
          ) : (
            <div className={css.playerSection}>
              <div className={css.empty}>Агуулга сонгоно уу.</div>
            </div>
          )}

          {/* Ratings */}
          <div className={css.tabsSection}>
            <div className={css.tabs}>
              <div className={`${css.tab} ${css.tabActive}`}>
                <Star size={17} /> Үнэлгээнүүд ({ratings.length})
              </div>
            </div>
            <div className={css.tabContent}>
              {ratings.length > 0 ? (
                <div className={css.ratingsContent}>
                  {ratings.map(r => (
                    <div key={r.id} className={css.ratingItem}>
                      <div className={css.ratingStars}>
                        {[0,1,2,3,4].map(i => <Star key={i} size={14} fill={i < r.rating ? "#F59E0B" : "none"} color="#B8860B" />)}
                      </div>
                      <p className={css.ratingTitle}>{r.title}</p>
                      <p className={css.ratingContent}>{r.content}</p>
                      {r.user && (
                        <p className={css.ratingUser}>
                          — {r.user.firstname} {r.user.lastname} <span>({r.user.kode})</span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className={css.empty}>Үнэлгээ байхгүй байна.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonEdit;