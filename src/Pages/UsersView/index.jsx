import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft, User, Phone, Hash, Calendar,
    Building2, Award, Shield,
    CheckCircle, Pencil, Trash2, RefreshCw, Eye,
    AlertCircle, Briefcase, Star, Save, X
} from "lucide-react";
import css from "./style.module.css";
import axiosInstance from "../../Services/Api/AxiosInstance";

// ── PERM META ──
const PERM_META = {
    view:   { cls: css.permTagView,   icon: <Eye size={11} />,       label: "view" },
    edit:   { cls: css.permTagEdit,   icon: <Pencil size={11} />,    label: "edit" },
    delete: { cls: css.permTagDelete, icon: <Trash2 size={11} />,    label: "delete" },
    update: { cls: css.permTagUpdate, icon: <RefreshCw size={11} />, label: "update" },
    report: { cls: css.permTagReport, icon: <Eye size={11} />,       label: "report" },
};

// ── PermCheckbox ──
const PermCheckbox = ({ action, active, onChange, saving }) => {
    const meta = PERM_META[action] || { cls: css.permTagOther, icon: null, label: action };
    return (
        <label
            className={`${css.permCheckbox} ${active
                ? `${css.permCheckboxActive} ${meta.cls}`
                : css.permCheckboxInactive}`}
            onClick={() => !saving && onChange()}
        >
            <span className={css.permCheckboxBox}>
                {active
                    ? <CheckCircle size={13} />
                    : <span className={css.permCheckboxEmpty} />}
            </span>
            <span className={css.permCheckboxIcon}>{meta.icon}</span>
            <span className={css.permCheckboxLabel}>{meta.label}</span>
        </label>
    );
};

// ── Helpers ──
const getInitials = (firstname = "", lastname = "") =>
    ((firstname?.[0] ?? "") + (lastname?.[0] ?? "")).toUpperCase() || "?";

const formatDate = (dateStr) => {
    if (!dateStr) return null;
    try {
        return new Date(dateStr).toLocaleDateString("mn-MN", {
            year: "numeric", month: "2-digit", day: "2-digit"
        });
    } catch { return dateStr; }
};

const InfoRow = ({ icon: Icon, iconBg, label, value, mono = false }) => (
    <div className={css.infoRow}>
        <div className={css.infoIcon} style={{ background: iconBg }}>
            <Icon size={16} color="white" />
        </div>
        <div className={css.infoContent}>
            <div className={css.infoLabel}>{label}</div>
            {value
                ? <div className={mono ? css.infoValueMono : css.infoValue}>{value}</div>
                : <div className={css.infoValueNull}>Мэдээлэл байхгүй</div>}
        </div>
    </div>
);

const UnitBox = ({ label, value }) => (
    <div className={css.unitBox}>
        <span className={css.unitLabel}>{label}</span>
        {value
            ? <span className={css.unitValue}>{value}</span>
            : <span className={css.unitValueNull}>Тодорхойгүй</span>}
    </div>
);

// ══════════════════════════════════════════
const UserView = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser]                           = useState(null);
    const [loading, setLoading]                     = useState(true);
    const [error, setError]                         = useState(null);
    const [modulePermissions, setModulePermissions] = useState([]);
    const [checkedIds, setCheckedIds]               = useState(new Set());
    const [saving, setSaving]                       = useState(false);
    const [saveMsg, setSaveMsg]                     = useState(null);

    // ── Fetch user ──
    const fetchUser = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get(`/users/${id}`);
            if (res?.status === 200) setUser(res.data.data);
            else setError("Хэрэглэгч олдсонгүй.");
        } catch {
            setError("Сервертэй холбогдоход алдаа гарлаа.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (id) fetchUser(); }, [id]);

    // ── Fetch modulePermissions ──
    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await axiosInstance.get(`/module-permission`);
                if (res?.status === 200) setModulePermissions(res.data.data);
            } catch {}
        };
        fetch();
    }, []);

    // ── user.user_modules-аас checkedIds тооцох ──
    // user_modules[].module_permissions.id → энэ нь module_permission id
    useEffect(() => {
        if (!user) return;
        const ids = new Set(
            (user.user_modules || []).map((um) => um.module_permission)
        );
        setCheckedIds(ids);
    }, [user]);

    // ── Checkbox toggle ──
    const handleToggle = (mpId) => {
        setCheckedIds((prev) => {
            const next = new Set(prev);
            next.has(mpId) ? next.delete(mpId) : next.add(mpId);
            return next;
        });
        setSaveMsg(null);
    };

    const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
        // Анхны байдал: { module_permission_id -> user_modules.id } map
        const originalMap = new Map(
            (user.user_modules || []).map((um) => [um.module_permission, um.id])
        );

        // Анхны checked module_permission id-үүд
        const originalIds = new Set(originalMap.keys());

        // Нэмэгдсэн → POST
        const toAdd    = [...checkedIds].filter((mpId) => !originalIds.has(mpId));
        // Устгагдсан → DELETE (user_modules.id ашиглана)
        const toRemove = [...originalIds].filter((mpId) => !checkedIds.has(mpId));

        await Promise.all([
            ...toAdd.map((mpId) =>
                axiosInstance.post(`/user-modules`, {
                    user: parseInt(id),
                    module_permission: parseInt(mpId),
                })
            ),
            ...toRemove.map((mpId) => {
                const userModuleId = originalMap.get(mpId);
                return axiosInstance.delete(`/user-modules/${userModuleId}`);
            }),
        ]);

        await fetchUser();
        setSaveMsg({ type: "success", text: "Амжилттай хадгалагдлаа." });
    } catch(err) {
        console.log(err?.response)
        setSaveMsg({ type: "error", text: "Хадгалах үед алдаа гарлаа." });
    } finally {
        setSaving(false);
    }
};

    // ── modulePermissions-г модулиар бүлэглэх ──
    const groupedModules = modulePermissions.reduce((acc, item) => {
        const key = item.modules.code;
        if (!acc[key]) acc[key] = { name: item.modules.name, items: [] };
        acc[key].items.push(item);
        return acc;
    }, {});

    // ── Loading / Error ──
    if (loading) return (
        <div className={css.loading}>
            <span className={css.loadingSpinner} />
            Уншиж байна...
        </div>
    );
    if (error || !user) return (
        <div className={css.errorState}>
            <AlertCircle size={48} />
            <p>{error || "Хэрэглэгч олдсонгүй."}</p>
            <button className={css.backBtn} onClick={() => navigate(-1)}>
                <ArrowLeft size={16} /> Буцах
            </button>
        </div>
    );

    // ── Өгөгдлийг задлах (шинэ бүтэцтэй) ──
    const {
        firstname, lastname, phone, kode, date,
        user_first_unit, user_second_unit, user_third_unit, user_fourth_unit,
        user_positions, user_rank,
    } = user;

    const fullName   = [firstname, lastname].filter(Boolean).join(" ") || "Нэргүй";

    // Нэгж нэрүүд
    const firstUnitName  = user_first_unit?.[0]
        ?.first_unit_user_first_unit_first_unitTofirst_unit?.name ?? null;
    const secondUnitName = user_second_unit?.[0]
        ?.second_unit_user_second_unit_second_unitTosecond_unit?.name ?? null;
    const thirdUnitName  = user_third_unit?.[0]
        ?.third_unit_user_third_unit_third_unitTothird_unit?.name ?? null;
    const fourthUnitName = user_fourth_unit?.[0]?.name ?? null;

    // Албан тушаал & цол
    const positionName = user_positions?.[0]?.positions?.name ?? null;
    const rankName     = user_rank?.[0]?.rank_user_rank_rankTorank?.name ?? null;

    // Идэвхтэй модулийн тоо
    const activeModuleCount = Object.values(groupedModules)
        .filter(({ items }) => items.some((i) => checkedIds.has(i.id)))
        .length;

    return (
        <div className={css.userView}>

            <button className={css.backBtn} onClick={() => navigate(-1)}>
                <ArrowLeft size={16} /> Буцах
            </button>

            {/* ── Header ── */}
            <div className={css.pageHeader}>
                <div className={css.headerContent}>
                    <div className={css.headerLeft}>
                        <div className={css.avatarCircle}>
                            {getInitials(firstname, lastname)}
                        </div>
                        <div className={css.headerMeta}>
                            <h1 className={css.headerName}>{fullName}</h1>
                            {kode && <span className={css.headerKode}>{kode}</span>}
                        </div>
                    </div>
                    <div className={css.headerRight}>
                        {rankName && (
                            <span className={css.headerBadge}>
                                <Star size={13} /> {rankName}
                            </span>
                        )}
                        {positionName && (
                            <span className={css.headerBadge}>
                                <Briefcase size={13} /> {positionName}
                            </span>
                        )}
                        {activeModuleCount > 0 && (
                            <span className={css.headerBadge}>
                                <Shield size={13} /> {activeModuleCount} модуль
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Grid ── */}
            <div className={css.grid}>

                {/* Үндсэн мэдээлэл */}
                <div className={css.card}>
                    <div className={css.cardHeader}>
                        <div className={css.cardHeaderIcon}
                            style={{ background: "linear-gradient(135deg,#E1761B 0%,#C45E0D 100%)" }}>
                            <User size={18} />
                        </div>
                        <div>
                            <p className={css.cardHeaderTitle}>Үндсэн мэдээлэл</p>
                            <p className={css.cardHeaderSub}>Хэрэглэгчийн ерөнхий мэдээлэл</p>
                        </div>
                    </div>
                    <div className={css.cardBody}>
                        <div className={css.infoGrid}>
                            <InfoRow icon={User}     iconBg="linear-gradient(135deg,#6366f1 0%,#4f46e5 100%)" label="Овог нэр"           value={fullName} />
                            <InfoRow icon={Hash}     iconBg="linear-gradient(135deg,#E1761B 0%,#C45E0D 100%)" label="Ажилтны код"        value={kode} mono />
                            <InfoRow icon={Phone}    iconBg="linear-gradient(135deg,#10b981 0%,#059669 100%)" label="Утасны дугаар"      value={phone} mono />
                            <InfoRow icon={Calendar} iconBg="linear-gradient(135deg,#3b82f6 0%,#2563eb 100%)" label="Бүртгэгдсэн огноо" value={formatDate(date)} />
                        </div>
                    </div>
                </div>

                {/* Албан тушаал & Цол */}
                <div className={css.card}>
                    <div className={css.cardHeader}>
                        <div className={css.cardHeaderIcon}
                            style={{ background: "linear-gradient(135deg,#f59e0b 0%,#d97706 100%)" }}>
                            <Award size={18} />
                        </div>
                        <div>
                            <p className={css.cardHeaderTitle}>Албан тушаал & Цол</p>
                            <p className={css.cardHeaderSub}>Харьяалал болон зэрэг дэв</p>
                        </div>
                    </div>
                    <div className={css.cardBody}>
                        <div className={css.infoGrid}>
                            <InfoRow icon={Briefcase} iconBg="linear-gradient(135deg,#f59e0b 0%,#d97706 100%)" label="Албан тушаал" value={positionName} />
                            <InfoRow icon={Star}      iconBg="linear-gradient(135deg,#8b5cf6 0%,#6d28d9 100%)" label="Цол"          value={rankName} />
                        </div>
                    </div>
                </div>

                {/* Нэгж харьяалал */}
                <div className={`${css.card} ${css.gridFull}`}>
                    <div className={css.cardHeader}>
                        <div className={css.cardHeaderIcon}
                            style={{ background: "linear-gradient(135deg,#2A02A0 0%,#4f46e5 100%)" }}>
                            <Building2 size={18} />
                        </div>
                        <div>
                            <p className={css.cardHeaderTitle}>Нэгж харьяалал</p>
                            <p className={css.cardHeaderSub}>Байгуулллагын бүтцийн мэдээлэл</p>
                        </div>
                    </div>
                    <div className={css.cardBody}>
                        <div className={css.unitGrid}>
                            <UnitBox label="1-р нэгж" value={firstUnitName} />
                            <UnitBox label="2-р нэгж" value={secondUnitName} />
                            <UnitBox label="3-р нэгж" value={thirdUnitName} />
                            <UnitBox label="4-р нэгж" value={fourthUnitName} />
                        </div>
                    </div>
                </div>

                {/* Эрх & Зөвшөөрөл */}
                <div className={`${css.card} ${css.gridFull}`}>
                    <div className={css.cardHeader}>
                        <div className={css.cardHeaderIcon}
                            style={{ background: "linear-gradient(135deg,#ef4444 0%,#dc2626 100%)" }}>
                            <Shield size={18} />
                        </div>
                        <div>
                            <p className={css.cardHeaderTitle}>Эрх & Зөвшөөрөл</p>
                            <p className={css.cardHeaderSub}>
                                {activeModuleCount > 0
                                    ? `${activeModuleCount} модулийн эрх тохируулагдсан`
                                    : "Эрх тохируулагдаагүй"}
                            </p>
                        </div>
                        <div className={css.permSaveArea}>
                            {saveMsg && (
                                <span className={saveMsg.type === "success" ? css.saveSuccess : css.saveError}>
                                    {saveMsg.type === "success"
                                        ? <CheckCircle size={14} />
                                        : <X size={14} />}
                                    {saveMsg.text}
                                </span>
                            )}
                            <button className={css.saveBtn} onClick={handleSave} disabled={saving}>
                                {saving ? <span className={css.savingSpinner} /> : <Save size={15} />}
                                {saving ? "Хадгалж байна..." : "Хадгалах"}
                            </button>
                        </div>
                    </div>

                    <div className={css.cardBody}>
                        {Object.keys(groupedModules).length === 0 ? (
                            <div className={css.permEmpty}>Модулийн мэдээлэл ачаалагдаагүй</div>
                        ) : (
                            <div className={css.permList}>
                                {Object.entries(groupedModules).map(([moduleCode, { name, items }]) => {
                                    const activeCount = items.filter((i) => checkedIds.has(i.id)).length;
                                    const hasAny = activeCount > 0;
                                    return (
                                        <div key={moduleCode}
                                            className={`${css.permRow} ${hasAny ? css.permRowActive : ""}`}>
                                            <div className={css.permModuleInfo}>
                                                <span className={css.permModuleName}>{name}</span>
                                                {hasAny && (
                                                    <span className={css.permModuleBadge}>
                                                        <CheckCircle size={11} />
                                                        {activeCount}/{items.length}
                                                    </span>
                                                )}
                                            </div>
                                            <div className={css.permTags}>
                                                {items.map((item) => (
                                                    <PermCheckbox
                                                        key={item.id}
                                                        action={item.permissions.name}
                                                        active={checkedIds.has(item.id)}
                                                        onChange={() => handleToggle(item.id)}
                                                        saving={saving}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default UserView;