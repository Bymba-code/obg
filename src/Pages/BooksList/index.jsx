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

const BooksList = () => {
    const navigate = useNavigate();

    const [books,      setBooks]      = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [toast,      setToast]      = useState(null);

    const showToast = useCallback((type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4000);
    }, []);

    /* ── Fetch ── */
    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [booksRes, catsRes] = await Promise.all([
                    axiosInstance.get("/book"),
                    axiosInstance.get("/book-category"),
                ]);
                if (booksRes?.status === 200) setBooks(booksRes.data.data || []);
                if (catsRes?.status === 200)  setCategories(catsRes.data.data || []);
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
        navigate(`/books-edit/${item.id}`);
    }, [navigate]);

    const handleDelete = useCallback(async (id) => {
        try {
            await axiosInstance.delete(`/book/${id}`);
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
            const res = await axiosInstance.post("/book", newItem);
            const created = res.data?.data || { ...newItem, id: Date.now() };
            setBooks(p => [...p, created]);
            showToast("success", "Шинэ ном нэмэгдлээ");
        } catch (err) {
            showToast("error", err?.response?.data?.message || "Нэмэхэд алдаа гарлаа");
        }
    }, [showToast]);

    const handleBulkDelete = useCallback(async (ids) => {
        try {
            await Promise.all(ids.map(id => axiosInstance.delete(`/book/${id}`)));
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
            key:      "image",
            label:    "Зураг",
            width:    70,
            editable: false,
            render:   (row) => (
                <div style={{
                    width: 44, height: 44, borderRadius: 8, overflow: "hidden",
                    border: "1.5px solid #EAECF0", background: "#F3F4F6", flexShrink: 0,
                }}>
                    <img
                        src={getUrl(row.image)}
                        alt={row.title}
                        onError={e => { e.target.src = "/placeholder.png"; }}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                </div>
            ),
        },
        {
            key:   "title",
            label: "Номын нэр",
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
            key:      "books_category",
            label:    "Ангилал",
            editable: false,
            render:   (row) => (
                row.books_category
                    ? <span style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "3px 10px", borderRadius: 20,
                        background: "rgba(225,118,27,.08)", border: "1px solid rgba(225,118,27,.2)",
                        fontSize: 12, fontWeight: 700, color: "#78350f",
                      }}>
                        <Tag size={12} />{row.books_category.name}
                      </span>
                    : <span style={{ color: "#C4CAD4", fontSize: 12 }}>—</span>
            ),
        },
        {
            key:      "pageNumber",
            label:    "Хуудас",
            width:    90,
            render:   (_, value) => (
                <span style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    fontSize: 13, color: "#6B7280", fontWeight: 600,
                }}>
                    <BookOpen size={14} color="#B0B8C8" />{value ?? "—"}
                </span>
            ),
        },
        {
            key:      "book_files",
            label:    "PDF",
            width:    90,
            editable: false,
            render:   (row) => (
                row.book_files?.length > 0
                    ? <span style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        padding: "3px 10px", borderRadius: 20,
                        background: "#D1FAE5", color: "#059669",
                        fontSize: 12, fontWeight: 700,
                      }}><FileText size={11} />Байна</span>
                    : <span style={{
                        padding: "3px 10px", borderRadius: 20,
                        background: "#F3F4F6", color: "#9CA3AF",
                        fontSize: 12, fontWeight: 600,
                      }}>Байхгүй</span>
            ),
        },
        {
            key:      "avgRating",
            label:    "Үнэлгээ",
            width:    100,
            editable: false,
            render:   (row) => (
                <span style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    fontSize: 13, fontWeight: 700, color: "#1F2937",
                }}>
                    <Star size={13}
                        fill={row.avgRating > 0 ? "#F59E0B" : "#E5E7EB"}
                        color={row.avgRating > 0 ? "#F59E0B" : "#E5E7EB"} />
                    {row.avgRating > 0 ? row.avgRating : "—"}
                    <span style={{ color: "#B0B8C8", fontWeight: 400, fontSize: 12 }}>
                        ({row.ratingCount ?? 0})
                    </span>
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
                    <IcoBook /><span>Ном</span>
                </span>
            </div>

            {/* Page header */}
            <div className={css.pageHeader}>
                <div className={css.headerAccent} />
                <div className={css.headerLeft}>
                    <div className={css.headerIcon}><IcoBook s={28} /></div>
                    <div>
                        <h1 className={css.headerTitle}>Ном</h1>
                        <p className={css.headerSub}>Номын жагсаалт ба удирдлага</p>
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
                    title="Номын жагсаалт"

                    permissionKey="books"
                    editMode="navigate"

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

export default BooksList;