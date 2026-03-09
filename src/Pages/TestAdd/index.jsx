import React, { useState, useEffect } from "react";
import css from "./style.module.css";
import axiosInstance from "../../Services/Api/AxiosInstance";
import {
    BookOpen, ChevronRight, Home, Loader,
    CheckCircle, AlertCircle, Type, FileText,
    Plus, Trash2, Tag, ImageIcon
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const TestAdd = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    /* lookup data */
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const res = await axiosInstance.get("/test-category");
                if (res?.status === 200) {
                    setCategories(res.data.data || []);
                }
            } catch (err) {
                console.error("❌ Error loading categories:", err);
            }
        })();
    }, []);

    /* form state */
    const [form, setForm] = useState({ name: "", category: "" });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [errors, setErrors] = useState({});

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
        if (errors.img) setErrors(p => ({ ...p, img: "" }));
    };

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = "Нэр оруулна уу";
        if (!form.category) e.category = "Ангилал сонгоно уу";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 5000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            showToast("error", "Мэдээллээ бүрэн бөглөнө үү");
            return;
        }

        setLoading(true);
        try {
            const fd = new FormData();
            fd.append("name", form.name.trim());
            fd.append("category", form.category);
            if (imageFile) {
                fd.append("file", imageFile);
            }

            console.log("📤 Sending test data:", {
                name: form.name,
                category: form.category,
                has_image: !!imageFile
            });

            const res = await axiosInstance.post("/test", fd, {
                headers: { "Content-Type": "multipart/form-data" }
            });


            if (res?.status === 200 || res?.status === 201) {
                showToast("success", res.data.message || "Тест амжилттай нэмэгдлээ");
                setForm({ name: "", category: "" });
                setImageFile(null);
                setImagePreview(null);
                setTimeout(() => navigate(`/test-edit/${res?.data?.data?.id}`), 2000);
            }
        } catch (err) {
            console.error("❌ Error creating test:", err);
            const errorMsg = err?.response?.data?.message || "Алдаа гарлаа";
            showToast("error", errorMsg);
        } finally {
            setLoading(false);
        }
    };

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
                <div className={css.breadcrumbItem} onClick={() => navigate("/test-list")}>
                    <BookOpen size={14} /><span>Тестийн жагсаалт</span>
                </div>
                <ChevronRight size={14} className={css.breadcrumbSeparator} />
                <div className={`${css.breadcrumbItem} ${css.active}`}>
                    <Plus size={14} /><span>Тест нэмэх</span>
                </div>
            </div>

            {/* Page header */}
            <div className={css.pageHeader}>
                <div className={css.headerContent}>
                    <div className={css.headerIcon}>
                        <BookOpen size={26} />
                    </div>
                    <div className={css.headerText}>
                        <h1>Тест нэмэх</h1>
                        <p>Тестийн санд шинэ тест бүртгэх</p>
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

                        {/* Ангилал */}
                        <div className={css.formGroup}>
                            <label className={css.label}>
                                <Tag size={14} />
                                <span>Ангилал</span>
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
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            {errors.category && <span className={css.errorMessage}>{errors.category}</span>}
                        </div>

                        {/* Нэр */}
                        <div className={css.formGroup}>
                            <label className={css.label}>
                                <Type size={14} />
                                <span>Тестийн нэр</span>
                                <span className={css.required}>*</span>
                            </label>
                            <div className={css.inputWrapper}>
                                <Type size={15} className={css.inputIcon} />
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Тестийн нэрийг оруулна уу"
                                    className={`${css.input} ${errors.name ? css.error : ""}`}
                                />
                            </div>
                            {errors.name && <span className={css.errorMessage}>{errors.name}</span>}
                        </div>
                    </div>

                    {/* ── Section 2: Зураг ── */}
                    <div className={css.formSection}>
                        <div className={css.sectionHeader}>
                            <ImageIcon size={18} />
                            <h3>Зураг</h3>
                            <span className={css.sectionBadge} style={{ background: "rgba(100,116,139,0.08)", color: "#64748B", borderColor: "rgba(100,116,139,0.15)" }}>
                                Заавал биш
                            </span>
                        </div>

                        {/* Зураг */}
                        <div className={css.formGroup}>
                            <label className={css.label}>
                                <ImageIcon size={14} />
                                <span>Тестийн зураг</span>
                            </label>
                            <label className={`${css.fileDropZone} ${errors.img ? css.error : ""}`}>
                                {imagePreview ? (
                                    <div className={css.imagePreviewWrapper}>
                                        <img src={imagePreview} alt="preview" className={css.imagePreview} />
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
                            {errors.img && <span className={css.errorMessage}>{errors.img}</span>}
                        </div>
                    </div>

                    {/* ── Actions ── */}
                    <div className={css.formActions}>
                        <button
                            type="button"
                            className={css.cancelButton}
                            onClick={() => navigate("/test-list")}
                            disabled={loading}
                        >
                            Цуцлах
                        </button>
                        <button type="submit" className={css.submitButton} disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader size={16} className={css.spinner} />
                                    <span>Нэмж байна...</span>
                                </>
                            ) : (
                                <>
                                    <BookOpen size={16} />
                                    <span>Тест нэмэх</span>
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default TestAdd;