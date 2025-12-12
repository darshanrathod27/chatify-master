import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";

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
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const scrollContainerRef = useRef(null);

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
                  {msg.text && <p className="mt-2 text-sm md:text-base break-words">{msg.text}</p>}
                  <p className="text-xs mt-1 opacity-70 flex items-center gap-1">
                    {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
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
    </>
  );
}

export default ChatContainer;
