import React, { useEffect, useState, useCallback } from "react";
import css from "./style.module.css";
import axiosInstance from "../../Services/Api/AxiosInstance";
import { useNavigate } from "react-router-dom";
import UniversalTable from "../../Shared/UI/TableManagement";
import {
    BookOpen, Star, Users, FileText, Clock,
    Tag, Shield, CheckCircle,
} from "lucide-react";

/* ── Icons ──────────────────────────────────────────────── */
const Ico = ({ d, size = 16, color = "currentColor", sw = 2 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        {(Array.isArray(d) ? d : [d]).map((p, i) => <path key={i} d={p} />)}
    </svg>
);
const IcoLesson = ({ s = 16 }) => <Ico size={s} d={["M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z","M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"]} />;
const IcoHome   = ({ s = 16 }) => <Ico size={s} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />;
const IcoChevR  = ({ s = 15 }) => <Ico size={s} d="M9 18l6-6-6-6" />;
const IcoCheck  = ({ s = 15 }) => <Ico size={s} d="M22 11.08V12a10 10 0 11-5.93-9.14" />;
const IcoAlert  = ({ s = 15 }) => <Ico size={s} d={["M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z","M12 9v4","M12 17h.01"]} />;

/* ── Helpers ─────────────────────────────────────────────── */
const BASE_URL = "http://localhost:3000";
const getUrl = (p) => {
    if (!p) return null;
    const c = p.replace(/\\/g, "/");
    return c.startsWith("http") ? c : BASE_URL + (c.startsWith("/") ? c : "/" + c);
};

const TARGET_LABEL = {
    first_unit:  "1-р нэгж",
    second_unit: "2-р нэгж",
    third_unit:  "3-р нэгж",
    fourth_unit: "4-р нэгж",
    rank:        "Цол",
    position:    "Албан тушаал",
    user:        "Хэрэглэгч",
};

const Stars = ({ value = 0 }) => (
    <span style={{ display: "flex", gap: 1 }}>
        {[1, 2, 3, 4, 5].map(i => (
            <Star key={i} size={11}
                fill={i <= Math.round(value) ? "#D4AF37" : "none"}
                color={i <= Math.round(value) ? "#D4AF37" : "#D1D5DB"}
                strokeWidth={1.5}
            />
        ))}
    </span>
);

/* ══════════════════════════════════════════════════════════
   LESSON LIST
══════════════════════════════════════════════════════════ */
const LessonList = () => {
    const navigate = useNavigate();

    const [lessons,     setLessons]     = useState([]);
    const [categories,  setCategories]  = useState([]);
    const [firstUnits,  setFirstUnits]  = useState([]);
    const [secondUnits, setSecondUnits] = useState([]);
    const [thirdUnits,  setThirdUnits]  = useState([]);
    const [fourthUnits, setFourthUnits] = useState([]);
    const [ranks,       setRanks]       = useState([]);
    const [positions,   setPositions]   = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [toast,       setToast]       = useState(null);

    const showToast = useCallback((type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4000);
    }, []);

    /* ── Fetch all ── */
    useEffect(() => {
        (async () => {
            try {
                const [lessRes, catRes, fu, su, tu, fou, r, p] = await Promise.all([
                    axiosInstance.get("/lesson"),
                    axiosInstance.get("/lesson-category"),
                    axiosInstance.get("/first-units"),
                    axiosInstance.get("/second-units"),
                    axiosInstance.get("/third-units"),
                    axiosInstance.get("/fourth-units"),
                    axiosInstance.get("/rank"),
                    axiosInstance.get("/positions"),
                ]);
                if (lessRes?.status === 200) setLessons(lessRes.data.data    || []);
                if (catRes?.status  === 200) setCategories(catRes.data.data  || []);
                if (fu?.status      === 200) setFirstUnits(fu.data.data      || []);
                if (su?.status      === 200) setSecondUnits(su.data.data     || []);
                if (tu?.status      === 200) setThirdUnits(tu.data.data      || []);
                if (fou?.status     === 200) setFourthUnits(fou.data.data    || []);
                if (r?.status       === 200) setRanks(r.data.data            || []);
                if (p?.status       === 200) setPositions(p.data.data        || []);
            } catch (err) {
                console.error(err);
                showToast("error", "Мэдээлэл татахад алдаа гарлаа");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    /* ── Handlers ── */
    const handleEdit = useCallback((item) => {
        navigate(`/lessons-edit/${item.id}`);
    }, [navigate]);

    const handleView = useCallback((item) => {
        navigate(`/lessons-view/${item.id}`);
    }, [navigate]);

    const handleDelete = useCallback(async (id) => {
        try {
            await axiosInstance.delete(`/lesson/${id}`);
            setLessons(p => p.filter(l => l.id !== id));
            showToast("success", "Амжилттай устгагдлаа");
        } catch (err) {
            showToast("error", err?.response?.data?.message || "Устгахад алдаа гарлаа");
        }
    }, [showToast]);

    const handleAdd = useCallback(async (newItem) => {
        try {
            const res = await axiosInstance.post("/lesson", newItem);
            const created = res.data?.data || { ...newItem, id: Date.now() };
            setLessons(p => [...p, created]);
            showToast("success", "Шинэ хичээл нэмэгдлээ");
        } catch (err) {
            showToast("error", err?.response?.data?.message || "Нэмэхэд алдаа гарлаа");
        }
    }, [showToast]);

    const handleBulkDelete = useCallback(async (ids) => {
        try {
            await Promise.all(ids.map(id => axiosInstance.delete(`/lesson/${id}`)));
            setLessons(p => p.filter(l => !ids.includes(l.id)));
            showToast("success", `${ids.length} хичээл устгагдлаа`);
        } catch (err) {
            showToast("error", "Бөөнөөр устгахад алдаа гарлаа");
        }
    }, [showToast]);

    /* ── Columns ── */
    const columns = [
        {
            key:      "id",
            label:    "ID",
            width:    60,
            editable: false,
            render:   (_, v) => (
                <span style={{ fontSize: 12, fontWeight: 700, color: "#9CA3AF", fontStyle: "italic" }}>#{v}</span>
            ),
        },
        {
            key:   "title",
            label: "Хичээл",
            render: (row) => {
                const imgUrl = getUrl(row.image);
                return (
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                            width: 44, height: 44, borderRadius: 8, overflow: "hidden", flexShrink: 0,
                            border: "1.5px solid #EAECF0", background: "#F3F4F6",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            {imgUrl
                                ? <img src={imgUrl} alt={row.title}
                                    onError={e => { e.target.style.display = "none"; }}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                  />
                                : <BookOpen size={18} color="#D4AF37" strokeWidth={1.5} />
                            }
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, color: "#111827", fontSize: 13 }}>
                                {row.title || "—"}
                            </div>
                            <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 1 }}>
                                {row.instructor || "—"}
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            key:      "lesson_category",
            label:    "Ангилал",
            editable: false,
            render:   (row) => (
                row.lesson_category
                    ? <span style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "3px 10px", borderRadius: 20,
                        background: "rgba(225,118,27,.08)", border: "1px solid rgba(225,118,27,.2)",
                        fontSize: 12, fontWeight: 700, color: "#78350f",
                      }}>
                        <Tag size={11} />{row.lesson_category.name}
                      </span>
                    : <span style={{ color: "#CBD5E1", fontSize: 12 }}>—</span>
            ),
        },
        {
            key:      "contentCount",
            label:    "Контент",
            width:    90,
            editable: false,
            render:   (row) => (
                <span style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    fontSize: 13, color: "#6B7280", fontWeight: 600,
                }}>
                    <FileText size={13} color="#94A3B8" />{row.contentCount ?? 0}
                </span>
            ),
        },
        {
            key:      "avgRating",
            label:    "Үнэлгээ",
            width:    110,
            editable: false,
            render:   (row) => (
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <Stars value={row.avgRating || 0} />
                    <span style={{ fontSize: 11, color: "#94A3B8" }}>
                        {row.avgRating > 0 ? `${row.avgRating} (${row.ratingCount ?? 0})` : "—"}
                    </span>
                </div>
            ),
        },
        {
            key:      "activeUsers",
            label:    "Идэвхтэй",
            width:    90,
            editable: false,
            render:   (row) => (
                <span style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    fontSize: 13, fontWeight: 700, color: "#3B82F6",
                }}>
                    <Users size={13} color="#3B82F6" />{row.activeUsers ?? 0}
                </span>
            ),
        },
        {
            key:      "completedUsers",
            label:    "Дууссан",
            width:    90,
            editable: false,
            render:   (row) => (
                <span style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    fontSize: 13, fontWeight: 700, color: "#10B981",
                }}>
                    <CheckCircle size={13} color="#10B981" />{row.completedUsers ?? 0}
                </span>
            ),
        },
        {
            key:      "lesson_visiblity",
            label:    "Хамрах хүрээ",
            editable: false,
            render:   (row) => {
                const vis = row.lesson_visiblity || [];
                if (vis.length === 0) {
                    return (
                        <span style={{
                            padding: "3px 10px", borderRadius: 20,
                            background: "#F0FDF4", color: "#16A34A",
                            fontSize: 12, fontWeight: 600,
                        }}>Бүгд</span>
                    );
                }
                return (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {vis.slice(0, 2).map((v, i) => (
                            <span key={i} style={{
                                display: "inline-flex", alignItems: "center", gap: 4,
                                padding: "2px 8px", borderRadius: 20,
                                background: "rgba(42,2,160,.07)", border: "1px solid rgba(42,2,160,.15)",
                                fontSize: 11, fontWeight: 600, color: "#2A02A0",
                            }}>
                                <Shield size={10} />{TARGET_LABEL[v.target] || v.target}
                            </span>
                        ))}
                        {vis.length > 2 && (
                            <span style={{
                                padding: "2px 8px", borderRadius: 20,
                                background: "#F1F5F9", color: "#64748B",
                                fontSize: 11, fontWeight: 600,
                            }}>+{vis.length - 2}</span>
                        )}
                    </div>
                );
            },
        },
    ];

    /* ── Filter fields ── */
    const filterFields = [
        {
            key:      "lesson_category",
            label:    "Ангилал",
            options:  categories.map(c => ({ value: c.id, label: c.name })),
            filterFn: (item, val) => String(item.lesson_category?.id) === String(val),
        },
        {
            key:   "vis_target",
            label: "Хамрах хүрээ",
            options: [
                { value: "all", label: "Бүгдэд нээлттэй" },
                ...Object.entries(TARGET_LABEL).map(([val, label]) => ({ value: val, label })),
            ],
            filterFn: (item, val) =>
                val === "all"
                    ? !item.lesson_visiblity?.length
                    : item.lesson_visiblity?.some(v => v.target === val),
        },
        {
            key:   "avgRating",
            label: "Үнэлгээ",
            options: [
                { value: "rated",   label: "Үнэлгээтэй" },
                { value: "unrated", label: "Үнэлгээгүй"  },
            ],
            filterFn: (item, val) =>
                val === "rated" ? item.avgRating > 0 : !item.avgRating,
        },
        {
            key:   "contentCount",
            label: "Контент",
            options: [
                { value: "has",  label: "Контенттэй" },
                { value: "none", label: "Контентгүй"  },
            ],
            filterFn: (item, val) =>
                val === "has" ? (item.contentCount ?? 0) > 0 : !(item.contentCount ?? 0),
        },
    ];

    /* ── Stats ── */
    const totalActive    = lessons.reduce((s, l) => s + (l.activeUsers    || 0), 0);
    const totalCompleted = lessons.reduce((s, l) => s + (l.completedUsers || 0), 0);
    const avgRating      = lessons.length
        ? (lessons.reduce((s, l) => s + (l.avgRating || 0), 0) / lessons.length).toFixed(1)
        : "0.0";

    /* ════════════════════════════════════════════════════
       RENDER
    ════════════════════════════════════════════════════ */
    return (
        <div className={css.container}>

            {/* Toast */}
            {toast && (
                <div className={`${css.toast} ${toast.type === "success" ? css.toastSuccess : css.toastError}`}>
                    <div className={css.toastIcon}>
                        {toast.type === "success" ? <IcoCheck /> : <IcoAlert />}
                    </div>
                    <span>{toast.msg}</span>
                </div>
            )}

            {/* Breadcrumb */}
            <div className={css.breadcrumb}>
                <button className={css.bcItem} onClick={() => navigate("/")}>
                    <IcoHome /><span>Нүүр</span>
                </button>
                <IcoChevR />
                <span className={`${css.bcItem} ${css.bcActive}`}>
                    <IcoLesson /><span>Хичээл</span>
                </span>
            </div>

            {/* Page header */}
            <div className={css.pageHeader}>
                <div className={css.headerAccent} />
                <div className={css.headerLeft}>
                    <div className={css.headerIcon}><IcoLesson s={28} /></div>
                    <div>
                        <h1 className={css.headerTitle}>Хичээлийн жагсаалт</h1>
                        <p className={css.headerSub}>Нийт {lessons.length} хичээл бүртгэлтэй</p>
                    </div>
                </div>

          
            </div>

            {/* Table */}
            {loading ? (
                <div className={css.loading}>
                    <div className={css.spinner} />
                    <p>Мэдээлэл уншиж байна</p>
                </div>
            ) : (
                <UniversalTable
                    data={lessons}
                    columns={columns}
                    pageSize={12}
                    title="Хичээлийн жагсаалт"

                    permissionKey="lesson"
                    editMode="navigate"

                    enableSearch
                    enableSort
                    enableExport
                    enableRowSelection
                    enableBulkActions
                    enableFilter
                    enableAdd={false}

                    searchFields={["title", "instructor"]}
                    filterFields={filterFields}

                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onAdd={handleAdd}
                    onBulkDelete={handleBulkDelete}

                    addLabel="Хичээл нэмэх"

                    rowClassName={(item) =>
                        item.lesson_visiblity?.length > 0 ? css.rowRestricted : ""
                    }
                />
            )}
        </div>
    );
};

export default LessonList;