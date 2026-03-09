import { useEffect, useState } from "react";
import {
  Newspaper, Search, Bell, TrendingUp, Eye, Heart,
  MessageCircle, Clock, Calendar, Bookmark, ChevronRight,
  Tag, Rss, X, Hash, BarChart2, Users, BookOpen, Zap
} from "lucide-react";
import css from "./style.module.css";
import axiosInstance from "../../Services/Api/AxiosInstance";

const TICKER_ITEMS = [
  "Улаанбаатарт их цасан шуурга болох магадлалтай — ОБЕГ",
  "Аврах ажиллагааны шинэ тоног төхөөрөмж нийлүүлэгдлээ",
  "Гал түймрийн эсрэг сургалт амжилттай явагдлаа",
  "Орон нутгийн аврах баг шинэ зэрэглэл авлаа",
  "Ус үерийн аюулаас урьдчилан сэргийлэх сурталчилгаа эхэллээ",
];

// Accent colors cycled per news item for visual variety
const ACCENT_COLORS = ["#E1761B", "#2A02A0", "#10B981", "#8B5CF6", "#EC4899", "#0EA5E9", "#EF4444"];
const AVATAR_COLORS = ["#E1761B", "#10B981", "#2A02A0", "#8B5CF6", "#0EA5E9", "#EC4899", "#F59E0B"];

// Base URL for images — adjust to match your backend
const IMAGE_BASE_URL = "http://localhost:3000/";

/**
 * Adapt raw API news object to the shape expected by card components.
 * Falls back gracefully for missing fields.
 */
function adaptNews(item, index) {
  const colorIdx = index % ACCENT_COLORS.length;
  return {
    id: item.id,
    category: item.category,
    categoryLabel: item.categoryLabel || "Мэдээ",
    title: item.title || "",
    excerpt: item.description || "",
    author: item.authorName || "Редакц",
    authorInitials: item.authorName
      ? item.authorName.slice(0, 2).toUpperCase()
      : "РД",
    authorColor: AVATAR_COLORS[colorIdx],
    date: item.created_at || new Date().toISOString(),
    readTime: item.readTime || "5 мин",
    views: item.views || 0,
    likes: item.likes || 0,
    comments: item.comments || 0,
    tags: item.tags || [],
    accentColor: ACCENT_COLORS[colorIdx],
    isBreaking: item.isBreaking || false,
    isFeatured: item.feature === true,
    image: item.image ? `${IMAGE_BASE_URL}${item.image.replace(/\\/g, "/")}` : null,
  };
}

const fmtDate = (d) => {
  const dt = new Date(d);
  return `${dt.getFullYear()}.${String(dt.getMonth() + 1).padStart(2, "0")}.${String(dt.getDate()).padStart(2, "0")}`;
};


function TickerBar() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className={css.ticker}>
      <div className={css.tickerBadge}>
        <Zap size={12} />
        Шинэ мэдээ
      </div>
      <div className={css.tickerTrack}>
        {doubled.map((item, i) => (
          <span key={i} className={css.tickerItem}>
            <span className={css.tickerDot} />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function HeroCard({ news, saved, onSave }) {
  return (
    <div className={css.hero}>
      <div className={css.heroAccent} />
      <div className={css.heroBody}>
        {/* Content */}
        <div className={css.heroContent}>
          <div className={css.heroMeta}>
            {news.isBreaking && (
              <span className={css.breakingBadge}>
                <span className={css.liveDot} />
                Шуурхай мэдээ
              </span>
            )}
            <span className={css.heroCategoryBadge}>
              <Hash size={10} strokeWidth={2.5} />
              {news.categoryLabel}
            </span>
          </div>

          <h2 className={css.heroTitle}>{news.title}</h2>
          <p className={css.heroExcerpt}>{news.excerpt}</p>

          {news.tags && news.tags.length > 0 && (
            <div className={css.heroTags}>
              {news.tags.map(t => (
                <span key={t} className={css.tag}>{t}</span>
              ))}
            </div>
          )}

          <div className={css.heroFooter}>
            <div className={css.authorRow}>
              <div
                className={css.avatar}
                style={{ background: `linear-gradient(135deg, ${news.authorColor}, ${news.authorColor}aa)` }}
              >
                {news.authorInitials}
              </div>
              <div>
                <div className={css.authorName}>{news.author}</div>
                <div className={css.authorMeta}>
                  <Calendar size={11} />
                  {fmtDate(news.date)}
                  <span style={{ margin: "0 2px" }}>·</span>
                  <Clock size={11} />
                  {news.readTime}
                </div>
              </div>
            </div>
            <div className={css.statsRow}>
              <span className={css.stat}><Eye size={13} strokeWidth={2} /> {news.views.toLocaleString()}</span>
              <span className={css.stat}><Heart size={13} strokeWidth={2} /> {news.likes}</span>
              <span className={css.stat}><MessageCircle size={13} strokeWidth={2} /> {news.comments}</span>
            </div>
          </div>
        </div>

        {/* Stats / image panel */}
        <div className={css.heroImagePanel}>
          {news.image && (
            <img
              src={news.image}
              alt={news.title}
              className={css.heroImage}
              style={{ width: "100%", borderRadius: 12, objectFit: "cover", marginBottom: 12, maxHeight: 160 }}
            />
          )}
          {[
            { label: "Үзэлт", value: news.views.toLocaleString(), icon: Eye, color: "#E1761B" },
            { label: "Дуртай", value: news.likes, icon: Heart, color: "#EF4444" },
            { label: "Сэтгэгдэл", value: news.comments, icon: MessageCircle, color: "#2A02A0" },
          ].map(s => (
            <div key={s.label} className={css.heroStatCard}>
              <s.icon size={20} color={s.color} strokeWidth={2} />
              <span className={css.heroStatValue}>{s.value}</span>
              <span className={css.heroStatLabel}>{s.label}</span>
            </div>
          ))}
          <button className={css.heroReadBtn} onClick={() => onSave(news.id)}>
            <BookOpen size={15} />
            {saved ? "Хадгалсан ✓" : "Дэлгэрэнгүй унших"}
          </button>
        </div>
      </div>
    </div>
  );
}

function NewsCard({ news, saved, onSave }) {
  return (
    <div className={css.card}>
      <div
        className={css.cardAccentBar}
        style={{ background: `linear-gradient(90deg, ${news.accentColor}, #2A02A0)` }}
      />
      {news.image && (
        <img
          src={news.image}
          alt={news.title}
          style={{ width: "100%", height: 140, objectFit: "cover" }}
        />
      )}
      <div className={css.cardBody}>
        <div className={css.cardTopRow}>
          <span className={css.categoryPill}>
            <Hash size={10} strokeWidth={2.5} />
            {news.categoryLabel}
          </span>
          <span className={css.cardDate}>
            <Calendar size={11} />
            {fmtDate(news.date)}
          </span>
        </div>

        <h3 className={css.cardTitle}>{news.title}</h3>
        <p className={css.cardExcerpt}>{news.excerpt}</p>

        {news.tags && news.tags.length > 0 && (
          <div className={css.cardTags}>
            {news.tags.slice(0, 2).map(t => (
              <span
                key={t}
                className={css.cardTagItem}
                style={{
                  background: `${news.accentColor}10`,
                  border: `1px solid ${news.accentColor}22`,
                  color: news.accentColor,
                }}
              >
                {t}
              </span>
            ))}
          </div>
        )}

        <div className={css.cardDivider} />

        <div className={css.cardFooter}>
          <div className={css.cardAuthor}>
            <div
              className={css.avatarSm}
              style={{ background: `linear-gradient(135deg, ${news.authorColor}, ${news.authorColor}aa)` }}
            >
              {news.authorInitials}
            </div>
            <div>
              <div className={css.cardAuthorName}>{news.author}</div>
              <div className={css.cardReadTime}>
                <Clock size={10} />
                {news.readTime}
              </div>
            </div>
          </div>

          <div className={css.cardActions}>
            <span className={css.cardStat}><Eye size={12} strokeWidth={2} /> {news.views.toLocaleString()}</span>
            <span className={css.cardStat}><Heart size={12} strokeWidth={2} /> {news.likes}</span>
            <button
              className={`${css.bookmarkBtn} ${saved ? css.bookmarkBtnActive : ""}`}
              onClick={(e) => { e.stopPropagation(); onSave(news.id); }}
            >
              <Bookmark size={13} fill={saved ? "white" : "none"} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NewsRow({ news, rank, saved, onSave }) {
  return (
    <div className={css.newsRow}>
      <div className={`${css.newsRowNum} ${rank <= 0 ? css.newsRowNumFirst : css.newsRowNumOther}`}>
        {rank + 1}
      </div>
      <div className={css.newsRowContent}>
        <div className={css.newsRowCategory}>{news.categoryLabel}</div>
        <div className={css.newsRowTitle}>{news.title}</div>
        <div className={css.newsRowMeta}>
          <Calendar size={11} />
          {fmtDate(news.date)}
          <span className={css.newsRowDot} />
          <Clock size={11} />
          {news.readTime}
          <span className={css.newsRowDot} />
          {news.author}
        </div>
      </div>
      <div className={css.newsRowStats}>
        <span className={css.stat}><Eye size={12} strokeWidth={2} /> {news.views.toLocaleString()}</span>
        <button
          className={`${css.bookmarkBtn} ${saved ? css.bookmarkBtnActive : ""}`}
          onClick={(e) => { e.stopPropagation(); onSave(news.id); }}
        >
          <Bookmark size={12} fill={saved ? "white" : "none"} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className={css.card} style={{ opacity: 0.5 }}>
      <div style={{ height: 8, background: "#e5e7eb", borderRadius: 4, marginBottom: 12 }} />
      <div style={{ height: 140, background: "#f3f4f6", borderRadius: 8, marginBottom: 12 }} />
      <div className={css.cardBody}>
        <div style={{ height: 14, background: "#e5e7eb", borderRadius: 4, marginBottom: 8, width: "60%" }} />
        <div style={{ height: 20, background: "#e5e7eb", borderRadius: 4, marginBottom: 8 }} />
        <div style={{ height: 14, background: "#e5e7eb", borderRadius: 4, width: "80%" }} />
      </div>
    </div>
  );
}

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [saved, setSaved] = useState([]);

  const [categories, setCategories] = useState([]);
  const [newsRaw, setNewsRaw] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get(`/news-category`);
        if (response && response.status === 200) {
          setCategories(response?.data?.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch news
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/news`);
        if (response && response.status === 200) {
          setNewsRaw(response?.data?.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch news:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  // Build category lookup map: id -> name
  const categoryMap = categories.reduce((acc, cat) => {
    acc[cat.id] = cat.name;
    return acc;
  }, {});

  // Adapt raw API news to display shape, injecting categoryLabel
  const allNews = newsRaw.map((item, i) =>
    adaptNews({ ...item, categoryLabel: categoryMap[item.category] || "Мэдээ" }, i)
  );

  const toggleSave = (id) =>
    setSaved(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  // Featured = first item where feature === true
  const featured = activeCategory === "all" && !searchQuery
    ? allNews.find(n => n.isFeatured)
    : null;

  // Rest = non-featured items
  const rest = allNews.filter(n => !n.isFeatured);

  // Apply category + search filters to rest
  const filtered = rest.filter(n => {
    const matchCat = activeCategory === "all" || String(n.category) === String(activeCategory);
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      n.title.toLowerCase().includes(q) ||
      n.excerpt.toLowerCase().includes(q) ||
      n.categoryLabel.toLowerCase().includes(q) ||
      (n.tags || []).some(t => t.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  // List rows: all news (featured + non-featured), max 4
  const listNews = allNews.slice(0, 4);

  // Active category label for section title
  const activeCategoryLabel = categories.find(c => String(c.id) === String(activeCategory))?.name;

  return (
    <div className={css.page}>
      {/* Category tab bar */}
      <div className={css.categoryBar}>
        <div className={css.categoryInner}>
          {/* "All" tab */}
          <button
            onClick={() => setActiveCategory("all")}
            className={`${css.catTab} ${activeCategory === "all" ? css.catTabActive : ""}`}
          >
            Бүгд
            <span className={css.catCount}>{allNews.length}</span>
          </button>

          {categories.map(cat => {
            const count = allNews.filter(n => String(n.category) === String(cat.id)).length;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(String(cat.id))}
                className={`${css.catTab} ${String(activeCategory) === String(cat.id) ? css.catTabActive : ""}`}
              >
                {cat.name}
                <span className={css.catCount}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main content ── */}
      <main className={css.main} style={{ marginTop: "30px" }}>

        {/* Left column */}
        <div className={css.leftCol}>

          {/* Hero — only on "all" tab, no search */}
          {featured && (
            <HeroCard
              news={featured}
              saved={saved.includes(featured.id)}
              onSave={toggleSave}
            />
          )}

          {/* Section header */}
          <div className={css.sectionHeader}>
            <div className={css.sectionTitle}>
              <div className={css.sectionAccent} />
              <h2 className={css.sectionTitleText}>
                {searchQuery
                  ? `"${searchQuery}" — ${filtered.length} үр дүн`
                  : activeCategory === "all"
                  ? "Сүүлийн мэдээ"
                  : activeCategoryLabel || "Мэдээ"}
              </h2>
            </div>
            <button className={css.seeAllBtn}>
              Бүгдийг харах <ChevronRight size={14} />
            </button>
          </div>

          {loading ? (
            <div className={css.newsGrid}>
              {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length > 0 ? (
            <div className={css.newsGrid}>
              {filtered.map(n => (
                <NewsCard key={n.id} news={n} saved={saved.includes(n.id)} onSave={toggleSave} />
              ))}
            </div>
          ) : (
            <div className={css.emptyState}>
              <Newspaper size={48} strokeWidth={1} />
              <h3 className={css.emptyStateTitle}>Мэдээ олдсонгүй</h3>
              <p className={css.emptyStateText}>Хайлтын нөхцөлөө өөрчлөнө үү</p>
            </div>
          )}

          {/* List rows — only on "all" tab, no search */}
          {activeCategory === "all" && !searchQuery && listNews.length > 0 && (
            <div className={css.listSection}>
              <div className={css.sectionHeader}>
                <div className={css.sectionTitle}>
                  <div className={css.sectionAccent} />
                  <h2 className={css.sectionTitleText}>Онцлох мэдээ</h2>
                </div>
                <button className={css.seeAllBtn}>
                  Бүгд <ChevronRight size={14} />
                </button>
              </div>
              {listNews.map((n, i) => (
                <NewsRow
                  key={n.id}
                  news={n}
                  rank={i}
                  saved={saved.includes(n.id)}
                  onSave={toggleSave}
                />
              ))}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}