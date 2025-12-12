import { ArrowLeftIcon, XIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useChatStore } from "../store/useChatStore";
import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";

function ChatHeader() {
  const { selectedUser, setSelectedUser, setShowMobileSidebar } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const isOnline = onlineUsers.includes(selectedUser._id);

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
          <p className={`text-xs ${isOnline ? 'text-green-400' : 'text-slate-400'}`}>
            {isOnline ? "Online" : "Offline"}
          </p>
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
