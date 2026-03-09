import React, { useEffect, useState } from "react";
import { BookOpen, Clock, Star, PlayCircle, Search, ArrowRight } from "lucide-react";
import css from "./style.module.css";
import axiosInstance from "../../Services/Api/AxiosInstance";
import { Link, useSearchParams } from "react-router-dom";

const Lessons = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const limit = 10;

  // URL-с шууд авах
  const selectedCategory = searchParams.get("category") || "all";
  const page = parseInt(searchParams.get("page") || "1");

  // Category болон page өөрчлөх
  const updateParams = (newCategory, newPage) => {
    const params = {};
    if (newCategory && newCategory !== "all") params.category = newCategory;
    if (newPage && newPage > 1) params.page = newPage;
    setSearchParams(params);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get("/lesson-category");
        if (response?.status === 200) {
          setCategories(response.data.data);
        }
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

        const response = await axiosInstance.get("/open/lessons", { params });
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
  }, [selectedCategory, page]); // URL өөрчлөгдөх бүрт дуудна

  const handleCategorySelect = (catId) => {
    updateParams(catId, 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageChange = (newPage) => {
    updateParams(selectedCategory, newPage);
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
            className={`${css.categoryBtn} ${String(selectedCategory) === String(cat.id) ? css.categoryBtnActive : ""}`}
            onClick={() => handleCategorySelect(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={css.loading}>Уншиж байна...</div>
      ) : (
        <div className={css.lessonsGrid}>
          {filteredLessons.length === 0 && (
            <div className={css.empty}>Хичээл олдсонгүй.</div>
          )}
          {filteredLessons.map(lesson => (
            <Link to={`/lessons/${lesson?.id}`} key={lesson.id} className={css.lessonCard}>

              <div className={css.lessonThumbnail}>
                <img
                  src={`http://localhost:3000${lesson.image?.replace(/\\/g, "/")}`}
                  alt={lesson.title}
                />
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
                    <span>
                      {lesson._count?.lesson_content_lesson_content_lessonTolesson ?? 0} хичээл
                    </span>
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

                <button className={css.continueButton}>
                  Үзэх
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

export default Lessons;