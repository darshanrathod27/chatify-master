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

const messageVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 30
    }
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
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

  // Long press detection
  const longPressTimer = useRef(null);
  const touchStartPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    getMessagesByUserId(selectedUser._id);
    subscribeToMessages();

    // clean up
    return () => unsubscribeFromMessages();
  }, [selectedUser, getMessagesByUserId, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle right-click (desktop)
  const handleContextMenu = useCallback((e, msg) => {
    e.preventDefault();
    setContextMenu({
      message: msg,
      position: { x: e.clientX, y: e.clientY },
    });
  }, []);

  // Handle long press start (mobile)
  const handleTouchStart = useCallback((e, msg) => {
    touchStartPos.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };

    longPressTimer.current = setTimeout(() => {
      setContextMenu({
        message: msg,
        position: {
          x: touchStartPos.current.x,
          y: touchStartPos.current.y,
        },
      });
      // Vibrate for haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500); // 500ms long press
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

  // Handle touch end (cancel long press)
  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  // Close context menu
  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  // Handle edit
  const handleEdit = useCallback((msg) => {
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
    if (reactToMessage) {
      await reactToMessage(msg._id, emoji);
    }
  }, [reactToMessage]);

  // Handle forward
  const handleForward = useCallback((msg) => {
    setForwardModal(msg);
  }, []);

  // Handle confirm forward
  const handleConfirmForward = useCallback(async (msg, userIds) => {
    if (forwardMessage) {
      await forwardMessage(msg, userIds);
    }
  }, [forwardMessage]);

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
            {messages.map((msg, index) => (
              <motion.div
                key={msg._id}
                variants={messageVariants}
                className={`chat ${msg.senderId === authUser._id ? "chat-end" : "chat-start"}`}
                onContextMenu={(e) => handleContextMenu(e, msg)}
                onTouchStart={(e) => handleTouchStart(e, msg)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <motion.div
                  className={`chat-bubble relative max-w-[85%] md:max-w-[70%] ${msg.senderId === authUser._id
                    ? "bg-gradient-to-br from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/20"
                    : "bg-slate-800/80 text-slate-200 border border-slate-700/50"
                    }`}
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {msg.image && (
                    <motion.img
                      src={msg.image}
                      alt="Shared"
                      className="rounded-lg h-32 md:h-48 w-auto object-cover"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                  {msg.text && (
                    <p className="mt-2 text-sm md:text-base break-words">
                      {msg.text}
                    </p>
                  )}

                  {/* Emoji reactions display */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {msg.reactions.map((reaction, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-slate-900/50 rounded-full px-1.5 py-0.5"
                        >
                          {reaction.emoji}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-xs mt-1 opacity-70 flex items-center gap-1">
                    {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {msg.isEdited && (
                      <span className="italic"> (edited)</span>
                    )}
                  </p>
                </motion.div>
              </motion.div>
            ))}
            {/* 👇 scroll target */}
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
            isOwnMessage={contextMenu.message.senderId === authUser._id}
          />
        )}
      </AnimatePresence>

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
