import React, { useEffect, useState } from "react";
import { BookOpen, Clock, Star, PlayCircle, Search, CheckCircle, ArrowRight } from "lucide-react";
import css from "./style.module.css";
import axiosInstance from "../../Services/Api/AxiosInstance";
import { Link } from "react-router-dom";

const LessonsEnd = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get("/lesson-category");
        if (response?.status === 200) setCategories(response.data.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchLessons = async () => {
      setLoading(true);
      try {
        const params = { page, limit };
        if (selectedCategory !== "all") params.category = selectedCategory;
        const response = await axiosInstance.get("/end/lesson", { params });
        if (response?.status === 200) {
          setLessons(response.data.data || []);
          setCount(response.data.count || 0);
        }
      } catch (err) {
        console.log(err);
        setLessons([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLessons();
  }, [selectedCategory, page]);

  const handleCategorySelect = (catId) => {
    if (selectedCategory === String(catId)) return;
    setPage(1);
    setSelectedCategory(String(catId));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredLessons = lessons.filter(lesson =>
    lesson.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.instructor?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(count / limit);

  return (
    <div className={css.lessons}>

      {/* Search */}
      <div className={css.controlsSection}>
        <div className={css.searchBox}>
          <Search size={20} strokeWidth={2} />
          <input
            type="text"
            placeholder="Хичээл хайх..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={css.searchInput}
          />
        </div>
      </div>

      {/* Categories */}
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
            className={`${css.categoryBtn} ${selectedCategory === String(cat.id) ? css.categoryBtnActive : ""}`}
            onClick={() => handleCategorySelect(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Lessons Grid */}
      {loading ? (
        <div className={css.loading}>Уншиж байна...</div>
      ) : (
        <div className={css.lessonsGrid}>
          {filteredLessons.length === 0 && (
            <div className={css.empty}>Дууссан хичээл байхгүй байна.</div>
          )}
          {filteredLessons.map(lesson => (
            <Link to={`/lessons/${lesson?.id}`} key={lesson.id} className={css.lessonCard}>

              <div className={css.lessonThumbnail}>
                <img
                  src={`http://localhost:3000${lesson.image?.replace(/\\/g, "/")}`}
                  alt={lesson.title}
                />
                <div className={css.completedBadge}>
                  <CheckCircle size={16} strokeWidth={2.5} />
                  Дууссан
                </div>
                <button className={css.playButton}>
                  <PlayCircle size={32} strokeWidth={2} />
                </button>
              </div>

              <div className={css.lessonContent}>
                <h3 className={css.lessonTitle}>{lesson.title}</h3>
                <p className={css.lessonInstructor}>{lesson.instructor}</p>

                <div className={css.lessonMeta}>
                  <div className={css.metaItem}>
                    <Clock size={14} strokeWidth={2} />
                    <span>{lesson.time} мин</span>
                  </div>
                  <div className={css.metaItem}>
                    <BookOpen size={14} strokeWidth={2} />
                    <span>{lesson._count?.lesson_content_lesson_content_lessonTolesson ?? 0} хичээл</span>
                  </div>
                </div>

                <div className={css.lessonRating}>
                  <Star size={16} strokeWidth={2} fill="#F59E0B" color="#F59E0B" />
                  <span className={css.ratingValue}>
                    {lesson.avgRating > 0 ? lesson.avgRating : "—"}
                  </span>
                  <span className={css.ratingCount}>
                    ({lesson.ratingCount} үнэлгээ)
                  </span>
                </div>

                <div className={css.progressSection}>
                  <div className={css.progressHeader}>
                    <span className={css.progressLabel}>
                      {lesson.progress.completed}/{lesson.progress.total} хичээл
                    </span>
                    <span className={css.progressPercent}>100%</span>
                  </div>
                  <div className={css.progressBar}>
                    <div className={css.progressFill} style={{ width: "100%" }} />
                  </div>
                </div>

                <button className={css.continueButton}>
                  Дахин үзэх
                  <ArrowRight size={18} strokeWidth={2} />
                </button>
              </div>

            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
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

export default LessonsEnd;