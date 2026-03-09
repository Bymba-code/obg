import React, { useState, useEffect } from "react";
import css from "./style.module.css";
import axiosInstance from "../../Services/Api/AxiosInstance";
import {
    ChevronRight, Home, Loader, CheckCircle, AlertCircle,
    Type, Plus, Trash2, Users, Building2, Shield, BookOpen, Tag
} from "lucide-react";
import { useNavigate } from "react-router-dom";

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

const BooksCategoryAdd = () => {
    const navigate = useNavigate();
    const [loading,      setLoading]      = useState(false);
    const [toast,        setToast]        = useState(null);

    const [firstUnits,   setFirstUnits]   = useState([]);
    const [secondUnits,  setSecondUnits]  = useState([]);
    const [thirdUnits,   setThirdUnits]   = useState([]);
    const [fourthUnits,  setFourthUnits]  = useState([]);
    const [ranks,        setRanks]        = useState([]);
    const [positions,    setPositions]    = useState([]);
    const [users,        setUsers]        = useState([]);

    const [name,         setName]         = useState("");
    const [visibilities, setVisibilities] = useState([]);
    const [errors,       setErrors]       = useState({});

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4000);
    };

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [fu, su, tu, fou, r, p, u] = await Promise.all([
                    axiosInstance.get("/first-units"),
                    axiosInstance.get("/second-units"),
                    axiosInstance.get("/third-units"),
                    axiosInstance.get("/fourth-units"),
                    axiosInstance.get("/rank"),
                    axiosInstance.get("/positions"),
                    axiosInstance.get("/users"),
                ]);
                if (fu?.status  === 200) setFirstUnits(fu.data.data   || []);
                if (su?.status  === 200) setSecondUnits(su.data.data  || []);
                if (tu?.status  === 200) setThirdUnits(tu.data.data   || []);
                if (fou?.status === 200) setFourthUnits(fou.data.data || []);
                if (r?.status   === 200) setRanks(r.data.data         || []);
                if (p?.status   === 200) setPositions(p.data.data     || []);
                if (u?.status   === 200) setUsers(u.data.data         || []);
            } catch (err) {
                console.error(err);
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
        if (!name.trim()) e.name = "Нэр оруулна уу";
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

            const res = await axiosInstance.post("/book-category", {
                name: name.trim(),
                visibilities: cleanVis,
            });

            if (res?.status === 200 || res?.status === 201) {
                showToast("success", "Ангилал амжилттай нэмэгдлээ");
                setName("");
                setVisibilities([]);
                setTimeout(() => navigate("/book-categories"), 1200);
            }
        } catch (err) {
            showToast("error", err?.response?.data?.message || "Алдаа гарлаа");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={css.bcaPage}>

            {/* ── Toast ── */}
            {toast && (
                <div className={`${css.bcaToast} ${toast.type === "success" ? css.bcaToastSuccess : css.bcaToastError}`}>
                    {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    <span>{toast.msg}</span>
                </div>
            )}

            {/* ── Breadcrumb ── */}
            <div className={css.bcaBreadcrumb}>
                <span className={css.bcaBcItem} onClick={() => navigate("/")}><Home size={13} /> Нүүр</span>
                <ChevronRight size={12} className={css.bcaBcSep} />
                <span className={css.bcaBcItem} onClick={() => navigate("/book-categories")}><BookOpen size={13} /> Номын ангилал</span>
                <ChevronRight size={12} className={css.bcaBcSep} />
                <span className={`${css.bcaBcItem} ${css.bcaBcActive}`}><Plus size={13} /> Ангилал нэмэх</span>
            </div>

            {/* ── Card ── */}
            <div className={css.bcaCard}>

                {/* Card header */}
                <div className={css.bcaCardHeader}>
                    <div className={css.bcaHeaderIcon}>
                        <BookOpen size={20} />
                    </div>
                    <div>
                        <h2 className={css.bcaCardTitle}>Номын ангилал нэмэх</h2>
                        <p className={css.bcaCardSub}>Шинэ ангилал үүсгэх</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>

                    {/* ── Үндсэн мэдээлэл ── */}
                    <div className={css.bcaSection}>
                        <div className={css.bcaSectionLabel}><Tag size={14} /> Үндсэн мэдээлэл</div>

                        <div className={css.bcaFormGroup}>
                            <label className={css.bcaLabel}>
                                <Type size={12} /> Ангилалын нэр <span className={css.bcaReq}>*</span>
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: "" })); }}
                                placeholder="Ангилалын нэр оруулна уу..."
                                className={`${css.bcaInput} ${errors.name ? css.bcaInputErr : ""}`}
                            />
                            {errors.name && <span className={css.bcaErrMsg}>{errors.name}</span>}
                        </div>
                    </div>

                    {/* ── Хамрах хүрээ ── */}
                    <div className={css.bcaSection}>
                        <div className={css.bcaSectionLabel}><Users size={14} /> Хамрах хүрээ</div>

                        <div className={css.bcaInfoBox}>
                            <AlertCircle size={13} />
                            <span>Тодорхойлохгүй бол <strong>бүх хэрэглэгчид</strong> харагдана.</span>
                        </div>

                        {visibilities.map((vis, idx) => {
                            const opts = getOptions(vis.target);
                            return (
                                <div key={idx} className={css.bcaVisRow}>
                                    <span className={css.bcaVisIdx}>{idx + 1}</span>
                                    <div style={{ flex: 1 }}>
                                        <select
                                            value={vis.target}
                                            onChange={e => changeVis(idx, "target", e.target.value)}
                                            className={`${css.bcaSelect} ${errors[`vis_${idx}`] ? css.bcaInputErr : ""}`}
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
                                            className={css.bcaSelect}
                                        >
                                            <option value="">Бүгд</option>
                                            {opts.map(o => <option key={o.value} value={String(o.value)}>{o.label}</option>)}
                                        </select>
                                    </div>
                                    <button type="button" className={css.bcaVisDelBtn} onClick={() => removeVis(idx)}>
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            );
                        })}

                        <button type="button" className={css.bcaAddVisBtn} onClick={addVis}>
                            <Plus size={13} /> Нөхцөл нэмэх
                        </button>

                        {visibilities.some(v => v.target) && (
                            <div className={css.bcaPreviewTags}>
                                {visibilities.filter(v => v.target).map((v, i) => {
                                    const tLabel = TARGET_OPTIONS.find(t => t.value === v.target)?.label;
                                    const opts   = getOptions(v.target);
                                    const rLabel = v.requirement
                                        ? opts.find(o => String(o.value) === String(v.requirement))?.label || v.requirement
                                        : "Бүгд";
                                    return (
                                        <span key={i} className={css.bcaPreviewTag}>
                                            {TARGET_ICON[v.target]} {tLabel}: {rLabel}
                                        </span>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* ── Actions ── */}
                    <div className={css.bcaActions}>
                        <button
                            type="button"
                            className={css.bcaCancelBtn}
                            onClick={() => navigate("/book-categories")}
                            disabled={loading}
                        >
                            Цуцлах
                        </button>
                        <button type="submit" className={css.bcaSubmitBtn} disabled={loading}>
                            {loading
                                ? <><Loader size={14} className={css.bcaSpinner} /> Нэмж байна...</>
                                : <><Plus size={14} /> Ангилал нэмэх</>
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BooksCategoryAdd;