import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Moon,
  Sun,
  HelpCircle,
  MessageSquare,
  Zap,
  Mail,
  Calendar,
  BookOpen,
  FileText,
  Award,
  Home,
  UserCircle,
  MoreVertical
} from "lucide-react";
import styles from "./style.module.css";
import { useAuth } from "../../App/Providers/AuthProvider";

const Navbar = ({ isSidebar, setIsSidebar }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  
  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const quickMenuRef = useRef(null);

  const notifications = [
    { 
      id: 1, 
      title: "Шинэ даалгавар", 
      message: "Математик хичээлд шинэ даалгавар нэмэгдлээ", 
      time: "5 мин", 
      unread: true,
      icon: FileText,
      color: "#E1761B"
    },
    { 
      id: 2, 
      title: "Үнэлгээ", 
      message: "Физикийн шалгалтын үр дүн гарлаа", 
      time: "1 цаг", 
      unread: true,
      icon: Award,
      color: "#2A02A0"
    },
    { 
      id: 3, 
      title: "Мэдэгдэл", 
      message: "Маргааш онлайн хичээл болно", 
      time: "2 цаг", 
      unread: false,
      icon: Calendar,
      color: "#10B981"
    },
  ];

  const quickMenuItems = [
    { icon: Home, label: "Нүүр", path: "/", color: "#E1761B" },
    { icon: Calendar, label: "Хуваарь", path: "/schedule", color: "#8B5CF6" },
    { icon: BookOpen, label: "Сургалт", path: "/courses", color: "#10B981" },
    { icon: FileText, label: "Шалгалт", path: "/exam-list", color: "#F59E0B" },
    { icon: Settings, label: "Тохиргоо", path: "/settings", color: "#64748B" },
  ];

  const getUserName = () => {
    if (!user?.[0]?.data) return "Admin";
    const { firstname = "", lastname = "" } = user[0].data;
    return firstname && lastname 
      ? `${firstname.slice(0, 1)}. ${lastname}` 
      : firstname || lastname || "Admin";
  };

  const getUserInitials = () => {
    if (!user?.[0]?.data) return "A";
    const { firstname = "", lastname = "" } = user[0].data;
    return `${firstname.charAt(0)}${lastname.charAt(0)}`.toUpperCase() || "AD";
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (quickMenuRef.current && !quickMenuRef.current.contains(event.target)) {
        setIsQuickMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    if (window.confirm("Та системээс гарахдаа итгэлтэй байна уу?")) {
      try {
        await logout();
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <nav className={`${styles.navbar} ${isSidebar ? styles.expanded : ''}`}>
      <div className={styles.container}>
        {/* Left Section */}
        <div className={styles.left}>
          <button
            className={styles.menuBtn}
            onClick={() => setIsSidebar(!isSidebar)}
            aria-label="Toggle Menu"
          >
            <Menu size={20} strokeWidth={2} />
          </button>
          Онцгой байдлын ерөнхий газар Гамшгаас хамгаалах сургалтын газар

          {/* Mobile Logo */}
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <Zap size={18} strokeWidth={2.5} />
            </div>
            <span className={styles.logoText}>DLMS</span>
          </div>
        </div>

        {/* Right Section */}
        <div className={styles.right}>
          {/* Quick Menu */}
          <div className={styles.dropdown} ref={quickMenuRef}>
            <button
              className={`${styles.iconBtn} ${isQuickMenuOpen ? styles.active : ''}`}
              onClick={() => setIsQuickMenuOpen(!isQuickMenuOpen)}
              title="Хурдан цэс"
            >
              <MoreVertical size={20} strokeWidth={2} />
            </button>

            {isQuickMenuOpen && (
              <div className={styles.dropdownMenu}>
                <div className={styles.menuHeader}>
                  <span>Хурдан холбоос</span>
                </div>
                <div className={styles.quickGrid}>
                  {quickMenuItems.map((item, index) => (
                    <button
                      key={index}
                      className={styles.quickItem}
                      onClick={() => {
                        navigate(item.path);
                        setIsQuickMenuOpen(false);
                      }}
                      style={{ '--item-color': item.color }}
                    >
                      <div className={styles.quickIcon}>
                        <item.icon size={18} strokeWidth={2} />
                      </div>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          

          {/* Help */}
          <button
            className={styles.iconBtn}
            onClick={() => navigate('/help')}
            title="Тусламж"
          >
            <HelpCircle size={20} strokeWidth={2} />
          </button>

          {/* Messages */}
          <button
            className={styles.iconBtn}
            onClick={() => navigate('/messages')}
            title="Зурвас"
          >
            <MessageSquare size={20} strokeWidth={2} />
            {user?.messageCount > 0 && (
              <span className={styles.badge}>{user.messageCount}</span>
            )}
          </button>

          {/* Notifications */}
          <div className={styles.dropdown} ref={notificationRef}>
            <button
              className={`${styles.iconBtn} ${isNotificationOpen ? styles.active : ''}`}
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              title="Мэдэгдэл"
            >
              <Bell size={20} strokeWidth={2} />
              {unreadCount > 0 && (
                <span className={styles.badge}>{unreadCount}</span>
              )}
            </button>

            {isNotificationOpen && (
              <div className={`${styles.dropdownMenu} ${styles.notificationsMenu}`}>
                <div className={styles.menuHeader}>
                  <span>Мэдэгдэл</span>
                  {unreadCount > 0 && (
                    <button className={styles.markRead}>
                      Бүгдийг уншсан
                    </button>
                  )}
                </div>

                <div className={styles.notificationList}>
                  {notifications.map((notif) => {
                    const Icon = notif.icon;
                    return (
                      <div
                        key={notif.id}
                        className={`${styles.notificationItem} ${
                          notif.unread ? styles.unread : ''
                        }`}
                      >
                        <div 
                          className={styles.notifIcon}
                          style={{ backgroundColor: `${notif.color}15`, color: notif.color }}
                        >
                          <Icon size={16} strokeWidth={2} />
                        </div>
                        <div className={styles.notifContent}>
                          <div className={styles.notifTitle}>{notif.title}</div>
                          <div className={styles.notifMessage}>{notif.message}</div>
                          <div className={styles.notifTime}>{notif.time} өмнө</div>
                        </div>
                        {notif.unread && <div className={styles.unreadDot}></div>}
                      </div>
                    );
                  })}
                </div>

                <button className={styles.viewAll}>
                  Бүгдийг харах
                </button>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className={styles.dropdown} ref={profileRef}>
            <button
              className={`${styles.profileBtn} ${isProfileOpen ? styles.active : ''}`}
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <div className={styles.avatar}>
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" />
                ) : (
                  <div className={styles.avatarInitials}>
                    {getUserInitials()}
                  </div>
                )}
              </div>
              <div className={styles.profileInfo}>
                <span className={styles.profileName}>{getUserName()}</span>
                <span className={styles.profileRole}>Админ</span>
              </div>
              <ChevronDown 
                size={14} 
                className={styles.chevron}
              />
            </button>

            {isProfileOpen && (
              <div className={styles.dropdownMenu}>
                <div className={styles.profileHeader}>
                  <div className={styles.profileHeaderAvatar}>
                    {getUserInitials()}
                  </div>
                  <div className={styles.profileHeaderInfo}>
                    <div className={styles.profileHeaderName}>{getUserName()}</div>
                    <div className={styles.profileHeaderRole}>Админ эрхтэй</div>
                  </div>
                </div>

                <div className={styles.menuSection}>
                  <button 
                    className={styles.menuItem}
                    onClick={() => {
                      navigate('/profile');
                      setIsProfileOpen(false);
                    }}
                  >
                    <UserCircle size={18} strokeWidth={2} />
                    <span>Миний профайл</span>
                  </button>
                  <button 
                    className={styles.menuItem}
                    onClick={() => {
                      navigate('/settings');
                      setIsProfileOpen(false);
                    }}
                  >
                    <Settings size={18} strokeWidth={2} />
                    <span>Тохиргоо</span>
                  </button>
                </div>

                <div className={styles.menuDivider}></div>

                <div className={styles.menuSection}>
                  <button 
                    className={`${styles.menuItem} ${styles.logoutItem}`}
                    onClick={handleLogout}
                  >
                    <LogOut size={18} strokeWidth={2} />
                    <span>Гарах</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;