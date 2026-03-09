import React, { useState } from "react";
import { 
  Inbox,
  Send,
  FileText,
  Star,
  Trash2,
  Archive,
  Search,
  RefreshCw,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Filter,
  Paperclip,
  Flag,
  Tag,
  CheckSquare,
  Square,
  Mail,
  MailOpen,
  Clock,
  AlertCircle,
  Edit3,
  Reply,
  Forward,
  Download,
  Printer,
  Eye,
  X
} from "lucide-react";
import css from "./style.module.css";
import { useToast } from "../../App/Providers/ToastProvider";

const EmailList = () => {
  const toast = useToast()
  const [selectedFolder, setSelectedFolder] = useState("inbox");
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCompose, setShowCompose] = useState(false);

  const folders = [
    { id: "inbox", name: "Ирсэн", icon: Inbox, count: 8, color: "#E1761B" },
    { id: "sent", name: "Илгээсэн", icon: Send, count: 0, color: "#2A02A0" },
    { id: "drafts", name: "Ноорог", icon: FileText, count: 3, color: "#6B7280" },
    { id: "starred", name: "Одтой", icon: Star, count: 5, color: "#F59E0B" },
    { id: "archive", name: "Архив", icon: Archive, count: 12, color: "#10B981" },
    { id: "trash", name: "Устгасан", icon: Trash2, count: 2, color: "#EF4444" }
  ];

  const emails = [
    {
      id: 1,
      from: "Б. Мөнхбат",
      email: "monkhbat@example.com",
      avatar: "https://via.placeholder.com/40/E1761B/FFFFFF?text=БМ",
      subject: "Аврах ажиллагааны сургалтын материал",
      preview: "Сайн байна уу? Та сургалтын материалыг хавсаргаж илгээж байна. PDF файлууд болон видео хичээлүүдийг доор хавсаргасан...",
      time: "10:30",
      date: "Өнөөдөр",
      isRead: false,
      isStarred: true,
      hasAttachment: true,
      attachmentCount: 3,
      isImportant: true,
      labels: ["Сургалт", "Материал"],
      folder: "inbox"
    },
    {
      id: 2,
      from: "С. Энхжаргал",
      email: "enkhjargal@example.com",
      avatar: "https://via.placeholder.com/40/10B981/FFFFFF?text=СЭ",
      subject: "Шалгалтын хуваарийн тухай",
      preview: "Эрхэм хүндэт сурагчид, Та бүхэнд энэ сарын 25-нд болох шалгалтын хуваарийг мэдэгдэж байна...",
      time: "09:15",
      date: "Өнөөдөр",
      isRead: false,
      isStarred: false,
      hasAttachment: true,
      attachmentCount: 1,
      isImportant: false,
      labels: ["Шалгалт"],
      folder: "inbox"
    },
    {
      id: 3,
      from: "Аврах ажиллагааны баг",
      email: "rescue@example.com",
      avatar: "https://via.placeholder.com/40/2A02A0/FFFFFF?text=АБ",
      subject: "Дадлагын хичээлийн мэдэгдэл",
      preview: "Дараах долоо хоногт практик дадлага хийх болно. Та бүхэн бэлтгэл хангаж ирээрэй...",
      time: "Өчигдөр",
      date: "2024-12-15",
      isRead: true,
      isStarred: true,
      hasAttachment: false,
      isImportant: false,
      labels: ["Дадлага"],
      folder: "inbox"
    },
    {
      id: 4,
      from: "Д. Болормаа",
      email: "bolormaa@example.com",
      avatar: "https://via.placeholder.com/40/8B5CF6/FFFFFF?text=ДБ",
      subject: "Групп төслийн хамтын ажиллагаа",
      preview: "Манай багийн уулзалт маргааш болно. Хугацаа: 14:00, Газар: 301 тоот...",
      time: "2 өдрийн өмнө",
      date: "2024-12-14",
      isRead: true,
      isStarred: false,
      hasAttachment: false,
      isImportant: false,
      labels: ["Төсөл"],
      folder: "inbox"
    },
    {
      id: 5,
      from: "Системийн админ",
      email: "admin@system.com",
      avatar: "https://via.placeholder.com/40/6B7280/FFFFFF?text=СА",
      subject: "Систем шинэчлэлтийн мэдэгдэл",
      preview: "Системд шинэчлэлт хийгдэх тул 23:00-24:00 цагт үйлчилгээ түр зогсоно...",
      time: "1 долоо хоно",
      date: "2024-12-09",
      isRead: true,
      isStarred: false,
      hasAttachment: false,
      isImportant: true,
      labels: ["Систем"],
      folder: "inbox"
    },
    {
      id: 6,
      from: "Ч. Ганзориг",
      email: "ganzorig@example.com",
      avatar: "https://via.placeholder.com/40/EC4899/FFFFFF?text=ЧГ",
      subject: "Гэрчилгээний хүсэлт",
      preview: "Сайн байна уу? Би сургалтаа амжилттай дүүргэсний гэрчилгээ авах хүсэлт гаргаж байна...",
      time: "1 долоо хоно",
      date: "2024-12-09",
      isRead: false,
      isStarred: true,
      hasAttachment: false,
      isImportant: false,
      labels: ["Гэрчилгээ"],
      folder: "inbox"
    },
    {
      id: 7,
      from: "Т. Алтанхуяг",
      email: "altankhuyag@example.com",
      avatar: "https://via.placeholder.com/40/0EA5E9/FFFFFF?text=ТА",
      subject: "Дараагийн модулийн танилцуулга",
      preview: "Сайн байна уу? Дараагийн долоо хоногт эхлэх модулийн тухай танилцуулга илгээж байна...",
      time: "2 долоо хоно",
      date: "2024-12-02",
      isRead: true,
      isStarred: false,
      hasAttachment: true,
      attachmentCount: 2,
      isImportant: false,
      labels: ["Модуль"],
      folder: "inbox"
    },
    {
      id: 8,
      from: "Сургалтын төв",
      email: "training@center.com",
      avatar: "https://via.placeholder.com/40/F59E0B/FFFFFF?text=СТ",
      subject: "Амжилт хүсье!",
      preview: "Эрхэм сурагч та, Таныг энэ сургалтад элссэнд баярлалаа. Та амжилттай суралцаарай!",
      time: "1 сар",
      date: "2024-11-16",
      isRead: true,
      isStarred: true,
      hasAttachment: false,
      isImportant: false,
      labels: ["Мэндчилгээ"],
      folder: "inbox"
    }
  ];

  const [emailsList, setEmailsList] = useState(emails);

  const filteredEmails = emailsList.filter(email => {
    const matchesFolder = email.folder === selectedFolder;
    const matchesSearch = 
      email.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.preview.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const handleSelectEmail = (emailId) => {
    if (selectedEmails.includes(emailId)) {
      setSelectedEmails(selectedEmails.filter(id => id !== emailId));
    } else {
      setSelectedEmails([...selectedEmails, emailId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedEmails.length === filteredEmails.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(filteredEmails.map(e => e.id));
    }
  };

  const handleStarEmail = (emailId) => {
    setEmailsList(emailsList.map(email => 
      email.id === emailId ? { ...email, isStarred: !email.isStarred } : email
    ));
  };

  const handleMarkAsRead = (emailId) => {
    setEmailsList(emailsList.map(email => 
      email.id === emailId ? { ...email, isRead: true } : email
    ));
  };

  const handleDeleteEmails = () => {
    setEmailsList(emailsList.map(email => 
      selectedEmails.includes(email.id) ? { ...email, folder: "trash" } : email
    ));
    setSelectedEmails([]);
  };

  const handleArchiveEmails = () => {
    setEmailsList(emailsList.map(email => 
      selectedEmails.includes(email.id) ? { ...email, folder: "archive" } : email
    ));
    setSelectedEmails([]);
  };

  const selectedEmailData = emailsList.find(e => e.id === selectedEmail);

  const unreadCount = emailsList.filter(e => e.folder === selectedFolder && !e.isRead).length;

  return (
    <div className={css.emailContainer}>
      <div className={css.sidebar}>
        <div className={css.sidebarHeader}>
          <h2 className={css.sidebarTitle}>Зарлал</h2>
          <button 
            className={css.composeBtn}
            onClick={() => toast.error("test")}
          >
            <Edit3 size={18} />
            Бичих
          </button>
        </div>

        <div className={css.foldersList}>
          {folders.map((folder) => {
            const FolderIcon = folder.icon;
            return (
              <button
                key={folder.id}
                className={`${css.folderItem} ${selectedFolder === folder.id ? css.active : ''}`}
                onClick={() => setSelectedFolder(folder.id)}
              >
                <div className={css.folderIcon} style={{ color: folder.color }}>
                  <FolderIcon size={20} />
                </div>
                <span className={css.folderName}>{folder.name}</span>
                {folder.count > 0 && (
                  <span className={css.folderCount} style={{ background: folder.color }}>
                    {folder.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

      </div>

      <div className={css.emailListArea}>
        <div className={css.listHeader}>
          <div className={css.listHeaderLeft}>
            <button 
              className={css.selectAllBtn}
              onClick={handleSelectAll}
            >
              {selectedEmails.length === filteredEmails.length && filteredEmails.length > 0 ? (
                <CheckSquare size={20} />
              ) : (
                <Square size={20} />
              )}
            </button>

            {selectedEmails.length > 0 ? (
              <>
                <button className={css.actionBtn} onClick={handleArchiveEmails}>
                  <Archive size={18} />
                </button>
                <button className={css.actionBtn} onClick={handleDeleteEmails}>
                  <Trash2 size={18} />
                </button>
                <button className={css.actionBtn}>
                  <MailOpen size={18} />
                </button>
                <button className={css.actionBtn}>
                  <Tag size={18} />
                </button>
                <span className={css.selectedCount}>{selectedEmails.length} сонгогдсон</span>
              </>
            ) : (
              <>
                <button className={css.actionBtn}>
                  <RefreshCw size={18} />
                </button>
                <button className={css.actionBtn}>
                  <Filter size={18} />
                </button>
                <button className={css.actionBtn}>
                  <MoreVertical size={18} />
                </button>
              </>
            )}
          </div>

          <div className={css.listHeaderRight}>
            <span className={css.emailCount}>1-{filteredEmails.length} / {filteredEmails.length}</span>
            <button className={css.navBtn}>
              <ChevronLeft size={18} />
            </button>
            <button className={css.navBtn}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className={css.searchBar}>
          <Search size={18} />
          <input
            type="text"
            placeholder="И-мэйл хайх..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={css.searchInput}
          />
          {searchQuery && (
            <button className={css.clearSearchBtn} onClick={() => setSearchQuery("")}>
              <X size={16} />
            </button>
          )}
        </div>

        <div className={css.emailList}>
          {filteredEmails.length === 0 ? (
            <div className={css.emptyState}>
              <Mail size={48} />
              <h3>И-мэйл олдсонгүй</h3>
              <p>Энэ хэсэгт и-мэйл байхгүй байна</p>
            </div>
          ) : (
            filteredEmails.map((email) => (
              <div
                key={email.id}
                className={`${css.emailItem} ${!email.isRead ? css.unread : ''} ${selectedEmail === email.id ? css.activeEmail : ''}`}
                onClick={() => {
                  setSelectedEmail(email.id);
                  handleMarkAsRead(email.id);
                }}
              >
                <div className={css.emailCheckbox}>
                  <button
                    className={css.checkbox}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectEmail(email.id);
                    }}
                  >
                    {selectedEmails.includes(email.id) ? (
                      <CheckSquare size={18} />
                    ) : (
                      <Square size={18} />
                    )}
                  </button>

                  {email.isImportant && (
                    <div className={css.importantBadge}>
                      <AlertCircle size={16} />
                    </div>
                  )}
                </div>

                <img src={email.avatar} alt={email.from} className={css.emailAvatar} />

                <div className={css.emailContent}>
                  <div className={css.emailHeader}>
                    <span className={css.emailFrom}>{email.from}</span>
                    <div className={css.emailMeta}>
                      {email.hasAttachment && (
                        <span className={css.attachmentIcon}>
                          <Paperclip size={14} />
                          {email.attachmentCount}
                        </span>
                      )}
                      <span className={css.emailTime}>{email.time}</span>
                    </div>
                  </div>

                  <div className={css.emailSubject}>
                    {email.subject}
                    {email.labels.length > 0 && (
                      <div className={css.emailLabels}>
                        {email.labels.map((label, index) => (
                          <span key={index} className={css.emailLabel}>
                            {label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <p className={css.emailPreview}>{email.preview}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right - Email Detail */}
      {selectedEmailData ? (
        <div className={css.emailDetail}>
          <div className={css.detailHeader}>
            <button 
              className={css.closeDetailBtn}
              onClick={() => setSelectedEmail(null)}
            >
              <X size={20} />
            </button>

            <div className={css.detailActions}>
              <button className={css.detailActionBtn}>
                <Archive size={18} />
              </button>
              <button className={css.detailActionBtn}>
                <Trash2 size={18} />
              </button>
              <button className={css.detailActionBtn}>
                <MailOpen size={18} />
              </button>
              <button className={css.detailActionBtn}>
                <Clock size={18} />
              </button>
              <button className={css.detailActionBtn}>
                <MoreVertical size={18} />
              </button>
            </div>
          </div>

          <div className={css.detailContent}>
            <h2 className={css.detailSubject}>{selectedEmailData.subject}</h2>

            <div className={css.detailLabels}>
              {selectedEmailData.labels.map((label, index) => (
                <span key={index} className={css.detailLabel}>
                  <Tag size={12} />
                  {label}
                </span>
              ))}
            </div>

            <div className={css.senderInfo}>
              <img src={selectedEmailData.avatar} alt={selectedEmailData.from} className={css.senderAvatar} />
              <div className={css.senderDetails}>
                <div className={css.senderName}>{selectedEmailData.from}</div>
                <div className={css.senderEmail}>{selectedEmailData.email}</div>
              </div>
              <div className={css.emailDate}>{selectedEmailData.date}</div>
            </div>

            <div className={css.emailBody}>
              <p>{selectedEmailData.preview}</p>
              <p>
                Энэхүү и-мэйл нь сургалтын системд автоматаар үүсгэгдсэн жишээ и-мэйл юм. 
                Та энэхүү и-мэйл дэх мэдээллийг анхааралтай уншиж, шаардлагатай арга хэмжээг авна уу.
              </p>
              <p>
                Хэрэв танд асуулт байвал манай дэмжлэг үзүүлэх багт хандана уу.
              </p>
              <p>
                Өөрийн амжилт хүсье!
              </p>
            </div>

            {selectedEmailData.hasAttachment && (
              <div className={css.attachments}>
                <h3 className={css.attachmentsTitle}>
                  <Paperclip size={16} />
                  Хавсралт ({selectedEmailData.attachmentCount})
                </h3>
                <div className={css.attachmentsList}>
                  <div className={css.attachmentItem}>
                    <FileText size={32} />
                    <div className={css.attachmentInfo}>
                      <span className={css.attachmentName}>Сургалтын_материал.pdf</span>
                      <span className={css.attachmentSize}>2.4 MB</span>
                    </div>
                    <button className={css.downloadBtn}>
                      <Download size={18} />
                    </button>
                  </div>

                  {selectedEmailData.attachmentCount > 1 && (
                    <>
                      <div className={css.attachmentItem}>
                        <FileText size={32} />
                        <div className={css.attachmentInfo}>
                          <span className={css.attachmentName}>Хичээлийн_хуваарь.xlsx</span>
                          <span className={css.attachmentSize}>124 KB</span>
                        </div>
                        <button className={css.downloadBtn}>
                          <Download size={18} />
                        </button>
                      </div>

                      {selectedEmailData.attachmentCount > 2 && (
                        <div className={css.attachmentItem}>
                          <FileText size={32} />
                          <div className={css.attachmentInfo}>
                            <span className={css.attachmentName}>Гарын_авлага.docx</span>
                            <span className={css.attachmentSize}>856 KB</span>
                          </div>
                          <button className={css.downloadBtn}>
                            <Download size={18} />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            <div className={css.replyActions}>
              <button className={css.replyBtn}>
                <Reply size={18} />
                Хариулах
              </button>
              <button className={css.replyBtn}>
                <Forward size={18} />
                Дамжуулах
              </button>
              <button className={css.replyBtn}>
                <Printer size={18} />
                Хэвлэх
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className={css.emptyDetail}>
          <Eye size={64} />
          <h3>И-мэйл сонгоно уу</h3>
          <p>И-мэйлийн дэлгэрэнгүйг харахын тулд жагсаалтаас сонгоно уу</p>
        </div>
      )}

      {/* Compose Modal */}
      {showCompose && (
        <div className={css.composeOverlay} onClick={() => setShowCompose(false)}>
          <div className={css.composeModal} onClick={(e) => e.stopPropagation()}>
            <div className={css.composeHeader}>
              <h3>Шинэ и-мэйл</h3>
              <button 
                className={css.composeClose}
                onClick={() => setShowCompose(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className={css.composeBody}>
              <input 
                type="email" 
                placeholder="Хэнд:"
                className={css.composeInput}
              />
              <input 
                type="text" 
                placeholder="Сэдэв:"
                className={css.composeInput}
              />
              <textarea 
                placeholder="Мессеж бичих..."
                className={css.composeTextarea}
              />
            </div>

            <div className={css.composeFooter}>
              <button className={css.composeSendBtn}>
                <Send size={18} />
                Илгээх
              </button>
              <div className={css.composeActions}>
                <button className={css.composeActionBtn}>
                  <Paperclip size={18} />
                </button>
                <button className={css.composeActionBtn}>
                  <FileText size={18} />
                </button>
                <button className={css.composeActionBtn}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailList;