import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import MessageContextMenu, {
  EditMessageModal,
  DeleteMessageModal,
  ForwardMessageModal,
} from "./MessageContextMenu";
import { Check, CheckCheck, CornerUpLeft } from "lucide-react";

// Simplified animation - just fade in, no jumping
const messageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.1 } }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

function ChatContainer() {
  const {
    selectedUser, getMessagesByUserId, messages, isMessagesLoading,
    subscribeToMessages, unsubscribeFromMessages,
    editMessage, deleteMessage, reactToMessage, forwardMessage,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const [contextMenu, setContextMenu] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [forwardModal, setForwardModal] = useState(null);
  const [replyTo, setReplyTo] = useState(null);

  const longPressTimer = useRef(null);
  const touchStartPos = useRef({ x: 0, y: 0 });
  const isLongPress = useRef(false);

  useEffect(() => {
    getMessagesByUserId(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser, getMessagesByUserId, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleContextMenu = useCallback((e, msg) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ message: msg, position: { x: e.clientX, y: e.clientY } });
  }, []);

  const handleTouchStart = useCallback((e, msg) => {
    isLongPress.current = false;
    touchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      setContextMenu({ message: msg, position: { x: touchStartPos.current.x, y: touchStartPos.current.y } });
      if (navigator.vibrate) navigator.vibrate(50);
    }, 400);
  }, []);

  const handleTouchMove = useCallback((e) => {
    const dx = Math.abs(e.touches[0].clientX - touchStartPos.current.x);
    const dy = Math.abs(e.touches[0].clientY - touchStartPos.current.y);
    if (dx > 10 || dy > 10) {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    isLongPress.current = false;
  }, []);

  const closeContextMenu = useCallback(() => setContextMenu(null), []);
  const handleEdit = useCallback((msg) => setEditModal(msg), []);
  const handleSaveEdit = useCallback(async (id, txt) => editMessage && await editMessage(id, txt), [editMessage]);
  const handleDelete = useCallback((msg) => setDeleteModal(msg), []);
  const handleConfirmDelete = useCallback(async (id) => deleteMessage && await deleteMessage(id), [deleteMessage]);
  const handleReact = useCallback(async (msg, emoji) => reactToMessage && await reactToMessage(msg._id, emoji), [reactToMessage]);
  const handleForward = useCallback((msg) => setForwardModal(msg), []);
  const handleConfirmForward = useCallback(async (msg, ids) => forwardMessage && await forwardMessage(msg, ids), [forwardMessage]);
  const handleReply = useCallback((msg) => setReplyTo(msg), []);

  const isOwnMessage = (msg) => msg.senderId === authUser._id;
  const getReplyMessage = (msg) => msg.replyTo ? messages.find(m => m._id === msg.replyTo) : null;

  return (
    <>
      <ChatHeader />
      <div ref={scrollContainerRef} className="flex-1 px-3 md:px-6 overflow-y-auto py-4 md:py-6 hide-scrollbar">
        {messages.length > 0 && !isMessagesLoading ? (
          <motion.div className="max-w-3xl mx-auto space-y-4" variants={containerVariants} initial="hidden" animate="visible">
            <AnimatePresence mode="popLayout">
              {messages.map((msg) => {
                const replyMessage = getReplyMessage(msg);
                const hasReactions = msg.reactions && msg.reactions.length > 0;

                return (
                  <motion.div
                    key={msg._id}
                    layout
                    variants={messageVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className={`chat ${isOwnMessage(msg) ? "chat-end" : "chat-start"} ${hasReactions ? "mb-4" : ""}`}
                  >
                    <div className="relative inline-block max-w-[85%] md:max-w-[70%]">
                      <div
                        className={`chat-bubble cursor-pointer select-none transition-transform active:scale-[0.98] ${isOwnMessage(msg)
                          ? "bg-gradient-to-br from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/20"
                          : "bg-slate-800/90 text-slate-200 border border-slate-700/50"
                          }`}
                        onContextMenu={(e) => handleContextMenu(e, msg)}
                        onTouchStart={(e) => handleTouchStart(e, msg)}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                      >
                        {replyMessage && (
                          <div className={`flex items-start gap-1.5 mb-2 p-2 rounded-lg text-xs ${isOwnMessage(msg) ? "bg-white/10" : "bg-slate-700/50"}`}>
                            <CornerUpLeft className="w-3 h-3 mt-0.5 opacity-60" />
                            <p className="opacity-70 truncate">{replyMessage.text || "📷 Image"}</p>
                          </div>
                        )}
                        {msg.image && <img src={msg.image} alt="" className="rounded-lg h-32 md:h-40 w-auto object-cover pointer-events-none" />}
                        {msg.text && <p className="text-sm md:text-base break-words pointer-events-none">{msg.text}</p>}
                        <p className="text-xs mt-1 opacity-60 flex items-center gap-1 pointer-events-none">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          {msg.isEdited && <span className="italic"> (edited)</span>}
                          {/* Message status ticks: single=sent, double grey=delivered, double blue=read */}
                          {isOwnMessage(msg) && (
                            msg.isRead ? (
                              <CheckCheck className="w-3.5 h-3.5 ml-1 text-cyan-300" />
                            ) : msg.isDelivered ? (
                              <CheckCheck className="w-3.5 h-3.5 ml-1 text-white/50" />
                            ) : (
                              <Check className="w-3.5 h-3.5 ml-1 text-white/50" />
                            )
                          )}
                        </p>
                      </div>

                      {/* Floating reactions */}
                      {hasReactions && (
                        <motion.div
                          className={`absolute -bottom-3 ${isOwnMessage(msg) ? "right-1" : "left-1"}`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500 }}
                        >
                          <div className="flex items-center bg-slate-900/95 backdrop-blur rounded-full px-1.5 py-0.5 shadow-lg border border-slate-700/50">
                            {msg.reactions.slice(0, 4).map((r, i) => (
                              <span key={i} className="text-sm -mx-0.5">{r.emoji}</span>
                            ))}
                            {msg.reactions.length > 4 && <span className="text-[10px] text-slate-400 ml-1">+{msg.reactions.length - 4}</span>}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={messageEndRef} />
          </motion.div>
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser.fullName} />
        )}
      </div>

      <MessageInput replyTo={replyTo} onCancelReply={() => setReplyTo(null)} />

      <AnimatePresence>
        {contextMenu && (
          <MessageContextMenu
            message={contextMenu.message}
            position={contextMenu.position}
            onClose={closeContextMenu}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onReact={handleReact}
            onForward={handleForward}
            onReply={handleReply}
            isOwnMessage={contextMenu.message.senderId === authUser._id}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editModal && <EditMessageModal message={editModal} onSave={handleSaveEdit} onClose={() => setEditModal(null)} />}
      </AnimatePresence>

      <AnimatePresence>
        {deleteModal && <DeleteMessageModal message={deleteModal} onConfirm={handleConfirmDelete} onClose={() => setDeleteModal(null)} />}
      </AnimatePresence>

      <AnimatePresence>
        {forwardModal && <ForwardMessageModal message={forwardModal} onForward={handleConfirmForward} onClose={() => setForwardModal(null)} />}
      </AnimatePresence>
    </>
  );
}

export default ChatContainer;
