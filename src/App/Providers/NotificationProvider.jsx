import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import css from "./style.module.css";
import { Bell, X, CheckCircle, Clock } from "lucide-react";
import axiosInstance from "../../Services/Api/AxiosInstance";

const NotificationCtx = createContext(null);

export const useNotification = () => useContext(NotificationCtx);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [modal, setModal]                 = useState(null);
  const [loading, setLoading]             = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/me/notification");
      if (res?.status === 200) {
        const data = res.data.data || [];
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);

        const unread = data.filter(n => !n.read);
        if (unread.length > 0) {
          setModal(unread[0]); 
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (notifId) => {
    try {
      setNotifications(prev =>
        prev.map(n => n.id === notifId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(prev - 1, 0));
    } catch (err) {
      console.error(err);
    }
  }, []);

  const closeModal = useCallback(async () => {
    if (modal) {
      await markAsRead(modal.id);

      
      const remaining = notifications.filter(n => !n.read && n.id !== modal.id);
      setModal(remaining.length > 0 ? remaining[0] : null);
    }
  }, [modal, notifications, markAsRead]);

  // Бүгдийг уншсан гэж тэмдэглэх
  const markAllAsRead = useCallback(async () => {
    try {
      await axiosInstance.patch("/notification/read-all");
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      setModal(null);
    } catch (err) {
      console.error(err);
    }
  }, []);

  return (
    <NotificationCtx.Provider value={{
      notifications,
      unreadCount,
      loading,
      fetchNotifications,
      markAsRead,
      markAllAsRead
    }}>
      {children}

      {/* Modal */}
      {modal && (
        <div className={css.overlay} onClick={closeModal}>
          <div className={css.modal} onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className={css.modalHeader}>
              <div className={css.modalIcon}>
                <Bell size={22} />
              </div>
              <div className={css.modalHeaderText}>
                <h3 className={css.modalTitle}>Шинэ мэдэгдэл</h3>
                {unreadCount > 1 && (
                  <span className={css.modalBadge}>{unreadCount} мэдэгдэл</span>
                )}
              </div>
              <button className={css.closeBtn} onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className={css.modalBody}>
              <h4 className={css.notifTitle}>{modal.title}</h4>
              <p className={css.notifContent}>{modal.contet}</p>
              <div className={css.notifDate}>
                <Clock size={13} />
                <span>{new Date(modal.date).toLocaleString("mn-MN")}</span>
              </div>
            </div>

            {/* Footer */}
            <div className={css.modalFooter}>
              {unreadCount > 1 && (
                <button className={css.readAllBtn} onClick={markAllAsRead}>
                  <CheckCircle size={16} />
                  Бүгдийг уншсан
                </button>
              )}
              <button className={css.okBtn} onClick={closeModal}>
                {unreadCount > 1 ? "Дараагийн мэдэгдэл" : "Ойлголоо"}
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationCtx.Provider>
  );
};