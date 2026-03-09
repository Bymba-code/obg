import React, { useEffect, useState, useCallback } from "react";
import css from "./style.module.css";
import axiosInstance from "../../Services/Api/AxiosInstance";
import { useNavigate } from "react-router-dom";
import UniversalTable from "../../Shared/UI/TableManagement";
import { useAuth } from "../../App/Providers/AuthProvider";

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
const IcoTag   = ({ s = 14 }) => <Ico size={s} d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01" />;

const G = { a1:"#E1761B", a2:"#2A02A0", grad:"linear-gradient(135deg,#E1761B 0%,#2A02A0 100%)" };

const BooksCategoryList = () => {
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [toast,      setToast]      = useState(null);

    const showToast = useCallback((type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4000);
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const res = await axiosInstance.get("/book-category");
                if (res?.status === 200) setCategories(res.data.data || []);
            } catch (err) {
                console.error(err);
                showToast("error", "Мэдээлэл татахад алдаа гарлаа");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    /* ── Handlers ── */
    const handleEdit = useCallback(async (item) => {
        try {
            await axiosInstance.put(`/book-category/${item.id}`, { name: item.name });
            setCategories(p => p.map(c => c.id === item.id ? { ...c, ...item } : c));
            showToast("success", "Амжилттай шинэчлэгдлээ");
        } catch (err) {
            showToast("error", err?.response?.data?.message || "Засахад алдаа гарлаа");
        }
    }, [showToast]);

    const handleDelete = useCallback(async (id) => {
        try {
            await axiosInstance.delete(`/book-category/${id}`);
            setCategories(p => p.filter(c => c.id !== id));
            showToast("success", "Амжилттай устгагдлаа");
        } catch (err) {
            showToast("error", err?.response?.data?.message || "Устгахад алдаа гарлаа");
        }
    }, [showToast]);

    const handleView = useCallback((item) => {
        navigate(`/book-category-view/${item.id}`);
    }, [navigate]);

    const handleAdd = useCallback(async (newItem) => {
        try {
            const res = await axiosInstance.post("/book-category", { name: newItem.name });
            const created = res.data?.data || { ...newItem, id: Date.now(), book: [] };
            setCategories(p => [...p, created]);
            showToast("success", "Шинэ ангилал нэмэгдлээ");
        } catch (err) {
            showToast("error", err?.response?.data?.message || "Нэмэхэд алдаа гарлаа");
        }
    }, [showToast]);

    const handleBulkDelete = useCallback(async (ids) => {
        try {
            await Promise.all(ids.map(id => axiosInstance.delete(`/book-category/${id}`)));
            setCategories(p => p.filter(c => !ids.includes(c.id)));
            showToast("success", `${ids.length} ангилал устгагдлаа`);
        } catch (err) {
            showToast("error", "Бөөнөөр устгахад алдаа гарлаа");
        }
    }, [showToast]);

    /* ── Columns ── */
    const columns = [
        {
            key:      "id",
            label:    "ID",
            width:    64,
            editable: false,
            render:   (_, v) => (
                <span style={{ fontSize:12, fontWeight:700, color:"#9CA3AF", fontStyle:"italic" }}>#{v}</span>
            ),
        },
        {
            key:   "name",
            label: "Ангилалын нэр",
            render: (_, value) => (
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:32, height:32, borderRadius:8, flexShrink:0, background:"linear-gradient(135deg,rgba(225,118,27,.12),rgba(42,2,160,.08))", border:"1.5px solid rgba(225,118,27,.2)", display:"flex", alignItems:"center", justifyContent:"center", color:G.a1 }}>
                        <IcoTag/>
                    </div>
                    <span style={{ fontWeight:700, color:"#111827", fontSize:13 }}>{value || "—"}</span>
                </div>
            ),
        },
        {
            key:      "_bookCount",
            label:    "Номын тоо",
            width:    110,
            editable: false,
            render:   (row) => {
                const count = row.book?.length ?? 0;
                return (
                    <span style={{ fontWeight:800, fontSize:13, background:G.grad, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
                        {count}
                    </span>
                );
            },
        },
    ];

    /* ── Filter fields ── */
    const filterFields = [
        {
            key:   "_statusFilter",
            label: "Төлөв",
            options: [
                { value:"open",        label:"Нээлттэй" },
                { value:"restricted",  label:"Хязгаарлалттай" },
            ],
            filterFn: (item, val) => {
                const isRestricted = item.book_category_visiblity?.length > 0;
                if (val === "restricted") return isRestricted;
                if (val === "open")       return !isRestricted;
                return true;
            },
        },
    ];

    /* ════════════════════════════════════════════════════
       RENDER
    ════════════════════════════════════════════════════ */
    return (
        <div className={css.container}>

            {/* Toast */}
            {toast && (
                <div className={`${css.toast} ${toast.type==="success" ? css.toastSuccess : css.toastError}`}>
                    <div className={css.toastIcon}>
                        {toast.type==="success" ? <IcoCheck/> : <IcoAlert/>}
                    </div>
                    <span>{toast.msg}</span>
                </div>
            )}

            {/* Breadcrumb */}
            <div className={css.breadcrumb}>
                <button className={css.bcItem} onClick={() => navigate("/")}>
                    <IcoHome/><span>Нүүр</span>
                </button>
                <IcoChevR/>
                <span className={`${css.bcItem} ${css.bcActive}`}>
                    <IcoBook/><span>Номын ангилал</span>
                </span>
            </div>

            {/* Page header */}
            <div className={css.pageHeader}>
                <div className={css.headerAccent}/>
                <div className={css.headerLeft}>
                    <div className={css.headerIcon}><IcoBook s={28}/></div>
                    <div>
                        <h1 className={css.headerTitle}>Номын ангилал</h1>
                        <p className={css.headerSub}>Ангилалын жагсаалт ба удирдлага</p>
                    </div>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className={css.loading}>
                    <div className={css.spinner}/>
                    <p>Мэдээлэл уншиж байна</p>
                </div>
            ) : (
                <UniversalTable
                    data={categories}
                    columns={columns}
                    pageSize={10}
                    title="Ангилалын жагсаалт"

                    permissionKey="bookscategories"

                    enableSearch
                    enableSort
                    enableExport
                    enableRowSelection
                    enableBulkActions
                    enableFilter
                    enableDelete={true}
                    enableAdd={true}
                    enableEdit={true}
                    enableView={false}

                    searchFields={["name"]}
                    filterFields={filterFields}

                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onAdd={handleAdd}
                    onBulkDelete={handleBulkDelete}

                    addLabel="Ангилал нэмэх"

                    rowClassName={(item) =>
                        item.book_category_visiblity?.length > 0 ? css.rowRestricted : ""
                    }
                />
            )}
        </div>
    );
};

export default BooksCategoryList;