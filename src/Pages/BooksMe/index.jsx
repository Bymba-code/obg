import React, { useEffect, useState } from "react";
import {
  BookOpen, FileText, Star, Search, ArrowRight,
  BookMarked, TrendingUp, CheckCircle2, Clock
} from "lucide-react";
import css from "./style.module.css";
import axiosInstance from "../../Services/Api/AxiosInstance";
import { Link, useSearchParams } from "react-router-dom";

const BASE_URL = "http://localhost:3000";

const getUrl = (path) => {
  if (!path) return "/placeholder.png";
  const clean = path.replace(/\\/g, "/");
  if (clean.startsWith("/undefined") || clean === "/") return "/placeholder.png";
  return BASE_URL + clean;
};

const getProgressStatus = (percent) => {
  if (percent === 0)   return { label: "Эхлээгүй",   color: "#9CA3AF", bg: "#F3F4F6" };
  if (percent === 100) return { label: "Дууссан",     color: "#10B981", bg: "#D1FAE5" };
  if (percent >= 75)   return { label: "Дөхөж байна", color: "#E1761B", bg: "#FEF3C7" };
  if (percent >= 50)   return { label: "Дундуур",     color: "#3B82F6", bg: "#DBEAFE" };
  return                      { label: "Эхэлсэн",     color: "#8B5CF6", bg: "#EDE9FE" };
};

const BooksMe = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchTerm,  setSearchTerm]  = useState("");
  const [categories,  setCategories]  = useState([]);
  const [books,       setBooks]       = useState([]);
  const [pagination,  setPagination]  = useState({ total: 0, totalPages: 1 });
  const [loading,     setLoading]     = useState(false);

  const limit            = 10;
  const selectedCategory = searchParams.get("category") || "all";
  const page             = parseInt(searchParams.get("page") || "1");

  const updateParams = (newCategory, newPage) => {
    const params = {};
    if (newCategory && newCategory !== "all") params.category = newCategory;
    if (newPage && newPage > 1) params.page = newPage;
    setSearchParams(params);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosInstance.get("/book-category");
        if (res?.status === 200) setCategories(res.data.data || []);
      } catch (err) { console.log(err); }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const params = { page, limit };
        if (selectedCategory !== "all") params.category = selectedCategory;
        if (searchTerm.trim()) params.search = searchTerm.trim();
        const res = await axiosInstance.get("/me/book", { params });
        if (res?.status === 200) {
          setBooks(res.data.data || []);
          setPagination(res.data.pagination || { total: 0, totalPages: 1 });
        }
      } catch (err) {
        console.log(err);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [selectedCategory, page, searchTerm]);

  const handleCategorySelect = (catId) => {
    updateParams(catId, 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageChange = (newPage) => {
    updateParams(selectedCategory, newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalPages   = pagination.totalPages || 1;
  const inProgress   = books.filter(b => b.progress?.percent > 0 && b.progress?.percent < 100).length;
  const completed    = books.filter(b => b.progress?.percent === 100).length;
  const notStarted   = books.filter(b => !b.progress?.percent || b.progress?.percent === 0).length;

  return (
    <div className={css.lessons}>

      {/* ── Header ── */}
      <div className={css.lessonsHeader}>
        <div className={css.headerContent}>
          <h1 className={css.pageTitle}>
            <BookOpen size={28} strokeWidth={2.5} />
            Номын сан
          </h1>
          <p className={css.pageSubtitle}>
            Нийт <strong>{pagination.total}</strong> ном байна
          </p>
        </div>

        <div className={css.headerStats}>
          <div className={css.headerStatItem}>
            <TrendingUp size={16} />
            <span><strong>{inProgress}</strong> уншиж байна</span>
          </div>
          <div className={css.headerStatDivider} />
          <div className={css.headerStatItem}>
            <CheckCircle2 size={16} />
            <span><strong>{completed}</strong> дуусгасан</span>
          </div>
          <div className={css.headerStatDivider} />
          <div className={css.headerStatItem}>
            <Clock size={16} />
            <span><strong>{notStarted}</strong> эхлээгүй</span>
          </div>
        </div>
      </div>

      {/* ── Search ── */}
      <div className={css.controlsSection}>
        <div className={css.searchBox}>
          <Search size={18} strokeWidth={2} />
          <input
            type="text"
            placeholder="Ном хайх..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              updateParams(selectedCategory, 1);
            }}
            className={css.searchInput}
          />
        </div>
      </div>

      {/* ── Categories ── */}
      <div className={css.categories}>
        <button
          className={`${css.categoryBtn} ${selectedCategory === "all" ? css.categoryBtnActive : ""}`}
          onClick={() => handleCategorySelect("all")}
        >
          Бүгд
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`${css.categoryBtn} ${String(selectedCategory) === String(cat.id) ? css.categoryBtnActive : ""}`}
            onClick={() => handleCategorySelect(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* ── Grid / Skeleton ── */}
      {loading ? (
        <div className={css.loadingWrapper}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={css.skeletonCard}>
              <div className={css.skeletonThumb} />
              <div className={css.skeletonContent}>
                <div className={css.skeletonLine} style={{ width: "72%" }} />
                <div className={css.skeletonLine} style={{ width: "48%" }} />
                <div className={css.skeletonLine} style={{ width: "88%" }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={css.lessonsGrid}>
          {books.length === 0 && (
            <div className={css.emptyState}>
              <BookOpen size={56} strokeWidth={1} />
              <h3>Ном олдсонгүй</h3>
              <p>Өөр хайлт оролдоно уу</p>
            </div>
          )}

          {books.map(book => {
            const percent = book.progress?.percent || 0;
            const status  = getProgressStatus(percent);
            const isDone  = percent === 100;

            return (
              <Link to={`/books/${book.id}`} key={book.id} className={css.lessonCard}>

                {/* Thumbnail */}
                <div className={css.lessonThumbnail}>
                  <img
                    src={getUrl(book.image)}
                    alt={book.title}
                    onError={e => { e.target.src = "/placeholder.png"; }}
                  />
                  <div className={css.thumbnailOverlay} />

                  <span className={css.lessonCategory}>
                    {book.books_category?.name || "Ном"}
                  </span>

                  {/* Progress ring — shown even for 0% as empty ring */}
                  <div className={css.progressRingWrapper}>
                    <svg width="46" height="46" viewBox="0 0 46 46">
                      <circle
                        cx="23" cy="23" r="19"
                        fill="rgba(0,0,0,0.35)"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="3"
                      />
                      {percent > 0 && (
                        <circle
                          cx="23" cy="23" r="19"
                          fill="none"
                          stroke={isDone ? "#10B981" : "#E1761B"}
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 19}`}
                          strokeDashoffset={`${2 * Math.PI * 19 * (1 - percent / 100)}`}
                          transform="rotate(-90 23 23)"
                        />
                      )}
                    </svg>
                    <span className={css.progressRingText}>
                      {isDone ? "✓" : percent > 0 ? `${percent}%` : "—"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className={css.lessonContent}>
                  <h3 className={css.lessonTitle}>{book.title}</h3>
                  <p className={css.lessonInstructor}>{book.description}</p>

                  <div className={css.lessonMeta}>
                    <div className={css.metaItem}>
                      <BookOpen size={13} strokeWidth={2} />
                      <span>{book.pageNumber} хуудас</span>
                    </div>
                    <div className={css.metaItem}>
                      <FileText size={13} strokeWidth={2} />
                      <span>{book.book_files?.length > 0 ? "PDF байна" : "PDF байхгүй"}</span>
                    </div>
                  </div>

                  <div className={css.lessonRating}>
                    <Star size={14} strokeWidth={2} fill="#F59E0B" color="#F59E0B" />
                    <span className={css.ratingValue}>
                      {book.avgRating > 0 ? book.avgRating : "—"}
                    </span>
                    <span className={css.ratingCount}>
                      ({book.ratingCount} үнэлгээ)
                    </span>
                  </div>

                  {/* Progress */}
                  <div className={css.progressSection}>
                    <div className={css.progressHeader}>
                      <span
                        className={css.progressStatusBadge}
                        style={{ color: status.color, background: status.bg }}
                      >
                        {status.label}
                      </span>
                      <span className={css.progressPercent}>{percent}%</span>
                    </div>

                    <div className={css.progressTrack}>
                      <div
                        className={css.progressFill}
                        style={{
                          width: `${percent}%`,
                          background: isDone
                            ? "linear-gradient(90deg, #10B981 0%, #059669 100%)"
                            : percent === 0
                            ? "transparent"
                            : "linear-gradient(90deg, #E1761B 0%, #2A02A0 100%)"
                        }}
                      />
                    </div>

                    {percent > 0 && percent < 100 && (
                      <p className={css.progressPageInfo}>
                        {Math.round((percent / 100) * book.pageNumber)} / {book.pageNumber} хуудас уншсан
                      </p>
                    )}
                  </div>

                  <button className={`${css.continueButton} ${isDone ? css.continueButtonDone : ""}`}>
                    {isDone ? (
                      <><CheckCircle2 size={16} strokeWidth={2.5} /> Дахин унших</>
                    ) : percent > 0 ? (
                      <>Үргэлжлүүлэх <ArrowRight size={16} strokeWidth={2.5} /></>
                    ) : (
                      <>Унших эхлэх <BookMarked size={16} strokeWidth={2.5} /></>
                    )}
                  </button>
                </div>

              </Link>
            );
          })}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className={css.pagination}>
          <button
            className={css.pageBtn}
            disabled={page === 1}
            onClick={() => handlePageChange(page - 1)}
          >
            Өмнөх
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              className={`${css.pageBtn} ${page === p ? css.pageBtnActive : ""}`}
              onClick={() => handlePageChange(p)}
            >
              {p}
            </button>
          ))}
          <button
            className={css.pageBtn}
            disabled={page === totalPages}
            onClick={() => handlePageChange(page + 1)}
          >
            Дараах
          </button>
        </div>
      )}
    </div>
  );
};

export default BooksMe;