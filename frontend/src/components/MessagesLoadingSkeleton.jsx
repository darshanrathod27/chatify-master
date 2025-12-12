import { motion } from "framer-motion";

function MessagesLoadingSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-4 md:space-y-6">
      {[...Array(5)].map((_, index) => (
        <motion.div
          key={index}
          className={`chat ${index % 2 === 0 ? "chat-start" : "chat-end"}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08 }}
        >
          <div
            className={`chat-bubble animate-pulse ${index % 2 === 0 ? "bg-slate-800/60" : "bg-cyan-600/30"
              }`}
            style={{
              width: `${Math.floor(Math.random() * 60 + 60)}px`,
              height: "40px"
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}
export default MessagesLoadingSkeleton;
