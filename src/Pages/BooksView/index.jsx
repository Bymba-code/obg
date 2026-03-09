import React, { useState, useEffect } from "react";
import css from "./style.module.css";
import axiosInstance from "../../Services/Api/AxiosInstance";
import {
    BookOpen, ChevronRight, Home, ArrowLeft,
    FileText, Star, Users, Building2, Shield,
    Tag, Hash, Eye, Download, Maximize2, X,
    BookMarked, AlertCircle, Pencil, Globe
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const BASE_URL = "http://localhost:3000";

const getUrl = (path) => {
    if (!path) return null;
    const clean = path.replace(/\\/g, "/");
    if (clean.startsWith("/undefined") || clean === "/") return null;
    return BASE_URL + (clean.startsWith("/") ? clean : "/" + clean);
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

const TARGET_ICON = {
    first_unit:  <Building2 size={13} />,
    second_unit: <Building2 size={13} />,
    third_unit:  <Building2 size={13} />,
    fourth_unit: <Building2 size={13} />,
    rank:        <Shield size={13} />,
    position:    <Shield size={13} />,
    user:        <Users size={13} />,
};

/* ── Star display ──────────────────────────────────────── */
const StarRating = ({ value = 0, count = 0 }) => (
    <div className={css.starRow}>
        {[1, 2, 3, 4, 5].map(i => (
            <Star key={i} size={15}
                fill={i <= Math.round(value) ? "#D4AF37" : "none"}
                color={i <= Math.round(value) ? "#D4AF37" : "#D1D5DB"}
                strokeWidth={1.5}
            />
        ))}
        <span className={css.starValue}>{value > 0 ? value.toFixed(1) : "—"}</span>
        <span className={css.starCount}>({count} үнэлгээ)</span>
    </div>
);

/* ══════════════════════════════════════════════════════════
   BOOK VIEW
══════════════════════════════════════════════════════════ */
const BookView = () => {
    const { id }   = useParams();
    const navigate = useNavigate();

    const [book,    setBook]    = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState(null);

    /* PDF modal */
    const [pdfOpen, setPdfOpen] = useState(false);
    const [pdfFull, setPdfFull] = useState(false);
    const [pdfUrl,  setPdfUrl]  = useState(null);

    /* ── Fetch book ────────────────────────────────────── */
    useEffect(() => {
        (async () => {
            try {
                const res = await axiosInstance.get(`/book/${id}`);
                if (res?.status === 200) {
                    const data = res.data.data;
                    setBook(data);
                    const filePath = data?.book_files?.[0]?.file;
                    if (filePath) setPdfUrl(getUrl(filePath));
                }
            } catch (err) {
                console.error(err);
                setError("Номын мэдээлэл татахад алдаа гарлаа.");
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    const openPdf  = () => { setPdfOpen(true);  document.body.style.overflow = "hidden"; };
    const closePdf = () => { setPdfOpen(false); setPdfFull(false); document.body.style.overflow = ""; };

    /* ── Loading ─────────────────────────────────────── */
    if (loading) return (
        <div className={css.container}>
            <div className={css.loadingContainer}>
                <div className={css.loader} />
                <p>Номын мэдээлэл татаж байна...</p>
            </div>
        </div>
    );

    if (error || !book) return (
        <div className={css.container}>
            <div className={css.errorState}>
                <AlertCircle size={44} strokeWidth={1.3} color="#CBD5E1" />
                <h3>{error || "Ном олдсонгүй"}</h3>
                <button className={css.cancelButton} onClick={() => navigate("/books-list")}>
                    <ArrowLeft size={14} /> Буцах
                </button>
            </div>
        </div>
    );

    /* Derived values */
    const imgUrl      = getUrl(book.image);
    const hasPdf      = !!pdfUrl;
    const visCount    = book.book_visiblity?.length || 0;
    const ratingList  = book.book_rating || [];
    const avgRating   = ratingList.length
        ? ratingList.reduce((s, r) => s + (parseFloat(r.rating) || 0), 0) / ratingList.length
        : 0;

    return (
        <div className={css.container}>

            {/* ══════════════════════════════════════════════
                PDF MODAL
             ══════════════════════════════════════════════ */}
            {pdfOpen && hasPdf && (
                <>
                    <div
                        className={css.pdfBackdrop}
                        onClick={closePdf}
                    />
                    <div className={`${css.pdfModal} ${pdfFull ? css.pdfModalFull : ""}`}>
                        {/* Header */}
                        <div className={css.pdfModalHeader}>
                            <div className={css.pdfModalTitle}>
                                <FileText size={15} color="#D4AF37" />
                                <span>{book.title}</span>
                            </div>
                            <div className={css.pdfModalActions}>
                                <a href={pdfUrl} download className={css.pdfActionBtn} title="Татаж авах">
                                    <Download size={14} />
                                </a>
                                <button
                                    className={css.pdfActionBtn}
                                    onClick={() => setPdfFull(f => !f)}
                                    title={pdfFull ? "Жижигрүүлэх" : "Дэлгэц дүүргэх"}
                                >
                                    <Maximize2 size={14} />
                                </button>
                                <button
                                    className={`${css.pdfActionBtn} ${css.pdfCloseBtnStyle}`}
                                    onClick={closePdf}
                                    title="Хаах"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                        {/* iframe */}
                        <div className={css.pdfFrame}>
                            <iframe
                                src={`${pdfUrl}#toolbar=1&navpanes=1`}
                                title={book.title}
                                className={css.pdfIframe}
                            />
                        </div>
                    </div>
                </>
            )}

            <div className={css.breadcrumb}>
                <div className={css.breadcrumbItem} onClick={() => navigate("/")}>
                    <Home size={14} /><span>Нүүр</span>
                </div>
                <ChevronRight size={14} className={css.breadcrumbSeparator} />
                <div className={css.breadcrumbItem} onClick={() => navigate("/books-list")}>
                    <BookOpen size={14} /><span>Номын жагсаалт</span>
                </div>
                <ChevronRight size={14} className={css.breadcrumbSeparator} />
                <div className={`${css.breadcrumbItem} ${css.active}`}>
                    <Eye size={14} />
                    <span style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {book.title}
                    </span>
                </div>
            </div>

            {/* ── Page header ────────────────────────────── */}
            <div className={css.pageHeader}>
                <div className={css.headerContent}>
                    <div className={css.headerIcon}><BookOpen size={26} /></div>
                    <div className={css.headerText}>
                        <h1>Номын дэлгэрэнгүй</h1>
                        <p>Ном #{book.id} — мэдээлэл харах</p>
                    </div>
                </div>
                <div className={css.headerActions}>
                    <button className={css.backBtn} onClick={() => navigate("/books-list")}>
                        <ArrowLeft size={14} /><span>Буцах</span>
                    </button>
                </div>
            </div>

            {/* ══════════════════════════════════════════════
                TWO-COLUMN LAYOUT
             ══════════════════════════════════════════════ */}
            <div className={css.viewLayout}>

                {/* ─────────── LEFT COL ─────────── */}
                <div className={css.viewLeft}>

                    {/* Cover card */}
                    <div className={css.coverCard}>
                        <div className={css.coverImgWrapper}>
                            {imgUrl
                                ? <img src={imgUrl} alt={book.title} className={css.coverImg}
                                    onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                                  />
                                : null
                            }
                            {/* fallback */}
                            <div className={css.coverFallback} style={{ display: imgUrl ? "none" : "flex" }}>
                                <BookOpen size={48} strokeWidth={1} color="#D4AF37" />
                            </div>

                            {/* category badge */}
                            {book.books_category && (
                                <span className={css.coverCatBadge}>
                                    <Tag size={10} />
                                    {book.books_category.name}
                                </span>
                            )}
                        </div>

                        {/* Quick stats */}
                        <div className={css.coverStats}>
                            <div className={css.coverStat}>
                                <Hash size={13} color="#D4AF37" />
                                <div>
                                    <span className={css.coverStatVal}>{book.pageNumber}</span>
                                    <span className={css.coverStatLbl}>хуудас</span>
                                </div>
                            </div>
                            <div className={css.coverStatDivider} />
                            <div className={css.coverStat}>
                                <Star size={13} color="#D4AF37" fill="#D4AF37" />
                                <div>
                                    <span className={css.coverStatVal}>
                                        {avgRating > 0 ? avgRating.toFixed(1) : "—"}
                                    </span>
                                    <span className={css.coverStatLbl}>дүн</span>
                                </div>
                            </div>
                            <div className={css.coverStatDivider} />
                            <div className={css.coverStat}>
                                <Users size={13} color="#D4AF37" />
                                <div>
                                    <span className={css.coverStatVal}>{ratingList.length}</span>
                                    <span className={css.coverStatLbl}>үнэлгээ</span>
                                </div>
                            </div>
                        </div>

                        {/* PDF actions */}
                        {hasPdf ? (
                            <>
                                <button className={css.pdfOpenBtn} onClick={openPdf}>
                                    <Eye size={16} />
                                    PDF харах
                                </button>
                                <a href={pdfUrl} download className={css.pdfDownloadLink}>
                                    <Download size={14} />
                                    Татаж авах
                                </a>
                            </>
                        ) : (
                            <div className={css.pdfNone}>
                                <FileText size={15} color="#CBD5E1" />
                                <span>PDF байхгүй</span>
                            </div>
                        )}
                    </div>

                </div>

                {/* ─────────── RIGHT COL ─────────── */}
                <div className={css.viewRight}>

                    {/* ── Info card ── */}
                    <div className={css.detailCard}>
                        <div className={css.detailCardHeader}>
                            <BookMarked size={16} color="#D4AF37" />
                            <h2>Номын мэдээлэл</h2>
                        </div>

                        <h1 className={css.bookTitle}>{book.title}</h1>
                        <StarRating value={avgRating} count={ratingList.length} />
                        <p className={css.bookDesc}>{book.description}</p>

                        <div className={css.metaGrid}>
                            <div className={css.metaCell}>
                                <span className={css.metaCellLabel}><Tag size={11} /> Ангилал</span>
                                <span className={css.metaCellVal}>
                                    {book.books_category?.name || <em style={{ color: "#CBD5E1" }}>—</em>}
                                </span>
                            </div>
                            <div className={css.metaCell}>
                                <span className={css.metaCellLabel}><Hash size={11} /> Нийт хуудас</span>
                                <span className={css.metaCellVal}>{book.pageNumber} хуудас</span>
                            </div>
                            <div className={css.metaCell}>
                                <span className={css.metaCellLabel}><FileText size={11} /> PDF файл</span>
                                <span className={css.metaCellVal}>
                                    {hasPdf
                                        ? <span className={css.badgeGreen}>✓ Байна</span>
                                        : <span className={css.badgeGray}>Байхгүй</span>
                                    }
                                </span>
                            </div>
                            <div className={css.metaCell}>
                                <span className={css.metaCellLabel}><BookOpen size={11} /> Дугаар</span>
                                <span className={css.metaCellVal}>#{book.id}</span>
                            </div>
                        </div>
                    </div>

                    {/* ── Visibility card ── */}
                    <div className={css.detailCard}>
                        <div className={css.detailCardHeader}>
                            <Users size={16} color="#D4AF37" />
                            <h2>Хамрах хүрээ</h2>
                            {visCount > 0 && (
                                <span className={css.visBadgeCount}>{visCount} нөхцөл</span>
                            )}
                        </div>

                        {visCount === 0 ? (
                            <div className={css.visEmpty}>
                                <Globe size={32} strokeWidth={1.2} color="#D4AF37" />
                                <p>Хамрах хүрээ тодорхойлогдоогүй</p>
                                <span>Бүх хэрэглэгчид харагдана</span>
                            </div>
                        ) : (
                            <>
                                <div className={css.visAllBadge}>
                                    <AlertCircle size={13} color="#D4AF37" />
                                    <span>Аль нэг нөхцөлд тохирвол харагдана</span>
                                </div>
                                <div className={css.visGrid}>
                                    {book.book_visiblity.map((v, i) => (
                                        <div key={v.id ?? i} className={css.visRow}>
                                            <div className={css.visRowNum}>{i + 1}</div>
                                            <div className={css.visRowIcon}>
                                                {TARGET_ICON[v.target] ?? <Shield size={13} />}
                                            </div>
                                            <div className={css.visRowInfo}>
                                                <span className={css.visRowTarget}>
                                                    {TARGET_LABEL[v.target] ?? v.target}
                                                </span>
                                                <span className={css.visRowReq}>
                                                    {v.requirement ? `#${v.requirement}` : "Бүгд"}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* ── Ratings card (only if data exists) ── */}
                    {ratingList.length > 0 && (
                        <div className={css.detailCard}>
                            <div className={css.detailCardHeader}>
                                <Star size={16} color="#D4AF37" fill="#D4AF37" />
                                <h2>Үнэлгээнүүд</h2>
                                <span className={css.visBadgeCount}>{ratingList.length}</span>
                            </div>
                            <div className={css.ratingList}>
                                {ratingList.map((r, i) => (
                                    <div key={r.id ?? i} className={css.ratingItem}>
                                        <div className={css.ratingItemHeader}>
                                            <div className={css.ratingStars}>
                                                {[1,2,3,4,5].map(s => (
                                                    <Star key={s} size={12}
                                                        fill={s <= r.rating ? "#D4AF37" : "none"}
                                                        color={s <= r.rating ? "#D4AF37" : "#E2E8F0"}
                                                        strokeWidth={1.5}
                                                    />
                                                ))}
                                            </div>
                                            {r.title && (
                                                <span className={css.ratingTitle}>{r.title}</span>
                                            )}
                                        </div>
                                        {r.content && (
                                            <p className={css.ratingContent}>{r.content}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default BookView;