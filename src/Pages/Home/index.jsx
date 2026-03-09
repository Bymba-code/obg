import React, { useState, useEffect, useCallback } from "react";
import {
    TrendingUp, BookOpen, Target, CheckCircle,
    PlayCircle, Star, Clock, ArrowRight, Filter,
    AlertCircle, Zap, Award, BarChart3, RefreshCw,
    ChevronRight, BookMarked, Users
} from "lucide-react";
import styles from "./style.module.css";
import { useAuth } from "../../App/Providers/AuthProvider";
import axiosInstance from "../../Services/Api/AxiosInstance";

const BASE_URL = "http://localhost:3000";
const getImgUrl = (path) => {
    if (!path) return null;
    const clean = path.replace(/\\/g, "/");
    if (clean.startsWith("/undefined") || clean === "/") return null;
    return BASE_URL + clean;
};

/* ── Progress ring ────────────────────────────────────── */
const ProgressRing = ({ percent = 0, size = 80, stroke = 7, color = "#E1761B" }) => {
    const r   = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (percent / 100) * circ;
    return (
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={size/2} cy={size/2} r={r} fill="none"
                stroke="rgba(255,255,255,0.15)" strokeWidth={stroke} />
            <circle cx={size/2} cy={size/2} r={r} fill="none"
                stroke={color} strokeWidth={stroke}
                strokeDasharray={circ} strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)" }}
            />
        </svg>
    );
};

/* ── Stat chip ────────────────────────────────────────── */
const StatChip = ({ icon: Icon, label, value, color, bg }) => (
    <div className={styles.statChip} style={{ "--chip-color": color, "--chip-bg": bg }}>
        <div className={styles.statChipIcon}><Icon size={18} /></div>
        <div>
            <div className={styles.statChipValue}>{value}</div>
            <div className={styles.statChipLabel}>{label}</div>
        </div>
    </div>
);

/* ── Course card ──────────────────────────────────────── */
const CourseCard = ({ lesson, onContinue }) => {
    const { title, instructor, time, image, avgRating, ratingCount, progress } = lesson;
    const imgUrl = getImgUrl(image);
    const { percent, completed, total, isCompleted } = progress;

    const statusColor = isCompleted ? "#10B981" : percent > 0 ? "#E1761B" : "#6366F1";
    const statusLabel = isCompleted ? "Дууссан" : percent > 0 ? "Үргэлжлүүлэх" : "Эхлэх";

    return (
        <div className={`${styles.courseCard} ${isCompleted ? styles.courseCardDone : ""}`}>
            {/* thumbnail */}
            <div className={styles.courseThumbnail}>
                {imgUrl
                    ? <img src={imgUrl} alt={title} />
                    : <div className={styles.thumbPlaceholder}><BookOpen size={32} strokeWidth={1.5} /></div>
                }
                <div className={styles.thumbOverlay}>
                    <button className={styles.playBtn} onClick={() => onContinue(lesson)}>
                        <PlayCircle size={34} />
                    </button>
                </div>
                {isCompleted && (
                    <div className={styles.completedBadge}><CheckCircle size={14} /> Дууссан</div>
                )}
            </div>

            {/* body */}
            <div className={styles.courseBody}>
                <h3 className={styles.courseTitle}>{title}</h3>
                <p className={styles.courseInstructor}>{instructor}</p>

                <div className={styles.courseMeta}>
                    <span><Clock size={12} /> {time} цаг</span>
                    <span><BookOpen size={12} /> {total} агуулга</span>
                    {ratingCount > 0 && (
                        <span>
                            <Star size={12} fill="#F59E0B" color="#F59E0B" /> {avgRating}
                        </span>
                    )}
                </div>

                {/* progress */}
                {total > 0 ? (
                    <div className={styles.progressWrap}>
                        <div className={styles.progressHeader}>
                            <span className={styles.progressLabel}>
                                {completed}/{total} дууссан
                            </span>
                            <span className={styles.progressPct} style={{ color: statusColor }}>
                                {percent}%
                            </span>
                        </div>
                        <div className={styles.progressBar}>
                            <div
                                className={styles.progressFill}
                                style={{ width: `${percent}%`, background: statusColor }}
                            />
                        </div>
                    </div>
                ) : (
                    <div className={styles.noContent}>Агуулга байхгүй</div>
                )}

                <button
                    className={styles.continueBtn}
                    style={{ "--btn-color": statusColor }}
                    onClick={() => onContinue(lesson)}
                >
                    {statusLabel} <ArrowRight size={15} />
                </button>
            </div>
        </div>
    );
};

/* ══════════════════════════════════════════════════════
   HOME
══════════════════════════════════════════════════════ */
const Home = () => {
    const { user } = useAuth();
    const [lessons,    setLessons]    = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [loading,    setLoading]    = useState(true);
    const [error,      setError]      = useState(null);
    const [filter,     setFilter]     = useState("all"); // all | inProgress | notStarted | completed

    /* ── Fetch ── */
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axiosInstance.get("/me/dashboard");
            if (res?.status === 200) {
                setLessons(res.data.data      || []);
                setStatistics(res.data.statistics || null);
            }
        } catch (err) {
            setError("Мэдээлэл татахад алдаа гарлаа.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const filteredLessons = lessons.filter(l => {
        if (filter === "all")        return true;
        if (filter === "completed")  return l.progress.isCompleted;
        if (filter === "inProgress") return l.progress.percent > 0 && !l.progress.isCompleted;
        if (filter === "notStarted") return l.progress.percent === 0 && l.progress.total > 0;
        return true;
    });

    const getUserName = () => {
        if (!user?.[0]?.data) return "Хэрэглэгч";
        const { firstname = "", lastname = "" } = user[0].data;
        return firstname && lastname
            ? `${lastname.charAt(0)}. ${firstname}`
            : firstname || lastname || "Хэрэглэгч";
    };

    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return "Өглөөний мэнд";
        if (h < 18) return "Өдрийн мэнд";
        return "Оройн мэнд";
    };

    const handleContinue = (lesson) => {
        // navigate(`/lesson/${lesson.id}`) — router холбоно
        console.log("Continue:", lesson.id);
    };

    /* ── Tabs ── */
    const tabs = [
        { key: "all",        label: "Бүгд",          icon: BookOpen,    count: statistics?.total       ?? 0 },
        { key: "inProgress", label: "Явцтай",        icon: TrendingUp,  count: statistics?.inProgress  ?? 0 },
        { key: "notStarted", label: "Эхлээгүй",      icon: Target,      count: statistics?.notStarted  ?? 0 },
        { key: "completed",  label: "Дууссан",        icon: CheckCircle, count: statistics?.completed   ?? 0 },
    ];

    /* ════════════════════════════════════════════════
       RENDER
    ════════════════════════════════════════════════ */
    return (
        <div className={styles.home}>

            {/* ── Hero banner ── */}
            <div className={styles.hero}>
                <div className={styles.heroLeft}>
                    <p className={styles.heroGreeting}>{greeting()}</p>
                    <h1 className={styles.heroName}>{getUserName()} 👋</h1>
                    <p className={styles.heroSub}>
                        {statistics
                            ? <>Нийт <strong>{statistics.total}</strong> хичээлийн&nbsp;
                               дундаж явц <strong>{statistics.avgProgress}%</strong> байна.</>
                            : "Сургалтын мэдээлэл уншиж байна..."}
                    </p>
                    <div className={styles.heroChips}>
                        <StatChip icon={BookOpen}    label="Нийт хичээл"  value={statistics?.total       ?? "—"} color="#E1761B" bg="rgba(225,118,27,.12)" />
                        <StatChip icon={TrendingUp}  label="Явцтай"       value={statistics?.inProgress  ?? "—"} color="#6366F1" bg="rgba(99,102,241,.12)" />
                        <StatChip icon={CheckCircle} label="Дууссан"      value={statistics?.completed   ?? "—"} color="#10B981" bg="rgba(16,185,129,.12)" />
                        <StatChip icon={Target}      label="Эхлээгүй"     value={statistics?.notStarted  ?? "—"} color="#F59E0B" bg="rgba(245,158,11,.12)" />
                    </div>
                </div>

                {/* big progress ring */}
                <div className={styles.heroRight}>
                    <div className={styles.ringWrap}>
                        <ProgressRing
                            percent={statistics?.avgProgress ?? 0}
                            size={148}
                            stroke={10}
                            color="#E1761B"
                        />
                        <div className={styles.ringCenter}>
                            <span className={styles.ringPct}>{statistics?.avgProgress ?? 0}%</span>
                            <span className={styles.ringLabel}>дундаж явц</span>
                        </div>
                    </div>
                    {statistics && (
                        <div className={styles.ringStats}>
                            <div className={styles.ringStat} style={{ "--c": "#10B981" }}>
                                <span>{statistics.completionRate}%</span>
                                <span>гүйцэтгэл</span>
                            </div>
                            <div className={styles.ringStat} style={{ "--c": "#6366F1" }}>
                                <span>{statistics.inProgress}</span>
                                <span>явцтай</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Lessons section ── */}
            <div className={styles.section}>
                <div className={styles.sectionHead}>
                    <div>
                        <h2 className={styles.sectionTitle}>Миний хичээлүүд</h2>
                        <p className={styles.sectionSub}>Танд оноогдсон хичээлүүд</p>
                    </div>
                    <button className={styles.refreshBtn} onClick={fetchData} disabled={loading}>
                        <RefreshCw size={15} className={loading ? styles.spinning : ""} />
                    </button>
                </div>

                {/* ── Filter tabs ── */}
                <div className={styles.tabs}>
                    {tabs.map(t => {
                        const Icon = t.icon;
                        return (
                            <button
                                key={t.key}
                                className={`${styles.tab} ${filter === t.key ? styles.tabActive : ""}`}
                                onClick={() => setFilter(t.key)}
                            >
                                <Icon size={14} />
                                {t.label}
                                <span className={styles.tabBadge}>{t.count}</span>
                            </button>
                        );
                    })}
                </div>

                {/* ── Content ── */}
                {loading ? (
                    <div className={styles.loadingGrid}>
                        {[1,2,3,4].map(i => <div key={i} className={styles.skeleton} />)}
                    </div>
                ) : error ? (
                    <div className={styles.errorBox}>
                        <AlertCircle size={20} />
                        <span>{error}</span>
                        <button onClick={fetchData}>Дахин оролдох</button>
                    </div>
                ) : filteredLessons.length === 0 ? (
                    <div className={styles.emptyBox}>
                        <BookMarked size={40} strokeWidth={1.3} />
                        <p>Хичээл олдсонгүй</p>
                    </div>
                ) : (
                    <div className={styles.courseGrid}>
                        {filteredLessons.map(lesson => (
                            <CourseCard
                                key={lesson.id}
                                lesson={lesson}
                                onContinue={handleContinue}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;