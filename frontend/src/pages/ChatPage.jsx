import { motion } from "framer-motion";
import { useChatStore } from "../store/useChatStore";

import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatsList from "../components/ChatsList";
import ContactList from "../components/ContactList";
import ChatContainer from "../components/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";

function ChatPage() {
  const { activeTab, selectedUser, showMobileSidebar } = useChatStore();

  return (
    <motion.div
      className="relative w-full max-w-6xl h-[100dvh] md:h-[800px]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <BorderAnimatedContainer>
        {/* LEFT SIDE - SIDEBAR */}
        <motion.div
          className={`
            ${showMobileSidebar ? 'flex' : 'hidden'} 
            md:flex
            w-full md:w-80 
            bg-slate-800/50 backdrop-blur-sm 
            flex-col
            absolute md:relative
            inset-0 md:inset-auto
            z-10
          `}
          initial={false}
          animate={{
            x: showMobileSidebar ? 0 : -320,
            opacity: showMobileSidebar ? 1 : 0
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <ProfileHeader />
          <ActiveTabSwitch />

          <div className="flex-1 overflow-y-auto p-4 space-y-2 hide-scrollbar">
            {activeTab === "chats" ? <ChatsList /> : <ContactList />}
          </div>
        </motion.div>

        {/* RIGHT SIDE - CHAT */}
        <motion.div
          className={`
            ${!showMobileSidebar ? 'flex' : 'hidden'} 
            md:flex
            flex-1 flex-col 
            bg-slate-900/50 backdrop-blur-sm
            w-full
          `}
          initial={false}
          animate={{
            x: !showMobileSidebar ? 0 : 320,
            opacity: !showMobileSidebar ? 1 : 0
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
        </motion.div>
      </BorderAnimatedContainer>
    </motion.div>
  );
}
export default ChatPage;
