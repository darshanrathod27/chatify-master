import { ArrowLeftIcon, XIcon, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore } from "../store/useChatStore";
import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";

function ChatHeader() {
  const { selectedUser, setSelectedUser, setShowMobileSidebar, typingUsers, viewingUsers } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const isOnline = onlineUsers.includes(selectedUser._id);
  const isTyping = typingUsers[selectedUser._id];
  const isViewingChat = viewingUsers[selectedUser._id];

  const handleBackToSidebar = () => {
    setShowMobileSidebar(true);
    setSelectedUser(null);
  };

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        handleBackToSidebar();
      }
    };

    window.addEventListener("keydown", handleEscKey);

    // cleanup function
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [setSelectedUser, setShowMobileSidebar]);

  // Get status text
  const getStatusText = () => {
    if (isTyping) return "typing...";
    if (isViewingChat) return "viewing chat";
    if (isOnline) return "Online";
    return "Offline";
  };

  const getStatusColor = () => {
    if (isTyping) return "text-cyan-400";
    if (isViewingChat) return "text-purple-400";
    if (isOnline) return "text-green-400";
    return "text-slate-400";
  };

  return (
    <motion.div
      className="flex justify-between items-center bg-slate-800/50 border-b
        border-slate-700/50 px-4 md:px-6 py-4"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center space-x-3">
        {/* Back Button - Mobile Only */}
        <motion.button
          onClick={handleBackToSidebar}
          className="md:hidden p-2 -ml-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-full transition-colors"
          whileTap={{ scale: 0.9 }}
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </motion.button>

        {/* Avatar */}
        <motion.div
          className={`avatar ${isOnline ? "online" : "offline"}`}
          whileHover={{ scale: 1.05 }}
        >
          <div className="w-10 md:w-12 rounded-full ring-2 ring-slate-700/50">
            <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
          </div>
        </motion.div>

        <div>
          <h3 className="text-slate-200 font-medium text-sm md:text-base">{selectedUser.fullName}</h3>

          {/* Typing/Viewing/Online Status */}
          <AnimatePresence mode="wait">
            <motion.div
              key={getStatusText()}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.15 }}
              className={`text-xs flex items-center gap-1 ${getStatusColor()}`}
            >
              {isTyping && (
                <span className="flex gap-0.5 mr-1">
                  <motion.span
                    className="w-1 h-1 bg-cyan-400 rounded-full"
                    animate={{ y: [0, -2, 0] }}
                    transition={{ repeat: Infinity, duration: 0.5, delay: 0 }}
                  />
                  <motion.span
                    className="w-1 h-1 bg-cyan-400 rounded-full"
                    animate={{ y: [0, -2, 0] }}
                    transition={{ repeat: Infinity, duration: 0.5, delay: 0.1 }}
                  />
                  <motion.span
                    className="w-1 h-1 bg-cyan-400 rounded-full"
                    animate={{ y: [0, -2, 0] }}
                    transition={{ repeat: Infinity, duration: 0.5, delay: 0.2 }}
                  />
                </span>
              )}
              {isViewingChat && !isTyping && (
                <Eye className="w-3 h-3 mr-0.5" />
              )}
              {getStatusText()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Close Button - Desktop Only */}
      <motion.button
        onClick={handleBackToSidebar}
        className="hidden md:block p-2 hover:bg-slate-700/50 rounded-full transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <XIcon className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors" />
      </motion.button>
    </motion.div>
  );
}
export default ChatHeader;
