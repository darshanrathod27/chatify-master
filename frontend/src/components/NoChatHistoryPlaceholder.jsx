import { motion } from "framer-motion";
import { MessageCircleIcon, SendIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

const quickMessages = [
  { emoji: "👋", text: "Say Hello" },
  { emoji: "🤝", text: "How are you?" },
  { emoji: "📅", text: "Meet up soon?" }
];

const NoChatHistoryPlaceholder = ({ name }) => {
  const { sendMessage } = useChatStore();

  const handleQuickMessage = (emoji, text) => {
    sendMessage({ text: `${emoji} ${text}`, image: null });
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full text-center p-4 md:p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-cyan-500/20 to-cyan-400/10 rounded-2xl flex items-center justify-center mb-4 md:mb-5 border border-cyan-500/20"
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <MessageCircleIcon className="size-7 md:size-8 text-cyan-400" />
      </motion.div>

      <motion.h3
        className="text-base md:text-lg font-medium text-slate-200 mb-2 md:mb-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        Start your conversation with <span className="text-cyan-400">{name}</span>
      </motion.h3>

      <motion.div
        className="flex flex-col space-y-3 max-w-md mb-4 md:mb-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-slate-400 text-xs md:text-sm">
          This is the beginning of your conversation. Send a message to start chatting!
        </p>
        <div className="h-px w-32 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent mx-auto"></div>
      </motion.div>

      <motion.div
        className="flex flex-wrap gap-2 justify-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {quickMessages.map((msg, index) => (
          <motion.button
            key={msg.text}
            className="px-3 md:px-4 py-2 text-xs font-medium text-cyan-400 bg-cyan-500/10 rounded-full hover:bg-cyan-500/20 transition-all duration-200 border border-transparent hover:border-cyan-500/30 flex items-center gap-1"
            onClick={() => handleQuickMessage(msg.emoji, msg.text)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
          >
            <span>{msg.emoji}</span>
            <span className="hidden sm:inline">{msg.text}</span>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default NoChatHistoryPlaceholder;
