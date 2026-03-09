import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import css from "./style.module.css";
import axiosInstance from "../../Services/Api/AxiosInstance";
import {
    BookOpen, ChevronRight, Home, Loader,
    CheckCircle, AlertCircle, Users, Building2,
    Shield, MapPin, Grid, ChevronLeft, Plus
} from "lucide-react";

/* ══════════════════════════════════════════════════════════
   Constants
══════════════════════════════════════════════════════════ */
const CATEGORIES = [
    { value: 1, label: "Удирдах ажилтны сургалт" },
    { value: 2, label: "Гамшгаас хамгаалах алба, Мэргэжлийн анги" },
    { value: 3, label: "Ажилтан, алба хаагчид" },
];

const SUB_CATEGORIES = [
    { value: 1,  category: 1, label: "Хууль тогтоомж, эрх зүйн акт" },
    { value: 2,  category: 1, label: "Гамшгаас хамгаалах төлөвлөгөө" },
    { value: 3,  category: 1, label: "Гамшгаас хамгаалах удирдлага, зохион байгуулалт, штабын бэлтгэл" },
    { value: 4,  category: 1, label: "Гамшгаас хамгаалах ангиллын сургалт зохион байгуулах арга зүй" },
    { value: 5,  category: 2, label: "Гамшгаас хамгаалах үйл ажиллагааны эрх зүйн үндэс" },
    { value: 6,  category: 2, label: "Аюулт үзэгдэл, ослын тухай ойлголт" },
    { value: 7,  category: 2, label: "Гамшгаас урьдчилан сэргийлэх" },
    { value: 8,  category: 2, label: "Эрэн хайх, аврах ажиллагаа" },
    { value: 9,  category: 2, label: "Хор уршгийг арилгах, сэргээн босгох" },
    { value: 10, category: 2, label: "Алба нэгжийн хамтын ажиллагаа, хүч хэрэгсэл" },
    { value: 11, category: 3, label: "Гамшиг, гамшгаас хамгаалах үйл ажиллагааны тухай, эрсдэлийг бууруулах арга зам" },
    { value: 12, category: 3, label: "Эмнэлгийн анхны тусламж" },
    { value: 13, category: 3, label: "Гамшгаас хамгаалах төлөвлөлт, байгууллагын гамшгаас хамгаалах ажиллагаанд ажилтан, алба хаагчдын оролцоо, гүйцэтгэх үүрэг" },
];

const GENDERS = [
    { value: "male",   label: "Эрэгтэй" },
    { value: "female", label: "Эмэгтэй" },
    { value: "all",    label: "Бүгд" },
];

const AGE_GROUPS = [
    { value: "18-25", label: "18 – 25" },
    { value: "25-35", label: "25 – 35" },
    { value: "35-45", label: "35 – 45" },
    { value: "45+",   label: "45+" },
];

const STEPS = [
    { id: 1, icon: Grid,     label: "Ангилал",     desc: "Том ангилал сонгох" },
    { id: 2, icon: BookOpen, label: "Дэд ангилал", desc: "Сэдэв сонгох" },
    { id: 3, icon: MapPin,   label: "Байршил",     desc: "Хот, дүүрэг" },
    { id: 4, icon: Users,    label: "Хүн",         desc: "Хүйс, нас, тоо" },
];

/* ── Radio card ── */
const RadioCard = ({ label, active, onClick, small = false }) => (
    <button
        type="button"
        onClick={onClick}
        className={`${css.radioCard} ${active ? css.radioCardActive : ""} ${small ? css.radioCardSmall : ""}`}
    >
        <div className={css.radioCircle}>
            {active && <div className={css.radioDot} />}
        </div>
        <span>{label}</span>
    </button>
);

/* ══════════════════════════════════════════════════════════
   Main
══════════════════════════════════════════════════════════ */
const AngilalSurgaltAdd = () => {
    const navigate  = useNavigate();
    const [step,    setStep]    = useState(1);
    const [loading, setLoading] = useState(false);
    const [toast,   setToast]   = useState(null);

    const [form, setForm] = useState({
        category: "", sub_category: "",
        city: "", district: "",
        gender: "", age: "", personNumber: "",
    });
    const [errors, setErrors] = useState({});

    const set = (key, val) => {
        setForm(p => ({ ...p, [key]: val }));
        setErrors(p => ({ ...p, [key]: "" }));
    };

    const subCats = SUB_CATEGORIES.filter(s => s.category === Number(form.category));

    const canNext = () => {
        if (step === 1) return !!form.category;
        if (step === 2) return !!form.sub_category;
        if (step === 3) return !!form.city.trim() && !!form.district.trim();
        if (step === 4) return !!form.gender && !!form.age && !!form.personNumber;
        return false;
    };

    const next = () => {
        if (!canNext()) {
            if (step === 3) {
                setErrors({
                    city:     !form.city     ? "Хот / аймаг оруулна уу" : "",
                    district: !form.district ? "Дүүрэг / сум оруулна уу" : "",
                });
            }
            return;
        }
        setStep(s => s + 1);
    };
    const back = () => setStep(s => s - 1);

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4000);
    };

    const handleSubmit = async () => {
        if (!canNext()) return;
        setLoading(true);

        const catLabel    = CATEGORIES.find(c => c.value == form.category)?.label         || "";
        const subCatLabel = SUB_CATEGORIES.find(s => s.value == form.sub_category)?.label || "";

        try {
            const res = await axiosInstance.post("/angilal-surgalt", {
                category:     catLabel,
                sub_category: subCatLabel,
                city:         form.city.trim(),
                district:     form.district.trim(),
                gender:       form.gender,
                age:          form.age,
                personNumber: parseInt(form.personNumber),
            });
            if (res?.data?.success) {
                showToast("success", "Сургалтын мэдээлэл амжилттай хадгалагдлаа");
                setTimeout(() => navigate("/angilal-surgalt-list"), 2000);
            } else {
                showToast("error", res?.data?.message || "Алдаа гарлаа");
            }
        } catch (err) {
            showToast("error", err?.response?.data?.message || "Серверийн алдаа гарлаа");
        } finally {
            setLoading(false);
        }
    };

    /* summary labels */
    const catLabel    = CATEGORIES.find(c => c.value == form.category)?.label      || "";
    const subCatLabel = SUB_CATEGORIES.find(s => s.value == form.sub_category)?.label || "";
    const genderLabel = GENDERS.find(g => g.value === form.gender)?.label           || "";
    const ageLabel    = AGE_GROUPS.find(a => a.value === form.age)?.label           || "";

    return (
        <div className={css.container}>

            {/* Toast */}
            {toast && (
                <div className={`${css.notification} ${css[toast.type]}`}>
                    {toast.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    <span>{toast.msg}</span>
                </div>
            )}

            {/* Breadcrumb */}
            <div className={css.breadcrumb}>
                <div className={css.breadcrumbItem} onClick={() => navigate("/")}>
                    <Home size={14} /><span>Нүүр</span>
                </div>
                <ChevronRight size={14} className={css.breadcrumbSeparator} />
                <div className={css.breadcrumbItem} onClick={() => navigate(-1)}>
                    <BookOpen size={14} /><span>Сургалтын жагсаалт</span>
                </div>
                <ChevronRight size={14} className={css.breadcrumbSeparator} />
                <div className={`${css.breadcrumbItem} ${css.active}`}>
                    <Plus size={14} /><span>Сургалт нэмэх</span>
                </div>
            </div>

            {/* Page header */}
            <div className={css.pageHeader}>
                <div className={css.headerContent}>
                    <div className={css.headerIcon}><BookOpen size={26} /></div>
                    <div className={css.headerText}>
                        <h1>Сургалт нэмэх</h1>
                        <p>Ангиллын сургалтын мэдээллийг бүртгэх</p>
                    </div>
                </div>
            </div>

            {/* ── Form container ── */}
            <div className={css.formContainer}>
                <div className={css.asLayout}>

                    {/* ── LEFT sidebar: step tracker ── */}
                    <div className={css.asSidebar}>
                        <p className={css.asSidebarTitle}>Алхамууд</p>

                        <div className={css.asStepList}>
                            {STEPS.map((s, i) => {
                                const Icon   = s.icon;
                                const done   = s.id < step;
                                const active = s.id === step;
                                return (
                                    <div key={s.id} className={css.asStepItem}>
                                        {/* connector line */}
                                        {i < STEPS.length - 1 && (
                                            <div className={`${css.asStepConnector} ${done ? css.asStepConnectorDone : ""}`} />
                                        )}
                                        <div className={`${css.asStepBubble} ${active ? css.asStepBubbleActive : ""} ${done ? css.asStepBubbleDone : ""}`}>
                                            {done ? <CheckCircle size={14} /> : <Icon size={14} />}
                                        </div>
                                        <div className={css.asStepText}>
                                            <div className={`${css.asStepLabel} ${active ? css.asStepLabelActive : ""}`}>{s.label}</div>
                                            <div className={css.asStepDesc}>{s.desc}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Summary */}
                        {(catLabel || form.city || genderLabel) && (
                            <div className={css.asSummary}>
                                <p className={css.asSummaryTitle}>Сонголт</p>
                                {catLabel    && <SummaryRow icon={<Grid     size={11} />} text={catLabel} />}
                                {subCatLabel && <SummaryRow icon={<BookOpen size={11} />} text={subCatLabel} />}
                                {form.city   && <SummaryRow icon={<MapPin   size={11} />} text={`${form.city}${form.district ? `, ${form.district}` : ""}`} />}
                                {genderLabel && <SummaryRow icon={<Users    size={11} />} text={`${genderLabel}${ageLabel ? `, ${ageLabel}` : ""}${form.personNumber ? `, ${form.personNumber} хүн` : ""}`} />}
                            </div>
                        )}
                    </div>

                    {/* ── RIGHT content ── */}
                    <div className={css.asRight}>

                        {/* Section header */}
                        <div className={css.sectionHeader}>
                            {React.createElement(STEPS[step - 1].icon, { size: 18 })}
                            <h3>{STEPS[step - 1].label}</h3>
                            <span className={css.sectionBadge}>Алхам {step} / {STEPS.length}</span>
                        </div>

                        {/* Progress bar */}
                        <div className={css.asProgressBar}>
                            <div className={css.asProgressFill} style={{ width: `${(step / STEPS.length) * 100}%` }} />
                        </div>

                        {/* ── STEP 1 ── */}
                        {step === 1 && (
                            <div className={css.formSection} style={{ borderBottom: "none" }}>
                                <div className={css.formGroup}>
                                    <label className={css.label}>
                                        <Grid size={14} /><span>Ангилал сонгоно уу</span>
                                        <span className={css.required}>*</span>
                                    </label>
                                    <div className={css.radioStack}>
                                        {CATEGORIES.map(c => (
                                            <RadioCard
                                                key={c.value}
                                                label={c.label}
                                                active={form.category == c.value}
                                                onClick={() => { set("category", c.value); set("sub_category", ""); }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── STEP 2 ── */}
                        {step === 2 && (
                            <div className={css.formSection} style={{ borderBottom: "none" }}>
                                <div className={css.formGroup}>
                                    <label className={css.label}>
                                        <BookOpen size={14} /><span>Дэд ангилал сонгоно уу</span>
                                        <span className={css.required}>*</span>
                                    </label>
                                    <div className={css.radioStack} style={{ maxHeight: 320, overflowY: "auto", paddingRight: 2 }}>
                                        {subCats.map(s => (
                                            <RadioCard
                                                key={s.value}
                                                label={s.label}
                                                active={form.sub_category == s.value}
                                                onClick={() => set("sub_category", s.value)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── STEP 3 ── */}
                        {step === 3 && (
                            <div className={css.formSection} style={{ borderBottom: "none" }}>
                                <div className={css.formGrid}>
                                    <div className={css.formGroup}>
                                        <label className={css.label}>
                                            <MapPin size={14} /><span>Хот / Аймаг</span>
                                            <span className={css.required}>*</span>
                                        </label>
                                        <div className={css.inputWrapper}>
                                            <MapPin size={15} className={css.inputIcon} />
                                            <input
                                                className={`${css.input} ${errors.city ? css.error : ""}`}
                                                placeholder="Хот / аймгийн нэр"
                                                value={form.city}
                                                onChange={e => set("city", e.target.value)}
                                            />
                                        </div>
                                        {errors.city && <span className={css.errorMessage}>{errors.city}</span>}
                                    </div>
                                    <div className={css.formGroup}>
                                        <label className={css.label}>
                                            <Building2 size={14} /><span>Дүүрэг / Сум</span>
                                            <span className={css.required}>*</span>
                                        </label>
                                        <div className={css.inputWrapper}>
                                            <Building2 size={15} className={css.inputIcon} />
                                            <input
                                                className={`${css.input} ${errors.district ? css.error : ""}`}
                                                placeholder="Дүүрэг / сумын нэр"
                                                value={form.district}
                                                onChange={e => set("district", e.target.value)}
                                            />
                                        </div>
                                        {errors.district && <span className={css.errorMessage}>{errors.district}</span>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── STEP 4 ── */}
                        {step === 4 && (
                            <div className={css.formSection} style={{ borderBottom: "none" }}>
                                {/* Gender */}
                                <div className={css.formGroup}>
                                    <label className={css.label}>
                                        <Users size={14} /><span>Хүйс</span>
                                        <span className={css.required}>*</span>
                                    </label>
                                    <div className={css.radioRow}>
                                        {GENDERS.map(g => (
                                            <RadioCard key={g.value} label={g.label}
                                                active={form.gender === g.value}
                                                onClick={() => set("gender", g.value)} small />
                                        ))}
                                    </div>
                                </div>

                                {/* Age */}
                                <div className={css.formGroup}>
                                    <label className={css.label}>
                                        <Shield size={14} /><span>Насны бүлэг</span>
                                        <span className={css.required}>*</span>
                                    </label>
                                    <div className={css.radioRow}>
                                        {AGE_GROUPS.map(a => (
                                            <RadioCard key={a.value} label={a.label}
                                                active={form.age === a.value}
                                                onClick={() => set("age", a.value)} small />
                                        ))}
                                    </div>
                                </div>

                                {/* Person number */}
                                <div className={css.formGroup}>
                                    <label className={css.label}>
                                        <Users size={14} /><span>Хүний тоо</span>
                                        <span className={css.required}>*</span>
                                    </label>
                                    <div className={css.inputWrapper}>
                                        <Users size={15} className={css.inputIcon} />
                                        <input
                                            type="number" min="1"
                                            className={`${css.input} ${errors.personNumber ? css.error : ""}`}
                                            placeholder="Жишээ: 25"
                                            value={form.personNumber}
                                            onChange={e => set("personNumber", e.target.value)}
                                        />
                                    </div>
                                    {errors.personNumber && <span className={css.errorMessage}>{errors.personNumber}</span>}
                                </div>
                            </div>
                        )}

                        {/* ── Actions ── */}
                        <div className={css.formActions}>
                            {step > 1 ? (
                                <button type="button" className={css.cancelButton} onClick={back} disabled={loading}>
                                    <ChevronLeft size={16} /> Буцах
                                </button>
                            ) : (
                                <button type="button" className={css.cancelButton} onClick={() => navigate(-1)}>
                                    Цуцлах
                                </button>
                            )}
                            <button
                                type="button"
                                className={css.submitButton}
                                disabled={!canNext() || loading}
                                onClick={step < 4 ? next : handleSubmit}
                            >
                                {loading ? (
                                    <><Loader size={16} className={css.spinner} /><span>Хадгалж байна...</span></>
                                ) : step < 4 ? (
                                    <><span>Үргэлжлүүлэх</span><ChevronRight size={16} /></>
                                ) : (
                                    <><CheckCircle size={16} /><span>Хадгалах</span></>
                                )}
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

const SummaryRow = ({ icon, text }) => (
    <div className={css.asSummaryRow}>{icon}<span>{text}</span></div>
);

export default AngilalSurgaltAdd;