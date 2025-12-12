import { motion } from "framer-motion";
import { LoaderIcon, MessageCircleIcon } from "lucide-react";

function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center h-screen min-h-[100dvh] bg-slate-900">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />
      <div className="absolute top-0 -left-4 size-72 md:size-96 bg-pink-500 opacity-20 blur-[100px]" />
      <div className="absolute bottom-0 -right-4 size-72 md:size-96 bg-cyan-500 opacity-20 blur-[100px]" />

      <motion.div
        className="relative z-10 flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/20"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <MessageCircleIcon className="w-8 h-8 text-white" />
        </motion.div>

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <LoaderIcon className="size-6 text-cyan-400" />
        </motion.div>

        <motion.p
          className="mt-4 text-slate-400 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Loading Chatify...
        </motion.p>
      </motion.div>
    </div>
  );
}
export default PageLoader;
