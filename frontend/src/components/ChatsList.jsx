import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import { useAuthStore } from "../store/useAuthStore";

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 30
    }
  }
};

function ChatsList() {
  const { getMyChatPartners, chats, isUsersLoading, setSelectedUser, unreadCounts, typingUsers } = useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (chats.length === 0) return <NoChatsFound />;

  return (
    <motion.div
      variants={listVariants}
      initial="hidden"
      animate="visible"
      className="space-y-2"
    >
      {chats.map((chat) => {
        const isOnline = onlineUsers.includes(chat._id);
        const unreadCount = unreadCounts[chat._id] || chat.unreadCount || 0;
        const isTyping = typingUsers[chat._id];

        return (
          <motion.div
            key={chat._id}
            variants={itemVariants}
            className="bg-cyan-500/10 p-3 md:p-4 rounded-xl cursor-pointer hover:bg-cyan-500/20 transition-all duration-200 border border-transparent hover:border-cyan-500/30"
            onClick={() => setSelectedUser(chat)}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              {/* Avatar with online indicator */}
              <div className="relative">
                <div className={`avatar ${isOnline ? "online" : "offline"}`}>
                  <div className="size-10 md:size-12 rounded-full ring-2 ring-slate-700/50">
                    <img src={chat.profilePic || "/avatar.png"} alt={chat.fullName} />
                  </div>
                </div>
              </div>

              {/* Name and status */}
              <div className="flex-1 min-w-0">
                <h4 className="text-slate-200 font-medium text-sm md:text-base truncate">{chat.fullName}</h4>

                {/* Typing indicator or online status */}
                {isTyping ? (
                  <motion.p
                    className="text-xs text-cyan-400 flex items-center gap-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <span className="flex gap-0.5">
                      <motion.span
                        className="w-1 h-1 bg-cyan-400 rounded-full"
                        animate={{ y: [0, -3, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                      />
                      <motion.span
                        className="w-1 h-1 bg-cyan-400 rounded-full"
                        animate={{ y: [0, -3, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }}
                      />
                      <motion.span
                        className="w-1 h-1 bg-cyan-400 rounded-full"
                        animate={{ y: [0, -3, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }}
                      />
                    </span>
                    typing...
                  </motion.p>
                ) : (
                  <p className={`text-xs ${isOnline ? 'text-green-400' : 'text-slate-500'}`}>
                    {isOnline ? 'Online' : 'Offline'}
                  </p>
                )}
              </div>

              {/* Unread count badge */}
              <AnimatePresence>
                {unreadCount > 0 && (
                  <motion.div
                    className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 shadow-lg shadow-cyan-500/30"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
export default ChatsList;
