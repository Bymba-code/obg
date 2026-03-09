import React, { useState, useEffect } from "react";
import css from "./style.module.css";
import axiosInstance from "../../Services/Api/AxiosInstance";
import {
    BookOpen, ChevronRight, Home, Loader,
    CheckCircle, AlertCircle, Type, FileText,
    Plus, Trash2, Users, Building2, Shield,
    Hash, AlignLeft, Tag, ImageIcon, Save, RefreshCw
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const BASE_URL = "http://localhost:3000";

const getUrl = (path) => {
    if (!path) return null;
    const clean = path.replace(/\\/g, "/");
    if (clean.startsWith("/undefined") || clean === "/") return null;
    return BASE_URL + clean;
};

/* ── Constants ───────────────────────────────────────────── */
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
    rank:        <Shield size={12} />,
    position:    <Shield size={12} />,
    user:        <Users size={12} />,
};

const EMPTY_VIS = { target: "", requirement: "" };

/* ── Component ───────────────────────────────────────────── */
const BooksEdit = () => {
    const { id }   = useParams();
    const navigate = useNavigate();

    const [loading,     setLoading]     = useState(false);
    const [fetching,    setFetching]    = useState(true);   // initial data load
    const [toast,       setToast]       = useState(null);

    /* lookup data */
    const [categories,  setCategories]  = useState([]);
    const [firstUnits,  setFirstUnits]  = useState([]);
    const [secondUnits, setSecondUnits] = useState([]);
    const [thirdUnits,  setThirdUnits]  = useState([]);
    const [fourthUnits, setFourthUnits] = useState([]);
    const [ranks,       setRanks]       = useState([]);
    const [positions,   setPositions]   = useState([]);
    const [users,       setUsers]       = useState([]);

    /* form state */
    const [form,         setForm]         = useState({ category: "", title: "", description: "", pageNumber: "" });
    const [imageFile,    setImageFile]    = useState(null);
    const [imagePreview, setImagePreview] = useState(null);   // URL.createObjectURL OR existing server URL
    const [pdfFile,      setPdfFile]      = useState(null);
    const [existingPdf,  setExistingPdf]  = useState(null);   // existing PDF filename from server
    const [visibilities, setVisibilities] = useState([]);
    const [errors,       setErrors]       = useState({});

    /* ── 1. Lookup + book data татах ───────────────────── */
    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [cat, fu, su, tu, fou, r, p, u, book] = await Promise.all([
                    axiosInstance.get("/book-category"),
                    axiosInstance.get("/first-units"),
                    axiosInstance.get("/second-units"),
                    axiosInstance.get("/third-units"),
                    axiosInstance.get("/fourth-units"),
                    axiosInstance.get("/rank"),
                    axiosInstance.get("/positions"),
                    axiosInstance.get("/users"),
                    axiosInstance.get(`/book/${id}`),
                ]);

                if (cat?.status === 200) setCategories(cat.data.data  || []);
                if (fu?.status  === 200) setFirstUnits(fu.data.data   || []);
                if (su?.status  === 200) setSecondUnits(su.data.data  || []);
                if (tu?.status  === 200) setThirdUnits(tu.data.data   || []);
                if (fou?.status === 200) setFourthUnits(fou.data.data || []);
                if (r?.status   === 200) setRanks(r.data.data         || []);
                if (p?.status   === 200) setPositions(p.data.data     || []);
                if (u?.status   === 200) setUsers(u.data.data         || []);

                /* ── Номын мэдээлэл form-д дүүргэх ── */
                if (book?.status === 200) {
                    const d = book.data.data;

                    setForm({
                        category:    d.category    ? String(d.category)    : "",
                        title:       d.title       || "",
                        description: d.description || "",
                        pageNumber:  d.pageNumber  ? String(d.pageNumber)  : "",
                    });

                    // Одоо байгаа зураг
                    const imgUrl = getUrl(d.image);
                    if (imgUrl) setImagePreview(imgUrl);

                    // Одоо байгаа PDF
                    const pdfPath = d.book_files?.[0]?.file;
                    if (pdfPath) {
                        const clean = pdfPath.replace(/\\/g, "/");
                        setExistingPdf(clean.split("/").pop());   // filename only
                    }

                    // Visibility
                    if (Array.isArray(d.book_visiblity) && d.book_visiblity.length > 0) {
                        setVisibilities(
                            d.book_visiblity.map(v => ({
                                id: v.id || "",
                                target:      v.target      || "",
                                requirement: v.requirement ? String(v.requirement) : "",
                            }))
                        );
                    }
                }
            } catch (err) {
                console.error(err);
                showToast("error", "Мэдээлэл татахад алдаа гарлаа");
            } finally {
                setFetching(false);
            }
        };

        fetchAll();
    }, [id]);

    /* ── Helpers ────────────────────────────────────────── */
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
                label: ((e.firstname || "") + " " + (e.lastname || "")).trim() || e.kode
            }));
            default: return [];
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(p => ({ ...p, [name]: value }));
        if (errors[name]) setErrors(p => ({ ...p, [name]: "" }));
    };

    const handleImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        if (errors.image) setErrors(p => ({ ...p, image: "" }));
    };

    const handlePdf = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setPdfFile(file);
        setExistingPdf(null);
        if (errors.pdf) setErrors(p => ({ ...p, pdf: "" }));
    };

    const addVis    = ()         => setVisibilities(p => [...p, { ...EMPTY_VIS }]);
    const removeVis = (i)        => setVisibilities(p => p.filter((_, idx) => idx !== i));
    const changeVis = (i, k, v)  => setVisibilities(p =>
        p.map((row, idx) => idx === i
            ? { ...row, [k]: v, ...(k === "target" ? { requirement: "" } : {}) }
            : row
        )
    );

    /* ── Validation: edit-д зураг/PDF заавал биш ── */
    const validate = () => {
        const e = {};
        if (!form.category)           e.category    = "Ангилал сонгоно уу";
        if (!form.title.trim())       e.title       = "Нэр оруулна уу";
        if (!form.description.trim()) e.description = "Тайлбар оруулна уу";
        if (!form.pageNumber || parseInt(form.pageNumber) <= 0)
                                      e.pageNumber  = "Хуудсын тоо оруулна уу";
        // зураг: шинэ файл байхгүй бол одоо байгаа preview байх ёстой
        if (!imageFile && !imagePreview) e.image = "Зураг оруулна уу";
        // PDF: шинэ файл байхгүй бол existing нэр байх ёстой
        if (!pdfFile && !existingPdf)   e.pdf   = "PDF файл оруулна уу";
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

    /* ── Submit → PUT /book/:id ─────────────────────────── */
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
            fd.append("pageNumber",  form.pageNumber);

            // Зураг: шинэ файл сонгосон бол илгээх, үгүй бол хуучин хадгалагдана
            if (imageFile) fd.append("file", imageFile);

            // PDF: шинэ файл сонгосон бол илгээх
            if (pdfFile) fd.append("pdf", pdfFile);

            if (cleanVis.length > 0) fd.append("visibilities", JSON.stringify(cleanVis));

            const res = await axiosInstance.put(`/book/${id}`, fd, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (res?.status === 200) {
                showToast("success", "Ном амжилттай шинэчлэгдлээ");
            }
        } catch (err) {
            console.error(err);
            showToast("error", err?.response?.data?.message || "Алдаа гарлаа");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBookVisiblity = async (id, index) => {
        try 
        {
            const response = await axiosInstance.delete(`/book-visiblity/${id}`)

            if(response && response.status === 200)
            {
                showToast("success", "Амжилттай.")
                removeVis(index)
            }

        }
        catch(err)
        {
            console.log(err)
        }
    }

    /* ── Loading screen ─────────────────────────────────── */
    if (fetching) {
        return (
            <div className={css.container}>
                <div className={css.loadingContainer}>
                    <div className={css.loader} />
                    <p>Номын мэдээлэл татаж байна...</p>
                </div>
            </div>
        );
    }

    /* ── Render ─────────────────────────────────────────── */
    return (
        <div className={css.container}>

            {/* Toast */}
            {toast && (
                <div className={`${css.notification} ${css[toast.type]}`}>
                    {toast.type === "success"
                        ? <CheckCircle size={18} />
                        : <AlertCircle size={18} />
                    }
                    <span>{toast.msg}</span>
                </div>
            )}

            {/* Breadcrumb */}
            <div className={css.breadcrumb}>
                <div className={css.breadcrumbItem} onClick={() => navigate("/")}>
                    <Home size={14} /><span>Нүүр</span>
                </div>
                <ChevronRight size={14} className={css.breadcrumbSeparator} />
                <div className={css.breadcrumbItem} onClick={() => navigate("/books-list")}>
                    <BookOpen size={14} /><span>Номын жагсаалт</span>
                </div>
                <ChevronRight size={14} className={css.breadcrumbSeparator} />
                <div className={`${css.breadcrumbItem} ${css.active}`}>
                    <RefreshCw size={14} /><span>Ном засах</span>
                </div>
            </div>

            {/* Page header */}
            <div className={css.pageHeader}>
                <div className={css.headerContent}>
                    <div className={css.headerIcon}>
                        <BookOpen size={26} />
                    </div>
                    <div className={css.headerText}>
                        <h1>Ном засах</h1>
                        <p>Номын мэдээллийг шинэчлэх</p>
                    </div>
                </div>

                {/* Book ID badge */}
                <div style={{
                    padding: "8px 16px",
                    background: "rgba(212,175,55,0.08)",
                    border: "1.5px solid rgba(212,175,55,0.2)",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#78681A",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                }}>
                    <BookOpen size={14} color="#D4AF37" />
                    Ном #{id}
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

                        {/* Ангилал */}
                        <div className={css.formGroup}>
                            <label className={css.label}>
                                <Tag size={14} /><span>Ангилал</span>
                                <span className={css.required}>*</span>
                            </label>
                            <select
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                className={`${css.select} ${errors.category ? css.error : ""}`}
                            >
                                <option value="">— Ангилал сонгох —</option>
                                {categories.map(c => (
                                    <option key={c.id} value={String(c.id)}>{c.name}</option>
                                ))}
                            </select>
                            {errors.category && <span className={css.errorMessage}>{errors.category}</span>}
                        </div>

                        {/* Нэр */}
                        <div className={css.formGroup}>
                            <label className={css.label}>
                                <Type size={14} /><span>Номын нэр</span>
                                <span className={css.required}>*</span>
                            </label>
                            <div className={css.inputWrapper}>
                                <Type size={15} className={css.inputIcon} />
                                <input
                                    type="text"
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    placeholder="Номын нэрийг оруулна уу"
                                    className={`${css.input} ${errors.title ? css.error : ""}`}
                                />
                            </div>
                            {errors.title && <span className={css.errorMessage}>{errors.title}</span>}
                        </div>

                        <div className={css.formGrid}>
                            {/* Тайлбар */}
                            <div className={css.formGroup} style={{ gridColumn: "1 / -1" }}>
                                <label className={css.label}>
                                    <AlignLeft size={14} /><span>Тайлбар</span>
                                    <span className={css.required}>*</span>
                                </label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="Номын товч тайлбар..."
                                    rows={3}
                                    className={`${css.textarea} ${errors.description ? css.error : ""}`}
                                />
                                {errors.description && <span className={css.errorMessage}>{errors.description}</span>}
                            </div>

                            {/* Хуудсын тоо */}
                            <div className={css.formGroup}>
                                <label className={css.label}>
                                    <Hash size={14} /><span>Нийт хуудас</span>
                                    <span className={css.required}>*</span>
                                </label>
                                <div className={css.inputWrapper}>
                                    <Hash size={15} className={css.inputIcon} />
                                    <input
                                        type="number"
                                        name="pageNumber"
                                        value={form.pageNumber}
                                        onChange={handleChange}
                                        placeholder="Жишээ: 248"
                                        min="1"
                                        className={`${css.input} ${errors.pageNumber ? css.error : ""}`}
                                    />
                                </div>
                                {errors.pageNumber && <span className={css.errorMessage}>{errors.pageNumber}</span>}
                            </div>
                        </div>
                    </div>

                    {/* ── Section 2: Файлууд ── */}
                    <div className={css.formSection}>
                        <div className={css.sectionHeader}>
                            <ImageIcon size={18} />
                            <h3>Файлууд</h3>
                            <span className={css.sectionBadge}
                                style={{ background: "rgba(100,116,139,0.08)", color: "#64748B", borderColor: "rgba(100,116,139,0.15)" }}>
                                Солих бол оруулна уу
                            </span>
                        </div>

                        <div className={css.fileRow}>
                            {/* Зураг */}
                            <div className={css.formGroup}>
                                <label className={css.label}>
                                    <ImageIcon size={14} /><span>Номын зураг</span>
                                </label>
                                <label className={`${css.fileDropZone} ${errors.image ? css.error : ""}`}>
                                    {imagePreview ? (
                                        <div className={css.imagePreviewWrapper}>
                                            <img src={imagePreview} alt="preview" className={css.imagePreview}
                                                onError={e => { e.target.style.display = "none"; }}
                                            />
                                            <div className={css.imagePreviewOverlay}>
                                                <span>Зураг солих</span>
                                            </div>
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
                                {/* Шинэ файл сонгосон заалт */}
                                {imageFile && (
                                    <span style={{ fontSize: 12, color: "#D4AF37", fontWeight: 600 }}>
                                        ✓ Шинэ зураг сонгогдсон
                                    </span>
                                )}
                                {errors.image && <span className={css.errorMessage}>{errors.image}</span>}
                            </div>

                            {/* PDF */}
                            <div className={css.formGroup}>
                                <label className={css.label}>
                                    <FileText size={14} /><span>PDF файл</span>
                                </label>
                                <label className={`${css.fileDropZone} ${errors.pdf ? css.error : ""}`}>
                                    <div className={css.fileDropContent}>
                                        <FileText
                                            size={28} strokeWidth={1.5}
                                            color={(pdfFile || existingPdf) ? "#D4AF37" : "#CBD5E1"}
                                        />
                                        {pdfFile ? (
                                            <>
                                                <p className={css.pdfFileName}>{pdfFile.name}</p>
                                                <span>{(pdfFile.size / 1024 / 1024).toFixed(2)} MB — шинэ</span>
                                            </>
                                        ) : existingPdf ? (
                                            <>
                                                <p className={css.pdfFileName}>{existingPdf}</p>
                                                <span>Одоогийн PDF</span>
                                            </>
                                        ) : (
                                            <>
                                                <p>PDF файл оруулах</p>
                                                <span>PDF формат</span>
                                            </>
                                        )}
                                    </div>
                                    <input type="file" accept="application/pdf" onChange={handlePdf} style={{ display: "none" }} />
                                </label>
                                {errors.pdf && <span className={css.errorMessage}>{errors.pdf}</span>}
                            </div>
                        </div>
                    </div>

                    {/* ── Section 3: Хамрах хүрээ ── */}
                    <div className={css.formSection}>
                        <div className={css.sectionHeader}>
                            <Users size={18} />
                            <h3>Хамрах хүрээ</h3>
                            <span className={css.sectionBadge}
                                style={{ background: "rgba(100,116,139,0.08)", color: "#64748B", borderColor: "rgba(100,116,139,0.15)" }}>
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
                                                Утга
                                                <span className={css.optionalTag}>заавал биш</span>
                                            </label>
                                            <select
                                                value={vis.requirement}
                                                onChange={e => changeVis(idx, "requirement", e.target.value)}
                                                disabled={!vis.target || opts.length === 0}
                                                className={css.visibilitySelect}
                                            >
                                                <option value="">Бүгд</option>
                                                {opts.map(o => (
                                                    <option key={o.value} value={String(o.value)}>{o.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <button type="button" className={css.removeVisibilityBtn} onClick={() => handleDeleteBookVisiblity(vis?.id, idx)}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        <button type="button" className={css.addVisibilityBtn} onClick={addVis}>
                            <Plus size={14} />Нөхцөл нэмэх
                        </button>

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
                                                {TARGET_ICON[v.target]}
                                                {tLabel}: {rLabel}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Actions ── */}
                    <div className={css.formActions}>
                        <button
                            type="button"
                            className={css.cancelButton}
                            onClick={() => navigate("/books-list")}
                            disabled={loading}
                        >
                            Цуцлах
                        </button>
                        <button type="submit" className={css.submitButton} disabled={loading}>
                            {loading ? (
                                <><Loader size={16} className={css.spinner} /><span>Хадгалж байна...</span></>
                            ) : (
                                <><Save size={16} /><span>Хадгалах</span></>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default BooksEdit;