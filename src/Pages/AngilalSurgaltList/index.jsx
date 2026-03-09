import React, { useEffect, useState, useCallback } from "react";
import css from "./style.module.css";
import axiosInstance from "../../Services/Api/AxiosInstance";
import { useNavigate } from "react-router-dom";
import UniversalTable from "../../Shared/UI/TableManagement";
import { Users, MapPin, User, BarChart2, ChevronDown, ChevronUp, RefreshCw, FileDown } from "lucide-react";
import * as XLSX from "xlsx";

/* ─── Inline SVG icons ───────────────────────────────────── */
const Ico = ({ d, size = 16, color = "currentColor", sw = 2 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        {(Array.isArray(d) ? d : [d]).map((p, i) => <path key={i} d={p} />)}
    </svg>
);
const IcoUsers  = ({ s = 16 }) => <Ico size={s} d={["M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2","M23 21v-2a4 4 0 00-3-3.87","M16 3.13a4 4 0 010 7.75","M9 7a4 4 0 100 8 4 4 0 000-8z"]} />;
const IcoHome   = ({ s = 16 }) => <Ico size={s} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />;
const IcoChevR  = ({ s = 15 }) => <Ico size={s} d="M9 18l6-6-6-6" />;
const IcoCheck  = ({ s = 15 }) => <Ico size={s} d="M22 11.08V12a10 10 0 11-5.93-9.14" />;
const IcoAlert  = ({ s = 15 }) => <Ico size={s} d={["M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z","M12 9v4","M12 17h.01"]} />;

/* ─── Helpers ────────────────────────────────────────────── */
const GENDER_LABEL = { male: "Эрэгтэй", female: "Эмэгтэй", M: "Эрэгтэй", F: "Эмэгтэй" };
const nullBadge = <span style={{ color: "#C4CAD4", fontSize: 12 }}>—</span>;

/* uniq — module scope-д байх ёстой, useEffect дотор биш */
const uniq = (arr, key) =>
    [...new Map(
        (Array.isArray(arr) ? arr : []).filter(r => r[key])
            .map(r => [r[key], r[key]])
    ).values()].map(v => ({ value: v, label: String(v) }));

const chip = (label, bg, color, border) => (
    <span style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: "3px 10px", borderRadius: 20,
        background: bg, border: `1px solid ${border}`,
        fontSize: 12, fontWeight: 700, color, whiteSpace: "nowrap",
    }}>{label}</span>
);

/* ─── ReportBar — нэг мөр progress bar ──────────────────── */
const ReportBar = ({ label, count, personNumber, total, color = "#E1761B" }) => {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <div style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{label || "Тодорхойгүй"}</span>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "#9CA3AF" }}>{pct}%</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{count} бүртгэл</span>
                    {personNumber > 0 && (
                        <span style={{ fontSize: 12, color: "#6B7280" }}>/ {personNumber} хүн</span>
                    )}
                </div>
            </div>
            <div style={{ height: 7, background: "#F3F4F6", borderRadius: 99, overflow: "hidden" }}>
                <div style={{
                    height: "100%", borderRadius: 99, width: `${pct}%`,
                    background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                    transition: "width .6s cubic-bezier(.34,1.56,.64,1)",
                }} />
            </div>
        </div>
    );
};

/* ─── ReportSection — нугалах боломжтой хэсэг ───────────── */
const ReportSection = ({ title, icon, items, total, color, defaultOpen = true }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div style={{
            background: "white", border: "1.5px solid #F1F5F9",
            borderRadius: 14, overflow: "hidden", marginBottom: 12,
        }}>
            <button
                onClick={() => setOpen(o => !o)}
                style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 8,
                    padding: "12px 16px", background: "none", border: "none",
                    cursor: "pointer", textAlign: "left",
                    borderBottom: open ? "1.5px solid #F1F5F9" : "none",
                }}
            >
                <span style={{ color }}>{icon}</span>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: "#111827" }}>{title}</span>
                <span style={{ fontSize: 12, color: "#9CA3AF", marginRight: 6 }}>
                    {items.length} утга
                </span>
                {open ? <ChevronUp size={15} color="#9CA3AF" /> : <ChevronDown size={15} color="#9CA3AF" />}
            </button>
            {open && (
                <div style={{ padding: "14px 16px" }}>
                    {items.length === 0
                        ? <p style={{ fontSize: 13, color: "#C4CAD4", margin: 0 }}>Мэдээлэл байхгүй</p>
                        : items.map((item, i) => (
                            <ReportBar
                                key={i}
                                label={item.value ?? item.label}
                                count={item.count}
                                personNumber={item.personNumber}
                                total={total}
                                color={color}
                            />
                        ))
                    }
                </div>
            )}
        </div>
    );
};

/* ════════════════════════════════════════════════════════════
   AngilalSurgaltList
════════════════════════════════════════════════════════════ */
/* ─── Excel export ───────────────────────────────────────── */
const GENDER_LABEL_XLS = { male: "Эрэгтэй", female: "Эмэгтэй", M: "Эрэгтэй", F: "Эмэгтэй" };

const exportToExcel = (data = [], report = null) => {
    const wb = XLSX.utils.book_new();

    /* Sheet 1 — Жагсаалт */
    const listRows = [
        ["ID", "Ангилал", "Дэд ангилал", "Хот / Аймаг", "Дүүрэг / Сум", "Хүйс", "Нас", "Хүний тоо"],
        ...data.map(r => [
            r.id           ?? "",
            r.category     ?? "",
            r.sub_category ?? "",
            r.city         ?? "",
            r.district     ?? "",
            GENDER_LABEL_XLS[r.gender] ?? r.gender ?? "",
            r.age          ?? "",
            r.personNumber ?? "",
        ]),
    ];
    const wsList = XLSX.utils.aoa_to_sheet(listRows);
    wsList["!cols"] = [
        {wch:8},{wch:22},{wch:22},{wch:20},{wch:20},{wch:14},{wch:10},{wch:14},
    ];
    XLSX.utils.book_append_sheet(wb, wsList, "Жагсаалт");

    /* Sheet 2 — Тайлан хураангуй */
    if (report) {
        const rows = [];
        const push  = (...c) => rows.push(c);
        const pushH = (t)    => rows.push([`── ${t} ──`]);

        pushH("НИЙТ ДҮН");
        push("Нийт бүртгэл",   report.summary?.total        ?? 0);
        push("Нийт хүний тоо", report.summary?.totalPersons ?? 0);
        rows.push([]);

        const sections = [
            { title: "АНГИЛАЛААР",       key: "by_category"     },
            { title: "ДЭД АНГИЛАЛААР",   key: "by_sub_category" },
            { title: "ХОТ / АЙМГААР",    key: "by_city"         },
            { title: "ДҮҮРЭГ / СУМААР",  key: "by_district"     },
            { title: "ХҮЙСЭЭР",          key: "by_gender"       },
            { title: "НАСНЫ БҮЛГҮҮДЭЭР", key: "by_age_group"    },
        ];

        const total = report.summary?.total || 1;
        for (const sec of sections) {
            const items = report[sec.key] || [];
            if (!items.length) continue;
            pushH(sec.title);
            push("Утга", "Тоо", "Хүний тоо", "Хувь (%)");
            for (const item of items) {
                const pct = ((item.count / total) * 100).toFixed(1);
                push(item.value ?? item.label ?? "", item.count, item.personNumber ?? 0, `${pct}%`);
            }
            rows.push([]);
        }

        const wsReport = XLSX.utils.aoa_to_sheet(rows);
        wsReport["!cols"] = [{wch:28},{wch:14},{wch:14},{wch:12}];
        XLSX.utils.book_append_sheet(wb, wsReport, "Тайлан хураангуй");
    }

    const now     = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
    XLSX.writeFile(wb, `angilal_surgalt_${dateStr}.xlsx`);
};

const AngilalSurgaltList = () => {
    const navigate = useNavigate();

    const [data,    setData]    = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast,   setToast]   = useState(null);

    /* Report state */
    const [report,        setReport]        = useState(null);
    const [reportLoading, setReportLoading] = useState(false);
    const [showReport,    setShowReport]    = useState(false);

    /* Filter options — data-аас динамикаар */
    const [categories,    setCategories]    = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [cities,        setCities]        = useState([]);
    const [districts,     setDistricts]     = useState([]);

    const showToast = useCallback((type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4000);
    }, []);

    /* ── Fetch list ── */
    useEffect(() => {
        (async () => {
            try {
                const res = await axiosInstance.get("/angilal-surgalt");
                if (res?.status === 200) {
                    const rows = Array.isArray(res.data.data) ? res.data.data : [];
                    setData(rows);
                    setCategories(uniq(rows, "category"));
                    setSubCategories(uniq(rows, "sub_category"));
                    setCities(uniq(rows, "city"));
                    setDistricts(uniq(rows, "district"));
                }
            } catch (err) {
                console.error(err);
                showToast("error", "Мэдээлэл татахад алдаа гарлаа");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    /* ── Fetch report ── */
    const fetchReport = useCallback(async () => {
        setReportLoading(true);
        try {
            const res = await axiosInstance.get("/angilal-surgalt-report");
            if (res?.status === 200) {
                setReport(res.data.data);
                setShowReport(true);
            }
        } catch (err) {
            console.error(err);
            showToast("error", "Тайлан татахад алдаа гарлаа");
        } finally {
            setReportLoading(false);
        }
    }, []);

    /* ── CRUD ── */
    const handleEdit = useCallback((item) => navigate(`/angilal-surgalt-edit/${item.id}`), [navigate]);
    const handleView = useCallback((item) => navigate(`/angilal-surgalt-view/${item.id}`), [navigate]);

    const handleDelete = useCallback(async (id) => {
        try {
            await axiosInstance.delete(`/angilal-surgalt/${id}`);
            setData(p => p.filter(r => r.id !== id));
            showToast("success", "Амжилттай устгагдлаа");
        } catch (err) {
            showToast("error", err?.response?.data?.message || "Устгахад алдаа гарлаа");
        }
    }, [showToast]);

    const handleBulkDelete = useCallback(async (ids) => {
        try {
            await Promise.all(ids.map(id => axiosInstance.delete(`/angilal-surgalt/${id}`)));
            setData(p => p.filter(r => !ids.includes(r.id)));
            showToast("success", `${ids.length} бичлэг устгагдлаа`);
        } catch (err) {
            showToast("error", "Бөөнөөр устгахад алдаа гарлаа");
        }
    }, [showToast]);

    /* ── Columns ── */
    const columns = [
        {
            key: "id", label: "ID", width: 64, editable: false,
            render: (_, v) => <span style={{ fontSize: 12, fontWeight: 700, color: "#9CA3AF", fontStyle: "italic" }}>#{v}</span>,
        },
        {
            key: "category", label: "Ангилал",
            render: (_, v) => v ? chip(v, "rgba(225,118,27,.08)", "#78350f", "rgba(225,118,27,.22)") : nullBadge,
        },
        {
            key: "sub_category", label: "Дэд ангилал",
            render: (_, v) => v ? chip(v, "rgba(42,2,160,.07)", "#2A02A0", "rgba(42,2,160,.18)") : nullBadge,
        },
        {
            key: "city", label: "Хот / Аймаг",
            render: (_, v) => v
                ? <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, color: "#374151", fontWeight: 600 }}>
                    <MapPin size={13} color="#B0B8C8" />{v}
                  </span>
                : nullBadge,
        },
        {
            key: "district", label: "Дүүрэг / Сум",
            render: (_, v) => v ? <span style={{ fontSize: 13, color: "#374151", fontWeight: 600 }}>{v}</span> : nullBadge,
        },
        {
            key: "gender", label: "Хүйс", width: 110,
            render: (_, v) => {
                if (!v) return nullBadge;
                const label  = GENDER_LABEL[v] || v;
                const isMale = v === "male" || v === "M";
                return chip(
                    label,
                    isMale ? "rgba(59,130,246,.08)" : "rgba(236,72,153,.08)",
                    isMale ? "#1D4ED8" : "#9D174D",
                    isMale ? "rgba(59,130,246,.2)" : "rgba(236,72,153,.2)"
                );
            },
        },
        {
            key: "age", label: "Нас", width: 80,
            render: (_, v) => v != null
                ? <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 700, color: "#374151" }}>
                    <User size={13} color="#B0B8C8" />{v}
                  </span>
                : nullBadge,
        },
        {
            key: "personNumber", label: "Хүний тоо", width: 110,
            render: (_, v) => v != null
                ? <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 700, color: "#111827" }}>
                    <Users size={13} color="#B0B8C8" />{v}
                  </span>
                : nullBadge,
        },
    ];

    const filterFields = [
        { key: "category",     label: "Ангилал",      options: categories,    filterFn: (item, val) => String(item.category)     === String(val) },
        { key: "sub_category", label: "Дэд ангилал",  options: subCategories, filterFn: (item, val) => String(item.sub_category) === String(val) },
        { key: "city",         label: "Хот / Аймаг",  options: cities,        filterFn: (item, val) => String(item.city)         === String(val) },
        { key: "district",     label: "Дүүрэг / Сум", options: districts,     filterFn: (item, val) => String(item.district)     === String(val) },
        {
            key: "gender", label: "Хүйс",
            options: [
                { value: "male",   label: "Эрэгтэй"    },
                { value: "female", label: "Эмэгтэй"    },
                { value: "M",      label: "Эрэгтэй (M)" },
                { value: "F",      label: "Эмэгтэй (F)" },
            ],
            filterFn: (item, val) => item.gender === val,
        },
        {
            key: "personNumber", label: "Хүний тоо",
            options: [
                { value: "filled", label: "Байна"   },
                { value: "empty",  label: "Байхгүй" },
            ],
            filterFn: (item, val) => val === "filled" ? item.personNumber != null : item.personNumber == null,
        },
    ];

    /* ── Render ── */
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
                    <IcoUsers s={15} /><span>Ангилал сургалт</span>
                </span>
            </div>

            {/* Page header */}
            <div className={css.pageHeader}>
                <div className={css.headerAccent} />
                <div className={css.headerLeft}>
                    <div className={css.headerIcon}><IcoUsers s={28} /></div>
                    <div>
                        <h1 className={css.headerTitle}>Ангилал сургалт</h1>
                        <p className={css.headerSub}>Сургалтын ангиллын жагсаалт ба удирдлага</p>
                    </div>
                </div>

                {/* Тайлан + Excel товчнууд */}
                <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
                    <button
                        onClick={showReport ? () => setShowReport(false) : fetchReport}
                        disabled={reportLoading}
                        style={{
                            display: "flex", alignItems: "center", gap: 7,
                            padding: "9px 18px", borderRadius: 10, cursor: "pointer",
                            border: showReport ? "1.5px solid #E1761B" : "1.5px solid #E5E7EB",
                            background: showReport ? "rgba(225,118,27,.08)" : "white",
                            color: showReport ? "#E1761B" : "#374151",
                            fontSize: 13, fontWeight: 700, transition: "all .18s",
                        }}
                    >
                        {reportLoading
                            ? <RefreshCw size={14} style={{ animation: "spin .7s linear infinite" }} />
                            : <BarChart2 size={14} />
                        }
                        {showReport ? "Тайлан нуух" : "Тайлан харах"}
                    </button>

                    <button
                        onClick={() => exportToExcel(data, report)}
                        title={report ? "Жагсаалт + тайлан Excel-ээр татах" : "Жагсаалтыг Excel-ээр татах"}
                        style={{
                            display: "flex", alignItems: "center", gap: 7,
                            padding: "9px 18px", borderRadius: 10, cursor: "pointer",
                            border: "1.5px solid #16A34A",
                            background: "rgba(22,163,74,.07)",
                            color: "#15803D",
                            fontSize: 13, fontWeight: 700, transition: "all .18s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(22,163,74,.14)"}
                        onMouseLeave={e => e.currentTarget.style.background = "rgba(22,163,74,.07)"}
                    >
                        <FileDown size={14} />
                        Excel татах
                    </button>
                </div>
            </div>

            {/* ── REPORT PANEL ── */}
            {showReport && report && (
                <div style={{
                    background: "#F9FAFB", border: "1.5px solid #E5E7EB",
                    borderRadius: 18, padding: "20px 24px", marginBottom: 20,
                }}>

                    {/* Summary chips */}
                    <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
                        {[
                            { label: "Нийт бүртгэл",   value: report.summary.total,        color: "#E1761B", bg: "rgba(225,118,27,.08)", border: "rgba(225,118,27,.2)" },
                            { label: "Нийт хүний тоо", value: report.summary.totalPersons,  color: "#2A02A0", bg: "rgba(42,2,160,.07)",   border: "rgba(42,2,160,.18)" },
                            { label: "Ангилал",         value: report.by_category.length,   color: "#059669", bg: "rgba(5,150,105,.07)",  border: "rgba(5,150,105,.18)" },
                            { label: "Хот / Аймаг",    value: report.by_city.length,        color: "#0284C7", bg: "rgba(2,132,199,.07)", border: "rgba(2,132,199,.18)" },
                        ].map(s => (
                            <div key={s.label} style={{
                                background: s.bg, border: `1.5px solid ${s.border}`,
                                borderRadius: 12, padding: "10px 18px",
                                display: "flex", flexDirection: "column", gap: 2,
                            }}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: s.color, textTransform: "uppercase", letterSpacing: ".04em" }}>{s.label}</span>
                                <span style={{ fontSize: 22, fontWeight: 800, color: "#111827", lineHeight: 1 }}>{s.value}</span>
                            </div>
                        ))}
                    </div>

                    {/* Sections */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div>
                            <ReportSection
                                title="Ангилалаар"
                                icon={<BarChart2 size={15} />}
                                items={report.by_category}
                                total={report.summary.total}
                                color="#E1761B"
                            />
                            <ReportSection
                                title="Дэд ангилалаар"
                                icon={<BarChart2 size={15} />}
                                items={report.by_sub_category}
                                total={report.summary.total}
                                color="#2A02A0"
                                defaultOpen={false}
                            />
                            <ReportSection
                                title="Хүйсээр"
                                icon={<Users size={15} />}
                                items={report.by_gender}
                                total={report.summary.total}
                                color="#9D174D"
                            />
                        </div>
                        <div>
                            <ReportSection
                                title="Хот / Аймгаар"
                                icon={<MapPin size={15} />}
                                items={report.by_city}
                                total={report.summary.total}
                                color="#0284C7"
                            />
                            <ReportSection
                                title="Дүүрэг / Сумаар"
                                icon={<MapPin size={15} />}
                                items={report.by_district}
                                total={report.summary.total}
                                color="#059669"
                                defaultOpen={false}
                            />
                            <ReportSection
                                title="Насны бүлгүүдээр"
                                icon={<User size={15} />}
                                items={report.by_age_group}
                                total={report.summary.total}
                                color="#D97706"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* ── TABLE ── */}
            {loading ? (
                <div className={css.loading}>
                    <div className={css.spinner} />
                    <p>Мэдээлэл уншиж байна</p>
                </div>
            ) : (
                <UniversalTable
                    data={data}
                    columns={columns}
                    pageSize={10}
                    title="Ангилал сургалтын жагсаалт"

                    permissionKey="angilal-surgalt"
                    editMode="navigate"

                    enableSearch
                    enableSort
                    enableExport
                    enableRowSelection
                    enableBulkActions
                    enableFilter
                    enableAdd={false}

                    searchFields={["category", "sub_category", "city", "district"]}
                    filterFields={filterFields}

                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onBulkDelete={handleBulkDelete}

                    addLabel="Нэмэх"
                />
            )}
        </div>
    );
};

export default AngilalSurgaltList;