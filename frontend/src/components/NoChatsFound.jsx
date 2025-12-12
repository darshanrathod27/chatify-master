import { motion } from "framer-motion";
import { MessageCircleIcon, UsersIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

function NoChatsFound() {
  const { setActiveTab } = useChatStore();

  return (
    <motion.div
      className="flex flex-col items-center justify-center py-8 md:py-10 text-center space-y-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-cyan-500/20 to-cyan-400/10 rounded-2xl flex items-center justify-center border border-cyan-500/20"
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <MessageCircleIcon className="w-7 h-7 md:w-8 md:h-8 text-cyan-400" />
      </motion.div>

      <div>
        <h4 className="text-slate-200 font-medium mb-1 text-sm md:text-base">No conversations yet</h4>
        <p className="text-slate-400 text-xs md:text-sm px-4 md:px-6">
          Start a new chat by selecting a contact from the contacts tab
        </p>
      </div>

      <motion.button
        onClick={() => setActiveTab("contacts")}
        className="px-4 py-2 text-sm text-cyan-400 bg-gradient-to-r from-cyan-500/10 to-cyan-400/10 rounded-xl hover:from-cyan-500/20 hover:to-cyan-400/20 transition-all duration-200 flex items-center gap-2 border border-cyan-500/20 hover:border-cyan-500/40"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <UsersIcon className="w-4 h-4" />
        Find contacts
      </motion.button>
    </motion.div>
  );
}
export default NoChatsFound;
