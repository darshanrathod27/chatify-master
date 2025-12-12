import { motion } from "framer-motion";
import { MessageCircleIcon, SparklesIcon } from "lucide-react";

const NoConversationPlaceholder = () => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full text-center p-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="size-20 md:size-24 bg-gradient-to-br from-cyan-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mb-6 border border-cyan-500/20"
        animate={{
          boxShadow: [
            "0 0 20px rgba(6, 182, 212, 0.1)",
            "0 0 40px rgba(6, 182, 212, 0.2)",
            "0 0 20px rgba(6, 182, 212, 0.1)"
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <MessageCircleIcon className="size-10 md:size-12 text-cyan-400" />
      </motion.div>

      <motion.h3
        className="text-xl md:text-2xl font-semibold text-slate-200 mb-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        Select a conversation
      </motion.h3>

      <motion.p
        className="text-slate-400 max-w-sm text-sm md:text-base"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Choose a contact from the sidebar to start chatting or continue a previous conversation.
      </motion.p>

      <motion.div
        className="mt-6 flex items-center gap-2 text-xs text-slate-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <SparklesIcon className="w-4 h-4" />
        <span>Your messages are end-to-end encrypted</span>
      </motion.div>
    </motion.div>
  );
};

export default NoConversationPlaceholder;
