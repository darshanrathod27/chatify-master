import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
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

function ChatContainer() {
  const {
    selectedUser, getMessagesByUserId, messages, isMessagesLoading,
    subscribeToMessages, unsubscribeFromMessages,
    editMessage, deleteMessage, reactToMessage, forwardMessage,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const chatContainerRef = useRef(null);

  const [contextMenu, setContextMenu] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [forwardModal, setForwardModal] = useState(null);
  const [replyTo, setReplyTo] = useState(null);

  const longPressTimer = useRef(null);
  const touchStartPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    getMessagesByUserId(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser, getMessagesByUserId, subscribeToMessages, unsubscribeFromMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messageEndRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
      if (isNearBottom) {
        messageEndRef.current.scrollIntoView({ behavior: "auto" });
      }
    }
  }, [messages]);

  // Handle keyboard open/close on mobile (iOS & Android)
  useEffect(() => {
    const scrollToBottom = () => {
      if (messageEndRef.current) {
        messageEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    };

    // Visual Viewport API for keyboard detection (works on iOS & Android)
    if (window.visualViewport) {
      const handleViewportResize = () => {
        // Small delay to let keyboard animation complete
        setTimeout(scrollToBottom, 100);
      };

      window.visualViewport.addEventListener('resize', handleViewportResize);
      return () => {
        window.visualViewport.removeEventListener('resize', handleViewportResize);
      };
    }
  }, []);

  const handleContextMenu = useCallback((e, msg) => {
    e.preventDefault();
    e.stopPropagation();
    // Find the bubble element (in case we clicked on a child)
    const bubbleEl = e.currentTarget;
    const bubbleRect = bubbleEl.getBoundingClientRect();
    const isOwn = msg.senderId === authUser._id;

    // Get the chat container bounds for proper positioning on desktop
    const containerRect = chatContainerRef.current?.getBoundingClientRect();

    setContextMenu({
      message: msg,
      position: {
        x: isOwn ? bubbleRect.left : bubbleRect.right,
        y: bubbleRect.top + bubbleRect.height / 2,
        bubbleRect,
        containerRect,
        isOwn
      }
    });
  }, [authUser._id]);

  const handleTouchStart = useCallback((e, msg) => {
    touchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    const bubbleEl = e.currentTarget;
    const bubbleRect = bubbleEl.getBoundingClientRect();
    const isOwn = msg.senderId === authUser._id;

    // Get the chat container bounds for proper positioning on desktop
    const containerRect = chatContainerRef.current?.getBoundingClientRect();

    longPressTimer.current = setTimeout(() => {
      setContextMenu({
        message: msg,
        position: {
          x: isOwn ? bubbleRect.left : bubbleRect.right,
          y: bubbleRect.top + bubbleRect.height / 2,
          bubbleRect,
          containerRect,
          isOwn
        }
      });
      if (navigator.vibrate) navigator.vibrate(50);
    }, 400);
  }, [authUser._id]);

  const handleTouchMove = useCallback((e) => {
    const dx = Math.abs(e.touches[0].clientX - touchStartPos.current.x);
    const dy = Math.abs(e.touches[0].clientY - touchStartPos.current.y);
    if (dx > 10 || dy > 10) {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
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
    <div ref={chatContainerRef} className="flex flex-col h-full w-full relative">
      <ChatHeader />
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto py-4 px-4 md:px-8 hide-scrollbar bg-slate-900/30 chat-messages-container">
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-4xl mx-auto flex flex-col gap-2">
            {messages.map((msg) => {
              const replyMessage = getReplyMessage(msg);
              const hasReactions = msg.reactions && msg.reactions.length > 0;
              const isOwn = isOwnMessage(msg);

              return (
                <div
                  key={msg._id}
                  className={`flex w-full ${isOwn ? "justify-end" : "justify-start"} ${hasReactions ? "mb-4" : ""}`}
                >
                  {/* Message bubble container */}
                  <div
                    className={`relative inline-block`}
                    style={{ maxWidth: "75%" }}
                  >
                    {/* Bubble */}
                    <div
                      className={`inline-block px-4 py-2.5 rounded-2xl cursor-pointer select-none shadow-md ${isOwn
                        ? "bg-gradient-to-br from-cyan-500 to-cyan-600 text-white rounded-br-sm"
                        : "bg-slate-800 text-slate-100 border border-slate-700/50 rounded-bl-sm"
                        }`}
                      style={{ minWidth: "60px" }}
                      onContextMenu={(e) => handleContextMenu(e, msg)}
                      onTouchStart={(e) => handleTouchStart(e, msg)}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                    >
                      {/* Reply preview */}
                      {replyMessage && (
                        <div className={`mb-2 p-2 rounded-lg text-xs border-l-2 ${isOwn ? "bg-white/10 border-white/30" : "bg-slate-700/50 border-cyan-400"
                          }`}>
                          <p className="opacity-80 line-clamp-1">{replyMessage.text || "📷 Image"}</p>
                        </div>
                      )}

                      {/* Image */}
                      {msg.image && (
                        <img
                          src={msg.image}
                          alt=""
                          className="rounded-lg max-h-52 w-auto object-cover mb-2 max-w-full"
                        />
                      )}

                      {/* Message text - IMPORTANT: display inline to prevent vertical stacking */}
                      {msg.text && (
                        <p className="text-sm md:text-base leading-relaxed" style={{ wordBreak: "break-word" }}>
                          {msg.text}
                        </p>
                      )}

                      {/* Timestamp and status */}
                      <div className={`flex items-center gap-1.5 mt-1.5 ${isOwn ? "justify-end" : "justify-start"}`}>
                        <span className="text-[11px] opacity-60">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {msg.isEdited && <span className="text-[10px] opacity-50 italic">(edited)</span>}
                        {isOwn && (
                          msg.isRead ? (
                            <CheckCheck className="w-4 h-4 text-cyan-200" />
                          ) : msg.isDelivered ? (
                            <CheckCheck className="w-4 h-4 opacity-60" />
                          ) : (
                            <Check className="w-4 h-4 opacity-60" />
                          )
                        )}
                      </div>
                    </div>

                    {/* Floating reactions */}
                    {hasReactions && (
                      <div className={`absolute -bottom-3 ${isOwn ? "right-2" : "left-2"} z-10`}>
                        <div className="flex items-center bg-slate-900/95 backdrop-blur-sm rounded-full px-2 py-1 shadow-lg border border-slate-700/50">
                          {msg.reactions.slice(0, 4).map((r, i) => (
                            <span key={i} className="text-sm">{r.emoji}</span>
                          ))}
                          {msg.reactions.length > 4 && (
                            <span className="text-[10px] text-slate-400 ml-1">+{msg.reactions.length - 4}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messageEndRef} />
          </div>
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser.fullName} />
        )}
      </div>

      <MessageInput replyTo={replyTo} onCancelReply={() => setReplyTo(null)} />

      {/* Portal renders context menu and modals at body level to escape overflow:hidden */}
      {createPortal(
        <>
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
        </>,
        document.body
      )}
    </div>
  );
}

export default ChatContainer;
