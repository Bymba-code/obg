import React, { useState, useEffect } from "react";
import css from "./style.module.css";
import axiosInstance from "../../Services/Api/AxiosInstance";
import {
    Bell, ChevronRight, Home, Loader,
    CheckCircle, AlertCircle, Type,
    FileText, Plus, Trash2, Users,
    Building2, Shield
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const TARGET_OPTIONS = [
    { value: "first_unit",   label: "1-р нэгж"     },
    { value: "second_unit",  label: "2-р нэгж"     },
    { value: "third_unit",   label: "3-р нэгж"     },
    { value: "fourth_unit",  label: "4-р нэгж"     },
    { value: "rank",         label: "Цол"          },
    { value: "position",     label: "Албан тушаал" },
    { value: "user",         label: "Хэрэглэгч"   },
];

const TARGET_ICON = {
    first_unit:   <Building2 size={14} />,
    second_unit:  <Building2 size={14} />,
    third_unit:   <Building2 size={14} />,
    fourth_unit:  <Building2 size={14} />,
    rank:         <Shield size={14} />,
    position:     <Shield size={14} />,
    user:         <Users size={14} />,
};

const EMPTY_VISIBILITY = { target: "", requirement: "" };

const NotificationAdd = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [toast, setToast]     = useState(null);

    const [firstUnits,  setFirstUnits]  = useState([]);
    const [secondUnits, setSecondUnits] = useState([]);
    const [thirdUnits,  setThirdUnits]  = useState([]);
    const [fourthUnits, setFourthUnits] = useState([]);
    const [ranks,       setRanks]       = useState([]);
    const [positions,   setPositions]   = useState([]);
    const [users,       setUsers]       = useState([]);

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
            case "first_unit":  return firstUnits.map((e)  => ({ value: e.id, label: e.name }));
            case "second_unit": return secondUnits.map((e) => ({ value: e.id, label: e.name }));
            case "third_unit":  return thirdUnits.map((e)  => ({ value: e.id, label: e.name }));
            case "fourth_unit": return fourthUnits.map((e) => ({ value: e.id, label: e.name }));
            case "rank":        return ranks.map((e)       => ({ value: e.id, label: e.name }));
            case "position":    return positions.map((e)   => ({ value: e.id, label: e.name }));
            case "user":        return users.map((e)       => ({
                value: e.id,
                label: ((e.firstname || "") + " " + (e.lastname || "")).trim() || e.kode
            }));
            default: return [];
        }
    };

    const [formData, setFormData] = useState({ title: "", contet: "" });
    const [visibilities, setVisibilities] = useState([]);
    const [errors, setErrors]             = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const addVisibility = () => {
        setVisibilities((prev) => [...prev, { ...EMPTY_VISIBILITY }]);
    };

    const removeVisibility = (index) => {
        setVisibilities((prev) => prev.filter((_, i) => i !== index));
    };

    const handleVisibilityChange = (index, field, value) => {
        setVisibilities((prev) =>
            prev.map((v, i) =>
                i === index
                    ? { ...v, [field]: value, ...(field === "target" ? { requirement: "" } : {}) }
                    : v
            )
        );
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim())  newErrors.title  = "Гарчиг оруулна уу";
        if (!formData.contet.trim()) newErrors.contet = "Агуулга оруулна уу";
        visibilities.forEach((v, i) => {
            if (!v.target) newErrors["vis_target_" + i] = "Төрөл сонгоно уу";
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 5000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            showToast("error", "Мэдээллээ бүрэн бөглөнө үү");
            return;
        }
        setLoading(true);
        try {
            const cleanVisibilities = visibilities
                .filter((v) => v.target)
                .map((v) => ({
                    target:      v.target,
                    requirement: v.requirement || null,
                }));

            const response = await axiosInstance.post("/notification", {
                title:        formData.title,
                contet:       formData.contet,
                visibilities: cleanVisibilities,
            });

            if (response?.status === 201) {
                showToast("success", "Мэдэгдэл амжилттай илгээгдлээ");
                setFormData({ title: "", contet: "" });
                setVisibilities([]);
                setTimeout(() => navigate("/notifications"), 2000);
            }
        } catch (err) {
            console.error(err);
            showToast("error", err?.response?.data?.message || "Алдаа гарлаа");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={css.container}>

            {/* Toast */}
            {toast && (
                <div className={css.notification + " " + css[toast.type]}>
                    {toast.type === "success"
                        ? <CheckCircle size={20} />
                        : <AlertCircle size={20} />
                    }
                    <span>{toast.message}</span>
                </div>
            )}

            {/* Breadcrumb */}
            <div className={css.breadcrumb}>
                <div className={css.breadcrumbItem} onClick={() => navigate("/")}>
                    <Home size={16} />
                    <span>Нүүр</span>
                </div>
                <ChevronRight size={16} className={css.breadcrumbSeparator} />
                <div className={css.breadcrumbItem + " " + css.active}>
                    <Bell size={16} />
                    <span>Мэдэгдэл нэмэх</span>
                </div>
            </div>

            {/* Page header */}
            <div className={css.pageHeader}>
                <div className={css.headerContent}>
                    <div className={css.headerIcon}>
                        <Bell size={28} />
                    </div>
                    <div className={css.headerText}>
                        <h1>Мэдэгдэл илгээх</h1>
                        <p>Хэрэглэгчдэд мэдэгдэл илгээх</p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className={css.formContainer}>
                <form onSubmit={handleSubmit} className={css.form}>

                    {/* Үндсэн мэдээлэл */}
                    <div className={css.formSection}>
                        <div className={css.sectionHeader}>
                            <FileText size={20} />
                            <h3>Мэдэгдлийн мэдээлэл</h3>
                        </div>

                        <div className={css.formGroup}>
                            <label className={css.label}>
                                <span>Гарчиг</span>
                                <span className={css.required}>*</span>
                            </label>
                            <div className={css.inputWrapper}>
                                <Type size={18} className={css.inputIcon} />
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Мэдэгдлийн гарчиг"
                                    className={css.input + (errors.title ? " " + css.error : "")}
                                />
                            </div>
                            {errors.title && (
                                <span className={css.errorMessage}>{errors.title}</span>
                            )}
                        </div>

                        <div className={css.formGroup}>
                            <label className={css.label}>
                                <span>Агуулга</span>
                                <span className={css.required}>*</span>
                            </label>
                            <textarea
                                name="contet"
                                value={formData.contet}
                                onChange={handleChange}
                                placeholder="Мэдэгдлийн агуулга..."
                                rows={5}
                                className={css.textarea + (errors.contet ? " " + css.error : "")}
                            />
                            {errors.contet && (
                                <span className={css.errorMessage}>{errors.contet}</span>
                            )}
                        </div>
                    </div>

                    {/* Хамрах хүрээ */}
                    <div className={css.formSection}>
                        <div className={css.sectionHeader}>
                            <Users size={20} />
                            <h3>Хүрэх хамрах хүрээ</h3>
                        </div>

                        <div className={css.visibilityInfo}>
                            <AlertCircle size={16} />
                            <span>
                                Хамрах хүрээ тодорхойлохгүй бол <strong>бүх хэрэглэгчид</strong> харагдана.
                                Олон нөхцөл нэмэх боломжтой — аль нэгэнд тохирвол харагдана.
                            </span>
                        </div>

                        <div className={css.visibilityList}>
                            {visibilities.map((vis, index) => {
                                const options = getOptions(vis.target);
                                return (
                                    <div key={index} className={css.visibilityRow}>
                                        <div className={css.visibilityIndex}>{index + 1}</div>

                                        <div className={css.visibilityField}>
                                            <label className={css.visibilityLabel}>Төрөл</label>
                                            <select
                                                value={vis.target}
                                                onChange={(e) =>
                                                    handleVisibilityChange(index, "target", e.target.value)
                                                }
                                                className={
                                                    css.visibilitySelect +
                                                    (errors["vis_target_" + index] ? " " + css.error : "")
                                                }
                                            >
                                                <option value="">Сонгоно уу</option>
                                                {TARGET_OPTIONS.map((opt) => (
                                                    <option key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors["vis_target_" + index] && (
                                                <span className={css.errorMessage}>
                                                    {errors["vis_target_" + index]}
                                                </span>
                                            )}
                                        </div>

                                        <div className={css.visibilityField}>
                                            <label className={css.visibilityLabel}>
                                                Утга
                                                <span className={css.optionalTag}>заавал биш</span>
                                            </label>
                                            <select
                                                value={vis.requirement}
                                                onChange={(e) =>
                                                    handleVisibilityChange(index, "requirement", e.target.value)
                                                }
                                                disabled={!vis.target || options.length === 0}
                                                className={css.visibilitySelect}
                                            >
                                                <option value="">Бүгд</option>
                                                {options.map((opt) => (
                                                    <option key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <button
                                            type="button"
                                            className={css.removeVisibilityBtn}
                                            onClick={() => removeVisibility(index)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        <button
                            type="button"
                            className={css.addVisibilityBtn}
                            onClick={addVisibility}
                        >
                            <Plus size={16} />
                            Нөхцөл нэмэх
                        </button>

                        {visibilities.length > 0 && (
                            <div className={css.visibilityPreview}>
                                <p className={css.previewTitle}>Хүрэх хамрах хүрээ:</p>
                                <div className={css.previewTags}>
                                    {visibilities.filter((v) => v.target).map((v, i) => {
                                        const targetLabel = TARGET_OPTIONS.find(
                                            (t) => t.value === v.target
                                        )?.label;
                                        const opts = getOptions(v.target);
                                        const reqLabel = v.requirement
                                            ? opts.find(
                                                (o) => String(o.value) === String(v.requirement)
                                              )?.label || v.requirement
                                            : "Бүгд";
                                        return (
                                            <span key={i} className={css.previewTag}>
                                                {TARGET_ICON[v.target]}
                                                {targetLabel}: {reqLabel}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Үйлдлүүд */}
                    <div className={css.formActions}>
                        <button
                            type="button"
                            className={css.cancelButton}
                            onClick={() => navigate("/notifications")}
                            disabled={loading}
                        >
                            Цуцлах
                        </button>
                        <button
                            type="submit"
                            className={css.submitButton}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader size={20} className={css.spinner} />
                                    <span>Илгээж байна...</span>
                                </>
                            ) : (
                                <>
                                    <Bell size={20} />
                                    <span>Мэдэгдэл илгээх</span>
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default NotificationAdd;