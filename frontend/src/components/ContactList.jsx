import { useEffect } from "react";
import { motion } from "framer-motion";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
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

function ContactList() {
  const { getAllContacts, allContacts, setSelectedUser, isUsersLoading } = useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;

  return (
    <motion.div
      variants={listVariants}
      initial="hidden"
      animate="visible"
      className="space-y-2"
    >
      {allContacts.map((contact) => (
        <motion.div
          key={contact._id}
          variants={itemVariants}
          className="bg-cyan-500/10 p-3 md:p-4 rounded-xl cursor-pointer hover:bg-cyan-500/20 transition-all duration-200 border border-transparent hover:border-cyan-500/30"
          onClick={() => setSelectedUser(contact)}
          whileHover={{ scale: 1.02, x: 4 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-3">
            <div className={`avatar ${onlineUsers.includes(contact._id) ? "online" : "offline"}`}>
              <div className="size-10 md:size-12 rounded-full ring-2 ring-slate-700/50">
                <img src={contact.profilePic || "/avatar.png"} alt={contact.fullName} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-slate-200 font-medium text-sm md:text-base truncate">{contact.fullName}</h4>
              <p className={`text-xs ${onlineUsers.includes(contact._id) ? 'text-green-400' : 'text-slate-500'}`}>
                {onlineUsers.includes(contact._id) ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
export default ContactList;
