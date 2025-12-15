import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Trash2, Forward, Smile, X, Check, CheckCheck } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

// Popular emoji reactions
const EMOJI_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🔥", "👏"];

// Animation variants
const menuVariants = {
    hidden: {
        opacity: 0,
        scale: 0.8,
        y: -10,
        filter: "blur(4px)"
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        filter: "blur(0px)",
        transition: {
            type: "spring",
            stiffness: 400,
            damping: 25,
            staggerChildren: 0.05
        }
    },
    exit: {
        opacity: 0,
        scale: 0.8,
        y: -10,
        filter: "blur(4px)",
        transition: { duration: 0.15 }
    }
};

const menuItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { type: "spring", stiffness: 300 }
    }
};

const emojiVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: (i) => ({
        scale: 1,
        rotate: 0,
        transition: {
            type: "spring",
            stiffness: 400,
            delay: i * 0.03
        }
    })
};

function MessageContextMenu({
    message,
    position,
    onClose,
    onEdit,
    onDelete,
    onReact,
    onForward,
    isOwnMessage,
}) {
    const menuRef = useRef(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [activeButton, setActiveButton] = useState(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [onClose]);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [onClose]);

    const handleButtonClick = (action, label) => {
        setActiveButton(label);
        // Small delay for visual feedback
        setTimeout(() => {
            action();
        }, 150);
    };

    const menuItems = [
        ...(isOwnMessage
            ? [
                {
                    icon: Pencil,
                    label: "Edit",
                    onClick: () => {
                        handleButtonClick(() => {
                            onEdit(message);
                            onClose();
                        }, "Edit");
                    },
                    color: "text-cyan-400",
                    hoverBg: "hover:bg-cyan-500/20",
                    activeBg: "bg-cyan-500/30",
                },
                {
                    icon: Trash2,
                    label: "Delete",
                    onClick: () => {
                        handleButtonClick(() => {
                            onDelete(message);
                            onClose();
                        }, "Delete");
                    },
                    color: "text-red-400",
                    hoverBg: "hover:bg-red-500/20",
                    activeBg: "bg-red-500/30",
                },
            ]
            : []),
        {
            icon: Smile,
            label: "React",
            onClick: () => {
                setActiveButton("React");
                setShowEmojiPicker(!showEmojiPicker);
            },
            color: "text-yellow-400",
            hoverBg: "hover:bg-yellow-500/20",
            activeBg: "bg-yellow-500/30",
        },
        {
            icon: Forward,
            label: "Forward",
            onClick: () => {
                handleButtonClick(() => {
                    onForward(message);
                    onClose();
                }, "Forward");
            },
            color: "text-green-400",
            hoverBg: "hover:bg-green-500/20",
            activeBg: "bg-green-500/30",
        },
    ];

    return (
        <AnimatePresence>
            <motion.div
                ref={menuRef}
                className="fixed z-50 bg-slate-800/95 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden"
                style={{
                    top: Math.min(position.y, window.innerHeight - 280),
                    left: Math.min(position.x, window.innerWidth - 180),
                }}
                variants={menuVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
            >
                {/* Emoji picker */}
                <AnimatePresence>
                    {showEmojiPicker && (
                        <motion.div
                            className="flex gap-1 p-3 border-b border-slate-700/50 flex-wrap max-w-[220px] justify-center"
                            initial={{ height: 0, opacity: 0, padding: 0 }}
                            animate={{ height: "auto", opacity: 1, padding: "12px" }}
                            exit={{ height: 0, opacity: 0, padding: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        >
                            {EMOJI_REACTIONS.map((emoji, i) => (
                                <motion.button
                                    key={emoji}
                                    className="text-2xl p-2 hover:bg-slate-700/50 rounded-xl transition-colors active:scale-90"
                                    onClick={() => {
                                        onReact(message, emoji);
                                        onClose();
                                    }}
                                    custom={i}
                                    variants={emojiVariants}
                                    initial="hidden"
                                    animate="visible"
                                    whileHover={{
                                        scale: 1.3,
                                        rotate: [0, -10, 10, 0],
                                        transition: { duration: 0.3 }
                                    }}
                                    whileTap={{ scale: 0.8 }}
                                >
                                    {emoji}
                                </motion.button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Menu items */}
                <motion.div
                    className="p-2"
                    variants={menuVariants}
                >
                    {menuItems.map((item, index) => (
                        <motion.button
                            key={item.label}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition-all duration-200 ${activeButton === item.label
                                    ? `${item.activeBg} ${item.color}`
                                    : `text-slate-200 ${item.hoverBg}`
                                }`}
                            onClick={item.onClick}
                            variants={menuItemVariants}
                            whileHover={{
                                x: 6,
                                backgroundColor: "rgba(255,255,255,0.05)",
                                transition: { duration: 0.2 }
                            }}
                            whileTap={{
                                scale: 0.95,
                                transition: { duration: 0.1 }
                            }}
                        >
                            <motion.div
                                animate={activeButton === item.label ? {
                                    rotate: [0, -10, 10, 0],
                                    scale: [1, 1.2, 1]
                                } : {}}
                                transition={{ duration: 0.3 }}
                            >
                                <item.icon className={`w-5 h-5 ${item.color}`} />
                            </motion.div>
                            <span className="font-medium">{item.label}</span>

                            {/* Active indicator */}
                            {activeButton === item.label && (
                                <motion.div
                                    className={`ml-auto w-2 h-2 rounded-full ${item.color.replace('text-', 'bg-')}`}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 500 }}
                                />
                            )}
                        </motion.button>
                    ))}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// Edit Message Modal Component
export function EditMessageModal({ message, onSave, onClose }) {
    const [text, setText] = useState(message?.text || "");
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSave = () => {
        if (text.trim() && text !== message.text) {
            onSave(message._id, text.trim());
        }
        onClose();
    };

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-6 w-full max-w-md shadow-2xl"
                initial={{ scale: 0.8, y: 50, rotateX: -15 }}
                animate={{ scale: 1, y: 0, rotateX: 0 }}
                exit={{ scale: 0.8, y: 50, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                onClick={(e) => e.stopPropagation()}
            >
                <motion.h3
                    className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Pencil className="w-5 h-5 text-cyan-400" />
                    Edit Message
                </motion.h3>

                <motion.textarea
                    ref={inputRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300"
                    rows={3}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSave();
                        }
                    }}
                />

                <motion.div
                    className="flex justify-end gap-3 mt-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <motion.button
                        className="px-5 py-2.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-xl transition-all duration-200 flex items-center gap-2"
                        onClick={onClose}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <X className="w-4 h-4" />
                        Cancel
                    </motion.button>
                    <motion.button
                        className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg shadow-cyan-500/25"
                        onClick={handleSave}
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Check className="w-4 h-4" />
                        Save
                    </motion.button>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}

// Delete Confirmation Modal
export function DeleteMessageModal({ message, onConfirm, onClose }) {
    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 50, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                onClick={(e) => e.stopPropagation()}
            >
                <motion.div
                    className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", delay: 0.1 }}
                >
                    <Trash2 className="w-8 h-8 text-red-400" />
                </motion.div>

                <motion.h3
                    className="text-lg font-semibold text-slate-200 mb-2 text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    Delete Message?
                </motion.h3>
                <motion.p
                    className="text-slate-400 text-sm mb-6 text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    This message will be permanently deleted. This action cannot be undone.
                </motion.p>

                <motion.div
                    className="flex gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                >
                    <motion.button
                        className="flex-1 px-4 py-2.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-xl transition-all duration-200"
                        onClick={onClose}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Cancel
                    </motion.button>
                    <motion.button
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-red-500/25"
                        onClick={() => {
                            onConfirm(message._id);
                            onClose();
                        }}
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </motion.button>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}

// Forward Message Modal
export function ForwardMessageModal({ message, onForward, onClose }) {
    const { allContacts, getAllContacts, chats } = useChatStore();
    const { authUser } = useAuthStore();
    const [selectedUsers, setSelectedUsers] = useState([]);

    useEffect(() => {
        getAllContacts();
    }, [getAllContacts]);

    const contacts = allContacts.length > 0 ? allContacts : chats;

    const toggleUser = (userId) => {
        setSelectedUsers((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    const handleForward = () => {
        if (selectedUsers.length > 0) {
            onForward(message, selectedUsers);
            onClose();
        }
    };

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-6 w-full max-w-sm shadow-2xl max-h-[80vh] flex flex-col"
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 50, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                onClick={(e) => e.stopPropagation()}
            >
                <motion.h3
                    className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <Forward className="w-5 h-5 text-green-400" />
                    Forward Message
                </motion.h3>

                <div className="flex-1 overflow-y-auto space-y-2 min-h-0 pr-1">
                    {contacts.map((contact, index) => (
                        <motion.button
                            key={contact._id}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${selectedUsers.includes(contact._id)
                                    ? "bg-gradient-to-r from-cyan-500/20 to-green-500/20 border border-cyan-500/50 shadow-lg shadow-cyan-500/10"
                                    : "bg-slate-700/30 hover:bg-slate-700/50 border border-transparent"
                                }`}
                            onClick={() => toggleUser(contact._id)}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <motion.div
                                className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-slate-700/50"
                                animate={selectedUsers.includes(contact._id) ? {
                                    ring: "2px solid rgb(6 182 212)",
                                    scale: 1.05
                                } : {}}
                            >
                                <img
                                    src={contact.profilePic || "/avatar.png"}
                                    alt={contact.fullName}
                                    className="w-full h-full object-cover"
                                />
                            </motion.div>
                            <span className="text-slate-200 text-sm font-medium">{contact.fullName}</span>

                            <AnimatePresence>
                                {selectedUsers.includes(contact._id) && (
                                    <motion.div
                                        className="ml-auto bg-cyan-500 rounded-full p-1"
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        exit={{ scale: 0, rotate: 180 }}
                                        transition={{ type: "spring", stiffness: 500 }}
                                    >
                                        <Check className="w-3 h-3 text-white" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    ))}
                </div>

                <motion.div
                    className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-700/50"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <motion.button
                        className="px-4 py-2.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-xl transition-all duration-200"
                        onClick={onClose}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Cancel
                    </motion.button>
                    <motion.button
                        className={`px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 ${selectedUsers.length > 0
                                ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/25"
                                : "bg-slate-700 text-slate-500 cursor-not-allowed"
                            }`}
                        onClick={handleForward}
                        disabled={selectedUsers.length === 0}
                        whileHover={selectedUsers.length > 0 ? { scale: 1.02, y: -1 } : {}}
                        whileTap={selectedUsers.length > 0 ? { scale: 0.98 } : {}}
                    >
                        <Forward className="w-4 h-4" />
                        Forward {selectedUsers.length > 0 && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="bg-white/20 px-1.5 py-0.5 rounded-full text-xs"
                            >
                                {selectedUsers.length}
                            </motion.span>
                        )}
                    </motion.button>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}

// Double-tick read indicator component
export function MessageReadIndicator({ isRead, isOwn }) {
    if (!isOwn) return null;

    return (
        <motion.div
            className="inline-flex ml-1"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
        >
            <CheckCheck
                className={`w-4 h-4 ${isRead ? 'text-cyan-400' : 'text-slate-400/60'}`}
            />
        </motion.div>
    );
}

export default MessageContextMenu;
