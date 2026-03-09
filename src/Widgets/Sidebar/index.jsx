import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  Users, 
  BookOpen, 
  BarChart3, 
  LogOut,
  GraduationCap,
  Car,
  UserCircle,
  ChevronRight,
  MessageCircle,
  Newspaper,
  PlusCircle
} from 'lucide-react';
import styles from './style.module.css';
import { useAuth } from '../../App/Providers/AuthProvider';

export const PERMISSION_MENU_MAP = {
    user: {
        title:  "Хэрэглэгч",
        icon:   Users,
        path:   "/users",
        action: "view",
    },
    news: {
        title:  "Мэдээлэл",
        icon:   Newspaper,
        path:   null,
        action: "view",
        key:    "news_group",
        children: [
            { title: "Мэдээллийн ангилал", path: "/news-category-list", action: "view" },
            { title: "Мэдээлэл нэмэх",     path: "/news-add",           action: "add"  },
            { title: "Мэдэгдэл илгээх",     path: "/notification-add",           action: "add"  },
        ],
    },
    books: {
        title:  "Ном",
        icon:   Newspaper,
        path:   null,
        action: "view",
        key:    "book_group",
        children: [
            { title: "Жагсаалт", path: "/books-list", action: "view" },
            { title: "Нэмэх",     path: "/books-add", action: "view"  }
        ],
    },
    bookscategories: {
        title:  "Ном Ангилал",
        icon:   Newspaper,
        path:   null,
        action: "view",
        key:    "books_categories_group",
        children: [
            { title: "Жагсаалт", path: "/books-category-list", action: "view" }
        ],
    },
    lesson: {
        title:  "Хичээл",
        icon:   Newspaper,
        path:   null,
        action: "view",
        key:    "lessons_group",
        children: [
            { title: "Жагсаалт", path: "/lessons-list", action: "view" },
            { title: "Нэмэх",     path: "/lessons-add", action: "add"  }
        ],
    },
    test: {
        title:  "Тестийн сан",
        icon:   Newspaper,
        path:   null,
        action: "view",
        key:    "test_group",
        children: [
            { title: "Жагсаалт", path: "/test-list", action: "view" },
            { title: "Нэмэх",     path: "/test-add", action: "add"  }
        ],
    },
    report: {
        title:  "Тайлан",
        icon:   Newspaper,
        path:   null,
        action: "view",
        key:    "test_group",
        children: [
            { title: "Ангилал сургалт", path: "/angilal-surgalt-list", action: "view" },
            { title: "Ангилал сургалт тайлан илгээх",     path: "/angilal-surgalt-add", action: "view"  }
        ],
    },
};

const STATIC_MENU_GROUPS = [
    {
        title: "Үндсэн",
        items: [
            { title: "Хяналтын самбар", icon: LayoutDashboard, path: "/" }
        ]
    },
    {
        title: "Сургалт",
        items: [
            {
                title: "Сургалтууд",
                icon:  GraduationCap,
                key:   "student",
                children: [
                    { title: "Нээлттэй сургалт",  path: "/lessons-open"     },
                    { title: "Таны үзэх сургалт", path: "/lessons-enrolled" },
                    { title: "Дууссан сургалт",   path: "/lessons-end"      },
                ]
            },
        ]
    },
    {
        title: "Номын сан",
        items: [
            {
                title: "Номын сан",
                icon:  GraduationCap,
                key:   "books",
                children: [
                    { title: "Нээлттэй ном",  path: "/books-open"     },
                    { title: "Таны үзэх ном", path: "/books-enrolled" },
                    { title: "Дууссан ном",   path: "/books-end"      },
                ]
            },
        ]
    },
    {
        title: "Мэдээлэл",
        items: [
            // { title: "Чат",      icon: MessageCircle, path: "/messages" },
            { title: "Мэдээлэл", icon: Car,           path: "/news"     },
            // { title: "Зарлал",   icon: BarChart3,     path: "/email"    },
        ]
    },
];

const Sidebar = ({ isSidebar, setIsSidebar }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [expandedGroups, setExpandedGroups] = useState({});

    // ── permissions-аас динамик цэс үүсгэх ──
    const permissions = user?.permissions || {};

    const permissionItems = Object.entries(permissions)
        .filter(([module]) => PERMISSION_MENU_MAP[module])
        .map(([module, actions]) => {
            const def = PERMISSION_MENU_MAP[module];

            // Children байвал action шалгаж шүүх
            if (def.children) {
                const allowedChildren = def.children.filter((child) =>
                    actions.includes(child.action)
                );
                if (allowedChildren.length === 0) return null;
                return {
                    title:    def.title,
                    icon:     def.icon,
                    key:      def.key,
                    children: allowedChildren,
                };
            }

            // Энгийн item — action шалгах
            if (!actions.includes(def.action)) return null;
            return {
                title: def.title,
                icon:  def.icon,
                path:  def.path,
            };
        })
        .filter(Boolean);

    const menuGroups = [
        ...STATIC_MENU_GROUPS,
        ...(permissionItems.length > 0 ? [{
            title: "Удирдлага",
            items: permissionItems,
        }] : []),
    ];

    // ── Helpers ──
    const isActive = (path) => location.pathname === path;

    const isInGroup = (children) =>
        children?.some((child) =>
            location.pathname === child.path ||
            location.pathname.startsWith(child.path + '/')
        );

    const handleMenuClick = (path) => {
        if (path) {
            navigate(path);
            if (window.innerWidth <= 768) setIsSidebar(false);
        }
    };

    const toggleGroup = (key) => {
        setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleLogout = async () => {
        try { await logout(); } catch (e) { console.error(e); }
    };

    const getUserName = () => {
        if (!user) return "Admin";
        const { firstname = "", lastname = "" } = user;
        return firstname && lastname
            ? `${firstname.slice(0, 1)}. ${lastname}`
            : firstname || lastname || "Admin";
    };

    return (
        <>
            {isSidebar && (
                <div className={styles.overlay} onClick={() => setIsSidebar(false)} />
            )}

            <aside className={`${styles.sidebar} ${!isSidebar ? styles.collapsed : ''}`}>

                {/* ── Header ── */}
                <div className={styles.header}>
                    <div className={styles.brand}>
                        <div className={styles.brandIcon}>
                            <BookOpen size={20} strokeWidth={2.5} />
                        </div>
                        {isSidebar && <span className={styles.brandText}>ОБЕГ-ын Цахим сургалтын систем </span>}
                    </div>
                </div>

                {/* ── User ── */}
                <div className={styles.userSection}>
                    <div className={styles.userAvatar}>
                        <UserCircle size={24} />
                    </div>
                    {isSidebar && (
                        <div className={styles.userInfo}>
                            <span className={styles.userName}>{getUserName()}</span>
                            <span className={styles.userRole}>Админ</span>
                        </div>
                    )}
                </div>

                {/* ── Nav ── */}
                <nav className={styles.nav}>
                    {menuGroups.map((group, gi) => (
                        <div key={gi} className={styles.menuGroup}>
                            {isSidebar && (
                                <div className={styles.groupLabel}>{group.title}</div>
                            )}
                            <ul className={styles.menuList}>
                                {group.items.map((item, ii) => {
                                    const Icon          = item.icon;
                                    const hasChildren   = !!item.children?.length;
                                    const isGroupActive = hasChildren && isInGroup(item.children);
                                    const isExpanded    = expandedGroups[item.key];
                                    const itemActive    = item.path && isActive(item.path);

                                    return (
                                        <li key={ii}>
                                            <button
                                                className={`${styles.menuItem} ${
                                                    itemActive || isGroupActive ? styles.active : ''
                                                }`}
                                                onClick={() =>
                                                    hasChildren
                                                        ? toggleGroup(item.key)
                                                        : handleMenuClick(item.path)
                                                }
                                                title={!isSidebar ? item.title : ''}
                                            >
                                                <div className={styles.itemIcon}>
                                                    <Icon size={18} strokeWidth={2} />
                                                </div>
                                                {isSidebar && (
                                                    <>
                                                        <span className={styles.itemText}>{item.title}</span>
                                                        {hasChildren && (
                                                            <ChevronRight
                                                                size={14}
                                                                className={`${styles.expandIcon} ${
                                                                    isExpanded ? styles.expanded : ''
                                                                }`}
                                                            />
                                                        )}
                                                    </>
                                                )}
                                            </button>

                                            {/* Submenu */}
                                            {hasChildren && isSidebar && isExpanded && (
                                                <ul className={styles.submenu}>
                                                    {item.children.map((child, ci) => (
                                                        <li key={ci}>
                                                            <button
                                                                className={`${styles.submenuItem} ${
                                                                    isActive(child.path) ? styles.activeChild : ''
                                                                }`}
                                                                onClick={() => handleMenuClick(child.path)}
                                                            >
                                                                <span className={styles.submenuDot} />
                                                                <span>{child.title}</span>
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>

                {/* ── Footer ── */}
                <div className={styles.footer}>
                    <button
                        className={styles.logoutBtn}
                        onClick={handleLogout}
                        title={!isSidebar ? 'Гарах' : ''}
                    >
                        <LogOut size={18} strokeWidth={2} />
                        {isSidebar && <span>Гарах</span>}
                    </button>
                </div>

            </aside>
        </>
    );
};

export default Sidebar;