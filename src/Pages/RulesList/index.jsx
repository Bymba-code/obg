import React, { useEffect, useState, useCallback } from "react";
import css from "./style.module.css";
import axiosInstance from "../../Services/Api/AxiosInstance";
import { useNavigate } from "react-router-dom";
import UniversalTable from "../../Shared/UI/TableManagement";
import { BookOpen, FileText, Star, Tag, Eye } from "lucide-react";

/* ─── Icons ─────────────────────────────────────────────── */
const Ico = ({ d, size = 16, color = "currentColor", sw = 2 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        {(Array.isArray(d) ? d : [d]).map((p, i) => <path key={i} d={p} />)}
    </svg>
);
const IcoBook  = ({ s = 16 }) => <Ico size={s} d={["M4 19.5A2.5 2.5 0 016.5 17H20","M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"]} />;
const IcoHome  = ({ s = 16 }) => <Ico size={s} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />;
const IcoChevR = ({ s = 15 }) => <Ico size={s} d="M9 18l6-6-6-6" />;
const IcoCheck = ({ s = 15 }) => <Ico size={s} d="M22 11.08V12a10 10 0 11-5.93-9.14" />;
const IcoAlert = ({ s = 15 }) => <Ico size={s} d={["M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z","M12 9v4","M12 17h.01"]} />;

const BASE_URL = "http://localhost:3000";

const getUrl = (path) => {
    if (!path) return "/placeholder.png";
    const clean = path.replace(/\\/g, "/");
    if (clean.startsWith("/undefined") || clean === "/") return "/placeholder.png";
    return BASE_URL + clean;
};

/* ─────────────────────────────────────────────────────────── */

const RulesList = () => {
    const navigate = useNavigate();

    const [books,      setBooks]      = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [toast,      setToast]      = useState(null);

    const showToast = useCallback((type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4000);
    }, []);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [booksRes] = await Promise.all([
                    axiosInstance.get("/rules"),
                ]);
                if (booksRes?.status === 200) setBooks(booksRes.data.data || []);
            } catch (err) {
                console.error(err);
                showToast("error", "Мэдээлэл татахад алдаа гарлаа");
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    /* ── Handlers ── */
    const handleEdit = useCallback((item) => {
        navigate(`/rules-edit/${item.id}`);
    }, [navigate]);

    const handleDelete = useCallback(async (id) => {
        try {
            await axiosInstance.delete(`/rules/${id}`);
            setBooks(p => p.filter(b => b.id !== id));
            showToast("success", "Амжилттай устгагдлаа");
        } catch (err) {
            showToast("error", err?.response?.data?.message || "Устгахад алдаа гарлаа");
        }
    }, [showToast]);

    const handleView = useCallback((item) => {
        navigate(`/books-view/${item.id}`);
    }, [navigate]);

    const handleAdd = useCallback(async (newItem) => {
        try {
            const res = await axiosInstance.post("/rules", newItem);
            const created = res.data?.data || { ...newItem, id: Date.now() };
            setBooks(p => [...p, created]);
            showToast("success", "Шинэ ном нэмэгдлээ");
        } catch (err) {
            showToast("error", err?.response?.data?.message || "Нэмэхэд алдаа гарлаа");
        }
    }, [showToast]);

    const handleBulkDelete = useCallback(async (ids) => {
        try {
            await Promise.all(ids.map(id => axiosInstance.delete(`/rules/${id}`)));
            setBooks(p => p.filter(b => !ids.includes(b.id)));
            showToast("success", `${ids.length} ном устгагдлаа`);
        } catch (err) {
            showToast("error", "Бөөнөөр устгахад алдаа гарлаа");
        }
    }, [showToast]);

    const customActions = useCallback((item) => (
        // <button
        //     onClick={() => navigate(`/books-view/${item.id}`)}
        //     title="Дэлгэрэнгүй харах"
        //     style={{
        //         display: "flex", alignItems: "center", justifyContent: "center",
        //         width: 32, height: 32, borderRadius: 8,
        //         background: "linear-gradient(135deg,#E1761B,#c4640f)",
        //         border: "none", cursor: "pointer", flexShrink: 0,
        //         boxShadow: "0 2px 8px rgba(225,118,27,.3)",
        //         transition: "opacity .17s",
        //     }}
        //     onMouseEnter={e => e.currentTarget.style.opacity = ".8"}
        //     onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        // >
        //     <Eye size={15} color="white" />
        // </button>
        []
    ), [navigate]);

    const columns = [
        {
            key:      "id",
            label:    "ID",
            width:    64,
            editable: false,
            render:   (_, v) => (
                <span style={{ fontSize: 12, fontWeight: 700, color: "#9CA3AF", fontStyle: "italic" }}>#{v}</span>
            ),
        },
        {
            key:   "number",
            label: "Дугаар",
            render: (row, value) => (
                <div>
                    <div style={{ fontWeight: 700, color: "#111827", fontSize: 13 }}>{value || "—"}</div>
                    <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>
                        {row.description?.slice(0, 45)}{row.description?.length > 45 ? "…" : ""}
                    </div>
                </div>
            ),
        },
        {
            key:      "name",
            label:    "Нэр",
            editable: false,
            render:   (row, value) => (
                row.name
                    ? <span style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "3px 10px", borderRadius: 10,
                        background: "rgba(225,118,27,.08)", border: "1px solid rgba(225,118,27,.2)",
                        fontSize: 12, fontWeight: 700, color: "#78350f",
                      }}>
                        {value}
                      </span>
                    : <span style={{ color: "#C4CAD4", fontSize: 12 }}>—</span>
            ),
        },
        {
            key:      "verified",
            label:    "Баталгаажсан",
            width:    160,
            render:   (_, value) => (
                <span style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    fontSize: 13, color: "#6B7280", fontWeight: 600,
                }}>
                    {value.split("T")[0] ?? "—"}
                </span>
            ),
        },
    ];
    const filterFields = [
        {
            key:   "books_category",
            label: "Ангилал",
            options: categories.map(c => ({ value: c.id, label: c.name })),
            filterFn: (item, val) => String(item.books_category?.id) === String(val),
        },
        {
            key:   "book_files",
            label: "PDF",
            options: [
                { value: "yes", label: "PDF байна"   },
                { value: "no",  label: "PDF байхгүй" },
            ],
            filterFn: (item, val) =>
                val === "yes" ? item.book_files?.length > 0 : !item.book_files?.length,
        },
        {
            key:   "avgRating",
            label: "Үнэлгээ",
            options: [
                { value: "rated",   label: "Үнэлгээтэй"   },
                { value: "unrated", label: "Үнэлгээгүй"   },
            ],
            filterFn: (item, val) =>
                val === "rated" ? item.avgRating > 0 : !item.avgRating,
        },
    ];


    return (
        <div className={css.container}>

            {toast && (
                <div className={`${css.toast} ${toast.type === "success" ? css.toastSuccess : css.toastError}`}>
                    <div className={css.toastIcon}>
                        {toast.type === "success" ? <IcoCheck /> : <IcoAlert />}
                    </div>
                    <span>{toast.msg}</span>
                </div>
            )}

            <div className={css.breadcrumb}>
                <button className={css.bcItem} onClick={() => navigate("/")}>
                    <IcoHome /><span>Нүүр</span>
                </button>
                <IcoChevR />
                <span className={`${css.bcItem} ${css.bcActive}`}>
                    <IcoBook /><span>Дүрам журам</span>
                </span>
            </div>

            {/* Page header */}
            <div className={css.pageHeader}>
                <div className={css.headerAccent} />
                <div className={css.headerLeft}>
                    <div className={css.headerIcon}><IcoBook s={28} /></div>
                    <div>
                        <h1 className={css.headerTitle}>Дүрэм журам</h1>
                        <p className={css.headerSub}>Дүрэм, журмын жагсаалт ба удирдлага</p>
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
                    data={books}
                    columns={columns}
                    pageSize={10}
                    title="Дүрэм, журмын жагсаалт"

                    permissionKey="rules"
                    editMode="inline"

                    enableSearch
                    enableSort
                    enableExport
                    enableRowSelection
                    enableBulkActions
                    enableFilter
                    enableAdd={false}

                    searchFields={["title", "description"]}
                    filterFields={filterFields}

                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onAdd={handleAdd}
                    onBulkDelete={handleBulkDelete}

                    customActions={customActions}

                    addLabel="Ном нэмэх"

                    rowClassName={(item) =>
                        item.book_files?.length === 0 ? css.rowRestricted : ""
                    }
                />
            )}
        </div>
    );
};

export default RulesList;