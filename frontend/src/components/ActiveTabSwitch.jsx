import { motion } from "framer-motion";
import { useChatStore } from "../store/useChatStore";

function ActiveTabSwitch() {
  const { activeTab, setActiveTab } = useChatStore();

  return (
    <div className="tabs tabs-boxed bg-slate-800/30 p-1.5 m-3 md:m-4 rounded-xl border border-slate-700/30">
      <motion.button
        onClick={() => setActiveTab("chats")}
        className={`tab flex-1 rounded-lg text-sm md:text-base font-medium transition-all duration-200 ${activeTab === "chats"
            ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/20"
            : "text-slate-400 hover:text-slate-200"
          }`}
        whileTap={{ scale: 0.98 }}
      >
        Chats
      </motion.button>

      <motion.button
        onClick={() => setActiveTab("contacts")}
        className={`tab flex-1 rounded-lg text-sm md:text-base font-medium transition-all duration-200 ${activeTab === "contacts"
            ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/20"
            : "text-slate-400 hover:text-slate-200"
          }`}
        whileTap={{ scale: 0.98 }}
      >
        Contacts
      </motion.button>
    </div>
  );
}
export default ActiveTabSwitch;
