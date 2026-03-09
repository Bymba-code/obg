import React, { useState, useRef, useEffect } from "react";
import { 
  Send,
  Paperclip,
  Image as ImageIcon,
  Smile,
  Phone,
  Video,
  MoreVertical,
  Search,
  X,
  Check,
  CheckCheck,
  Clock,
  Mic,
  Users,
  Edit3,
  Trash2,
  Reply,
  Copy,
  Download,
  Star,
  ArrowLeft
} from "lucide-react";
import css from "./style.module.css";

const Chat = () => {
  const [conversations, setConversations] = useState([
    {
      id: 1,
      name: "Б. Мөнхбат",
      avatar: "https://via.placeholder.com/48/E1761B/FFFFFF?text=БМ",
      lastMessage: "Маргааш уулзъя!",
      timestamp: "10:30",
      unreadCount: 2,
      online: true,
      typing: false
    },
    {
      id: 2,
      name: "Аврах ажиллагааны баг",
      avatar: "https://via.placeholder.com/48/2A02A0/FFFFFF?text=АБ",
      lastMessage: "Сургалтын материал илгээлээ",
      timestamp: "Өчигдөр",
      unreadCount: 0,
      online: false,
      isGroup: true,
      members: 5
    },
    {
      id: 3,
      name: "С. Энхжаргал",
      avatar: "https://via.placeholder.com/48/10B981/FFFFFF?text=СЭ",
      lastMessage: "Баярлалаа!",
      timestamp: "2 өдрийн өмнө",
      unreadCount: 0,
      online: true,
      typing: false
    },
    {
      id: 4,
      name: "Д. Болормаа",
      avatar: "https://via.placeholder.com/48/8B5CF6/FFFFFF?text=ДБ",
      lastMessage: "Шалгалтын хариу хэзээ гарах вэ?",
      timestamp: "1 долоо хоно",
      unreadCount: 0,
      online: false,
      typing: false
    }
  ]);

  const [activeConversation, setActiveConversation] = useState(1);
  const [messages, setMessages] = useState([
    {
      id: 1,
      senderId: 1,
      senderName: "Б. Мөнхбат",
      text: "Сайн байна уу? Өнөөдрийн хичээл хэрхэн байлаа?",
      timestamp: "09:15",
      status: "read",
      type: "text"
    },
    {
      id: 2,
      senderId: "me",
      text: "Сайн байна! Маш сонирхолтой байлаа, ялангуяа аврах техникийн тухай хэсэг",
      timestamp: "09:17",
      status: "read",
      type: "text"
    },
    {
      id: 3,
      senderId: 1,
      senderName: "Б. Мөнхбат",
      text: "Тийм ээ! PDF материалыг уншиж дууслаа уу?",
      timestamp: "09:20",
      status: "read",
      type: "text"
    },
    {
      id: 4,
      senderId: "me",
      text: "Тийм ээ, маш их мэдээлэл авлаа",
      timestamp: "09:22",
      status: "read",
      type: "text"
    },
    {
      id: 5,
      senderId: 1,
      senderName: "Б. Мөнхбат",
      type: "image",
      imageUrl: "https://via.placeholder.com/300x200/E1761B/FFFFFF?text=Сургалтын+зураг",
      text: "Энэ зургийг харсан уу?",
      timestamp: "09:25",
      status: "read"
    },
    {
      id: 6,
      senderId: "me",
      text: "Үгүй ээ, одоо харлаа. Маш тод байна!",
      timestamp: "09:27",
      status: "delivered",
      type: "text"
    },
    {
      id: 7,
      senderId: 1,
      senderName: "Б. Мөнхбат",
      text: "Маргааш уулзъя! 🎉",
      timestamp: "10:30",
      status: "sent",
      type: "text"
    }
  ]);

  const [messageInput, setMessageInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [showImageModal, setShowImageModal] = useState(null);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const emojis = ["😊", "😂", "❤️", "👍", "🎉", "🔥", "✨", "💯", "👏", "🙌", "😍", "🤗", "😎", "🤔", "😢", "😅", "🥳", "😘", "💪", "🌟"];

  const activeChat = conversations.find(c => c.id === activeConversation);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (imagePreview) {
      handleSendImageMessage();
      return;
    }

    if (messageInput.trim() === "") return;

    const newMessage = {
      id: messages.length + 1,
      senderId: "me",
      text: messageInput,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      status: "sent",
      type: "text"
    };

    setMessages([...messages, newMessage]);
    setMessageInput("");
    setShowEmojiPicker(false);

    // Update last message in conversation
    setConversations(conversations.map(conv => 
      conv.id === activeConversation 
        ? { ...conv, lastMessage: messageInput, timestamp: "Одоо" }
        : conv
    ));

    // Simulate typing indicator and response
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const response = {
          id: messages.length + 2,
          senderId: activeConversation,
          senderName: activeChat?.name,
          text: "Баярлалаа! 👍",
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
          status: "read",
          type: "text"
        };
        setMessages(prev => [...prev, response]);
      }, 1500);
    }, 500);
  };

  const handleEmojiClick = (emoji) => {
    setMessageInput(messageInput + emoji);
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendImageMessage = () => {
    if (!imagePreview) return;

    const newMessage = {
      id: messages.length + 1,
      senderId: "me",
      type: "image",
      imageUrl: imagePreview,
      text: messageInput || "",
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      status: "sent"
    };

    setMessages([...messages, newMessage]);
    setMessageInput("");
    setImagePreview(null);
    setShowEmojiPicker(false);

    setConversations(conversations.map(conv => 
      conv.id === activeConversation 
        ? { ...conv, lastMessage: "📷 Зураг", timestamp: "Одоо" }
        : conv
    ));
  };

  const handleRemoveImagePreview = () => {
    setImagePreview(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getMessageStatus = (status) => {
    switch(status) {
      case "sent":
        return <Check size={14} />;
      case "delivered":
        return <CheckCheck size={14} />;
      case "read":
        return <CheckCheck size={14} className={css.readIcon} />;
      default:
        return <Clock size={14} />;
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={css.chatContainer}>
      <div className={`${css.sidebar} ${showMobileChat ? css.hiddenMobile : ''}`}>
        <div className={css.sidebarHeader}>
          <h2 className={css.sidebarTitle}>Чат</h2>
          <button className={css.headerBtn}>
            <Edit3 size={20} />
          </button>
        </div>

        <div className={css.searchBox}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Хайх..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={css.searchInput}
          />
          {searchQuery && (
            <button className={css.clearSearch} onClick={() => setSearchQuery("")}>
              <X size={16} />
            </button>
          )}
        </div>

        <div className={css.conversationsList}>
          {filteredConversations.map((conv) => (
            <div
              key={conv.id}
              className={`${css.conversationItem} ${activeConversation === conv.id ? css.active : ''}`}
              onClick={() => {
                setActiveConversation(conv.id);
                setShowMobileChat(true);
              }}
            >
              <div className={css.avatarWrapper}>
                <img src={conv.avatar} alt={conv.name} className={css.avatar} />
                {conv.online && <div className={css.onlineIndicator} />}
                {conv.isGroup && (
                  <div className={css.groupBadge}>
                    <Users size={12} />
                  </div>
                )}
              </div>
              
              <div className={css.conversationInfo}>
                <div className={css.conversationTop}>
                  <h3 className={css.conversationName}>{conv.name}</h3>
                  <span className={css.timestamp}>{conv.timestamp}</span>
                </div>
                <div className={css.conversationBottom}>
                  <p className={css.lastMessage}>
                    {conv.typing ? (
                      <span className={css.typingText}>
                        <span className={css.typingDot}></span>
                        <span className={css.typingDot}></span>
                        <span className={css.typingDot}></span>
                        Бичиж байна...
                      </span>
                    ) : (
                      conv.lastMessage
                    )}
                  </p>
                  {conv.unreadCount > 0 && (
                    <div className={css.unreadBadge}>{conv.unreadCount}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`${css.chatArea} ${showMobileChat ? css.showMobile : ''}`}>
        <div className={css.chatHeader}>
          <button 
            className={css.backBtn}
            onClick={() => setShowMobileChat(false)}
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className={css.chatHeaderInfo}>
            <div className={css.avatarWrapper}>
              <img src={activeChat?.avatar} alt={activeChat?.name} className={css.avatar} />
              {activeChat?.online && <div className={css.onlineIndicator} />}
            </div>
            <div>
              <h3 className={css.chatName}>{activeChat?.name}</h3>
              <p className={css.chatStatus}>
                {activeChat?.isGroup 
                  ? `${activeChat.members} гишүүн` 
                  : activeChat?.online 
                    ? "Идэвхтэй" 
                    : "Идэвхгүй"
                }
              </p>
            </div>
          </div>

          <div className={css.chatHeaderActions}>
            <button className={css.headerActionBtn}>
              <MoreVertical size={20} />
            </button>
          </div>
        </div>
        <div className={css.messagesArea}>
          <div className={css.dateLabel}>Өнөөдөр</div>

          {messages.map((message) => (
            <div
              key={message.id}
              className={`${css.messageWrapper} ${message.senderId === "me" ? css.myMessage : css.theirMessage}`}
            >
              {message.senderId !== "me" && (
                <img 
                  src={activeChat?.avatar} 
                  alt={message.senderName} 
                  className={css.messageAvatar} 
                />
              )}
              
              <div className={css.messageBubble}>
                {message.type === "image" && (
                  <div 
                    className={css.messageImage}
                    onClick={() => setShowImageModal(message.imageUrl)}
                  >
                    <img src={message.imageUrl} alt="Зураг" />
                    <div className={css.imageOverlay}>
                      <Download size={24} />
                    </div>
                  </div>
                )}
                {message.text && (
                  <div className={css.messageText}>{message.text}</div>
                )}
                <div className={css.messageFooter}>
                  <span className={css.messageTime}>{message.timestamp}</span>
                  {message.senderId === "me" && (
                    <span className={css.messageStatus}>
                      {getMessageStatus(message.status)}
                    </span>
                  )}
                </div>
              </div>

              <button 
                className={css.messageMenu}
                onClick={() => setSelectedMessage(message.id)}
              >
                <MoreVertical size={14} />
              </button>
            </div>
          ))}

          {isTyping && (
            <div className={`${css.messageWrapper} ${css.theirMessage}`}>
              <img 
                src={activeChat?.avatar} 
                alt={activeChat?.name} 
                className={css.messageAvatar} 
              />
              <div className={css.typingIndicator}>
                <span className={css.typingDot}></span>
                <span className={css.typingDot}></span>
                <span className={css.typingDot}></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className={css.inputArea}>
          {imagePreview && (
            <div className={css.imagePreviewContainer}>
              <div className={css.imagePreviewWrapper}>
                <img src={imagePreview} alt="Preview" className={css.imagePreview} />
                <button 
                  className={css.removeImageBtn}
                  onClick={handleRemoveImagePreview}
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          )}

          {showEmojiPicker && (
            <div className={css.emojiPicker}>
              <div className={css.emojiPickerHeader}>
                <span className={css.emojiPickerTitle}>Эмоджи сонгох</span>
                <button 
                  className={css.emojiPickerClose}
                  onClick={() => setShowEmojiPicker(false)}
                >
                  <X size={16} />
                </button>
              </div>
              <div className={css.emojiGrid}>
                {emojis.map((emoji, index) => (
                  <button
                    key={index}
                    className={css.emojiBtn}
                    onClick={() => handleEmojiClick(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className={css.inputWrapper}>
            <button 
              className={css.inputBtn}
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              title="Эмоджи"
            >
              <Smile size={22} />
            </button>

            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="*/*"
            />

            <input
              type="file"
              ref={imageInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              onChange={handleImageUpload}
            />

            <button 
              className={css.inputBtn} 
              onClick={() => imageInputRef.current?.click()}
              title="Зураг оруулах"
            >
              <ImageIcon size={22} />
            </button>

            <button 
              className={css.inputBtn} 
              onClick={handleFileUpload}
              title="Файл хавсаргах"
            >
              <Paperclip size={22} />
            </button>

            <textarea
              className={css.messageInput}
              placeholder="Мессеж бичих..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={1}
            />

            {messageInput.trim() || imagePreview ? (
              <button 
                className={css.sendBtn}
                onClick={handleSendMessage}
                title="Илгээх"
              >
                <Send size={20} />
              </button>
            ) : (
              <button className={css.inputBtn} title="Дуу бичлэг">
                <Mic size={22} />
              </button>
            )}
          </div>
        </div>
      </div>

      {selectedMessage && (
        <div 
          className={css.contextMenuOverlay}
          onClick={() => setSelectedMessage(null)}
        >
          <div className={css.contextMenu}>
            <button className={css.contextMenuItem}>
              <Reply size={18} />
              Хариулах
            </button>
            <button className={css.contextMenuItem}>
              <Copy size={18} />
              Хуулах
            </button>
            <button className={css.contextMenuItem}>
              <Star size={18} />
              Одтой
            </button>
            <button className={css.contextMenuItem}>
              <Download size={18} />
              Татаж авах
            </button>
            <button className={`${css.contextMenuItem} ${css.danger}`}>
              <Trash2 size={18} />
              Устгах
            </button>
          </div>
        </div>
      )}

      {showImageModal && (
        <div 
          className={css.imageModalOverlay}
          onClick={() => setShowImageModal(null)}
        >
          <div className={css.imageModalHeader}>
            <button 
              className={css.imageModalClose}
              onClick={() => setShowImageModal(null)}
            >
              <X size={24} />
            </button>
            <button className={css.imageModalDownload}>
              <Download size={20} />
              Татаж авах
            </button>
          </div>
          <div className={css.imageModalContent}>
            <img src={showImageModal} alt="Full size" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;