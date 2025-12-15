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
import { CheckCheck } from "lucide-react";

// Enhanced message animation variants
const messageVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    x: 50,
    transition: { duration: 0.2 }
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

// Reaction popup animation
const reactionPopupVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 15
    }
  }
};

function ChatContainer() {
  const {
    selectedUser,
    getMessagesByUserId,
    messages,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
    editMessage,
    deleteMessage,
    reactToMessage,
    forwardMessage,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Context menu state
  const [contextMenu, setContextMenu] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [forwardModal, setForwardModal] = useState(null);

  // Double tap detection
  const [lastTap, setLastTap] = useState({ time: 0, messageId: null });
  const [showReadAnimation, setShowReadAnimation] = useState(null);

  // Long press detection
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

  // Handle double tap to mark as read
  const handleDoubleTap = useCallback((msg) => {
    const now = Date.now();
    if (lastTap.messageId === msg._id && now - lastTap.time < 300) {
      setShowReadAnimation(msg._id);
      setTimeout(() => setShowReadAnimation(null), 1000);
    }
    setLastTap({ time: now, messageId: msg._id });
  }, [lastTap]);

  // Handle right-click (desktop)
  const handleContextMenu = useCallback((e, msg) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Context menu triggered for message:", msg._id);
    setContextMenu({
      message: msg,
      position: { x: e.clientX, y: e.clientY },
    });
  }, []);

  // Handle long press start (mobile)
  const handleTouchStart = useCallback((e, msg) => {
    isLongPress.current = false;
    touchStartPos.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };

    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      console.log("Long press triggered for message:", msg._id);
      setContextMenu({
        message: msg,
        position: {
          x: touchStartPos.current.x,
          y: touchStartPos.current.y,
        },
      });
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500);
  }, []);

  // Handle touch move (cancel long press if moved)
  const handleTouchMove = useCallback((e) => {
    const moveThreshold = 10;
    const deltaX = Math.abs(e.touches[0].clientX - touchStartPos.current.x);
    const deltaY = Math.abs(e.touches[0].clientY - touchStartPos.current.y);

    if (deltaX > moveThreshold || deltaY > moveThreshold) {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }
  }, []);

  // Handle touch end
  const handleTouchEnd = useCallback((e, msg) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    // Only handle double tap if it wasn't a long press
    if (!isLongPress.current) {
      handleDoubleTap(msg);
    }
    isLongPress.current = false;
  }, [handleDoubleTap]);

  // Close context menu
  const closeContextMenu = useCallback(() => {
    console.log("Closing context menu");
    setContextMenu(null);
  }, []);

  // Handle edit
  const handleEdit = useCallback((msg) => {
    console.log("Edit clicked for:", msg._id);
    setEditModal(msg);
  }, []);

  // Handle save edit
  const handleSaveEdit = useCallback(async (messageId, newText) => {
    if (editMessage) {
      await editMessage(messageId, newText);
    }
  }, [editMessage]);

  // Handle delete
  const handleDelete = useCallback((msg) => {
    console.log("Delete clicked for:", msg._id);
    setDeleteModal(msg);
  }, []);

  // Handle confirm delete
  const handleConfirmDelete = useCallback(async (messageId) => {
    if (deleteMessage) {
      await deleteMessage(messageId);
    }
  }, [deleteMessage]);

  // Handle react
  const handleReact = useCallback(async (msg, emoji) => {
    console.log("React clicked:", emoji, "for:", msg._id);
    if (reactToMessage) {
      await reactToMessage(msg._id, emoji);
    }
  }, [reactToMessage]);

  // Handle forward
  const handleForward = useCallback((msg) => {
    console.log("Forward clicked for:", msg._id);
    setForwardModal(msg);
  }, []);

  // Handle confirm forward
  const handleConfirmForward = useCallback(async (msg, userIds) => {
    if (forwardMessage) {
      await forwardMessage(msg, userIds);
    }
  }, [forwardMessage]);

  const isOwnMessage = (msg) => msg.senderId === authUser._id;

  return (
    <>
      <ChatHeader />
      <div
        ref={scrollContainerRef}
        className="flex-1 px-3 md:px-6 overflow-y-auto py-4 md:py-8 hide-scrollbar"
      >
        {messages.length > 0 && !isMessagesLoading ? (
          <motion.div
            className="max-w-3xl mx-auto space-y-4 md:space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence mode="popLayout">
              {messages.map((msg) => (
                <motion.div
                  key={msg._id}
                  layout
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className={`chat ${isOwnMessage(msg) ? "chat-end" : "chat-start"}`}
                >
                  {/* Message bubble with event handlers */}
                  <div
                    className={`chat-bubble relative max-w-[85%] md:max-w-[70%] cursor-pointer select-none transition-transform active:scale-95 ${isOwnMessage(msg)
                        ? "bg-gradient-to-br from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/20"
                        : "bg-slate-800/80 text-slate-200 border border-slate-700/50"
                      }`}
                    onContextMenu={(e) => handleContextMenu(e, msg)}
                    onTouchStart={(e) => handleTouchStart(e, msg)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={(e) => handleTouchEnd(e, msg)}
                    onDoubleClick={() => handleDoubleTap(msg)}
                  >
                    {/* Double tap read animation overlay */}
                    <AnimatePresence>
                      {showReadAnimation === msg._id && (
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-2xl z-10 pointer-events-none"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1.5, rotate: 0 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <CheckCheck className="w-12 h-12 text-cyan-400" />
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {msg.image && (
                      <motion.img
                        src={msg.image}
                        alt="Shared"
                        className="rounded-lg h-32 md:h-48 w-auto object-cover pointer-events-none"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                      />
                    )}
                    {msg.text && (
                      <p className="mt-2 text-sm md:text-base break-words pointer-events-none">
                        {msg.text}
                      </p>
                    )}

                    {/* Emoji reactions display */}
                    <AnimatePresence>
                      {msg.reactions && msg.reactions.length > 0 && (
                        <motion.div
                          className="flex flex-wrap gap-1 mt-2 pointer-events-none"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          {msg.reactions.map((reaction, idx) => (
                            <motion.span
                              key={idx}
                              className="text-sm bg-slate-900/50 rounded-full px-2 py-0.5"
                              variants={reactionPopupVariants}
                              initial="hidden"
                              animate="visible"
                            >
                              {reaction.emoji}
                            </motion.span>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <p className="text-xs mt-1 opacity-70 flex items-center gap-1 pointer-events-none">
                      {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {msg.isEdited && (
                        <span className="italic"> (edited)</span>
                      )}
                      {isOwnMessage(msg) && (
                        <CheckCheck className="w-3.5 h-3.5 ml-1 text-white/70" />
                      )}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messageEndRef} />
          </motion.div>
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser.fullName} />
        )}
      </div>

      <MessageInput />

      {/* Context Menu */}
      {contextMenu && (
        <MessageContextMenu
          message={contextMenu.message}
          position={contextMenu.position}
          onClose={closeContextMenu}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onReact={handleReact}
          onForward={handleForward}
          isOwnMessage={contextMenu.message.senderId === authUser._id}
        />
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editModal && (
          <EditMessageModal
            message={editModal}
            onSave={handleSaveEdit}
            onClose={() => setEditModal(null)}
          />
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteModal && (
          <DeleteMessageModal
            message={deleteModal}
            onConfirm={handleConfirmDelete}
            onClose={() => setDeleteModal(null)}
          />
        )}
      </AnimatePresence>

      {/* Forward Modal */}
      <AnimatePresence>
        {forwardModal && (
          <ForwardMessageModal
            message={forwardModal}
            onForward={handleConfirmForward}
            onClose={() => setForwardModal(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default ChatContainer;
