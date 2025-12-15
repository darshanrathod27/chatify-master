import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Trash2, Forward, Smile, X, Check, Reply, CornerUpLeft } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

// Popular emoji reactions
const EMOJI_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🔥", "👏"];

// Animation variants
const menuVariants = {
    hidden: {
        opacity: 0,
        scale: 0.85,
        y: 10
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 400,
            damping: 25,
            staggerChildren: 0.03
        }
    },
    exit: {
        opacity: 0,
        scale: 0.85,
        y: 10,
        transition: { duration: 0.12 }
    }
};

const menuItemVariants = {
    hidden: { opacity: 0, x: -8 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { type: "spring", stiffness: 350 }
    }
};

const emojiVariants = {
    hidden: { scale: 0, rotate: -90 },
    visible: (i) => ({
        scale: 1,
        rotate: 0,
        transition: {
            type: "spring",
            stiffness: 450,
            delay: i * 0.025
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
    onReply,
    isOwnMessage,
}) {
    const menuRef = useRef(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [activeButton, setActiveButton] = useState(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

    // Calculate WhatsApp-style menu position (attached to bubble)
    useEffect(() => {
        const menuHeight = 220;
        const menuWidth = 150;
        const bubbleRect = position.bubbleRect;
        const isOwn = position.isOwn !== undefined ? position.isOwn : isOwnMessage;

        let top, left;

        if (bubbleRect) {
            // WhatsApp-style: position menu next to bubble
            if (isOwn) {
                // Own message (right side): menu on the left of bubble
                left = bubbleRect.left - menuWidth - 12;
                // If no space on left, put it on right
                if (left < 20) {
                    left = bubbleRect.right + 12;
                }
            } else {
                // Other's message (left side): menu on the right of bubble
                left = bubbleRect.right + 12;
                // If no space on right, put it on left
                if (left + menuWidth > window.innerWidth - 20) {
                    left = bubbleRect.left - menuWidth - 12;
                }
            }

            // Position vertically centered on bubble
            top = bubbleRect.top + (bubbleRect.height / 2) - (menuHeight / 2);
        } else {
            // Fallback to click position
            left = position.x;
            top = position.y - menuHeight / 2;
        }

        // Ensure menu stays within screen bounds
        if (top + menuHeight > window.innerHeight - 20) {
            top = window.innerHeight - menuHeight - 20;
        }
        if (top < 20) top = 20;
        if (left < 20) left = 20;
        if (left + menuWidth > window.innerWidth - 20) {
            left = window.innerWidth - menuWidth - 20;
        }

        setMenuPosition({ top, left });
    }, [position, isOwnMessage]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose();
            }
        };

        // Delay adding listeners to prevent immediate close
        const timer = setTimeout(() => {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("touchstart", handleClickOutside);
        }, 100);

        return () => {
            clearTimeout(timer);
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
        setTimeout(() => {
            action();
        }, 100);
    };

    const menuItems = [
        // Reply option (for all messages)
        {
            icon: CornerUpLeft,
            label: "Reply",
            onClick: () => {
                handleButtonClick(() => {
                    onReply?.(message);
                    onClose();
                }, "Reply");
            },
            color: "text-blue-400",
            hoverBg: "hover:bg-blue-500/20",
            activeBg: "bg-blue-500/30",
        },
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
        <motion.div
            ref={menuRef}
            className="fixed z-[100] bg-slate-800/98 backdrop-blur-lg border border-slate-600/50 rounded-2xl shadow-2xl overflow-hidden min-w-[150px]"
            style={{
                top: menuPosition.top || position.y,
                left: menuPosition.left || position.x,
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
                        className="flex gap-1.5 p-3 border-b border-slate-700/50 flex-wrap max-w-[200px] justify-center bg-slate-900/50"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 350, damping: 28 }}
                    >
                        {EMOJI_REACTIONS.map((emoji, i) => (
                            <motion.button
                                key={emoji}
                                className="text-xl p-1.5 hover:bg-slate-700/60 rounded-lg transition-colors active:scale-90"
                                onClick={() => {
                                    onReact(message, emoji);
                                    onClose();
                                }}
                                custom={i}
                                variants={emojiVariants}
                                initial="hidden"
                                animate="visible"
                                whileHover={{
                                    scale: 1.25,
                                    transition: { duration: 0.15 }
                                }}
                                whileTap={{ scale: 0.85 }}
                            >
                                {emoji}
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Menu items */}
            <div className="p-1.5">
                {menuItems.map((item) => (
                    <motion.button
                        key={item.label}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-xl transition-all duration-150 ${activeButton === item.label
                            ? `${item.activeBg} ${item.color}`
                            : `text-slate-200 ${item.hoverBg}`
                            }`}
                        onClick={item.onClick}
                        variants={menuItemVariants}
                        whileHover={{
                            x: 3,
                            transition: { duration: 0.15 }
                        }}
                        whileTap={{ scale: 0.97 }}
                    >
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                        <span className="font-medium text-sm">{item.label}</span>
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
}

// Edit Message Modal Component
export function EditMessageModal({ message, onSave, onClose }) {
    const [text, setText] = useState(message?.text || "");
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
    }, []);

    const handleSave = () => {
        if (text.trim() && text !== message.text) {
            onSave(message._id, text.trim());
        }
        onClose();
    };

    return (
        <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-5 w-full max-w-md shadow-2xl"
                initial={{ scale: 0.9, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 30, opacity: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                    <Pencil className="w-5 h-5 text-cyan-400" />
                    Edit Message
                </h3>

                <textarea
                    ref={inputRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-700 rounded-xl p-4 text-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                    rows={3}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSave();
                        }
                    }}
                />

                <div className="flex justify-end gap-2 mt-4">
                    <motion.button
                        className="px-4 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-xl transition-all flex items-center gap-2"
                        onClick={onClose}
                        whileTap={{ scale: 0.97 }}
                    >
                        <X className="w-4 h-4" />
                        Cancel
                    </motion.button>
                    <motion.button
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/25"
                        onClick={handleSave}
                        whileTap={{ scale: 0.97 }}
                    >
                        <Check className="w-4 h-4" />
                        Save
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// Delete Confirmation Modal
export function DeleteMessageModal({ message, onConfirm, onClose }) {
    return (
        <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-5 w-full max-w-sm shadow-2xl"
                initial={{ scale: 0.9, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 30, opacity: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                    <Trash2 className="w-7 h-7 text-red-400" />
                </div>

                <h3 className="text-lg font-semibold text-slate-200 mb-2 text-center">
                    Delete Message?
                </h3>
                <p className="text-slate-400 text-sm mb-5 text-center">
                    This action cannot be undone.
                </p>

                <div className="flex gap-2">
                    <motion.button
                        className="flex-1 px-4 py-2.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-xl transition-all"
                        onClick={onClose}
                        whileTap={{ scale: 0.97 }}
                    >
                        Cancel
                    </motion.button>
                    <motion.button
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/25"
                        onClick={() => {
                            onConfirm(message._id);
                            onClose();
                        }}
                        whileTap={{ scale: 0.97 }}
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// Forward Message Modal
export function ForwardMessageModal({ message, onForward, onClose }) {
    const { allContacts, getAllContacts, chats } = useChatStore();
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
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-5 w-full max-w-sm shadow-2xl max-h-[70vh] flex flex-col"
                initial={{ scale: 0.9, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 30, opacity: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                    <Forward className="w-5 h-5 text-green-400" />
                    Forward Message
                </h3>

                <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0 pr-1">
                    {contacts.map((contact) => (
                        <motion.button
                            key={contact._id}
                            className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all ${selectedUsers.includes(contact._id)
                                ? "bg-cyan-500/20 border border-cyan-500/50"
                                : "bg-slate-700/30 hover:bg-slate-700/50 border border-transparent"
                                }`}
                            onClick={() => toggleUser(contact._id)}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-slate-700/50">
                                <img
                                    src={contact.profilePic || "/avatar.png"}
                                    alt={contact.fullName}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <span className="text-slate-200 text-sm font-medium flex-1 text-left">{contact.fullName}</span>

                            {selectedUsers.includes(contact._id) && (
                                <motion.div
                                    className="bg-cyan-500 rounded-full p-0.5"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 500 }}
                                >
                                    <Check className="w-3 h-3 text-white" />
                                </motion.div>
                            )}
                        </motion.button>
                    ))}
                </div>

                <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-700/50">
                    <motion.button
                        className="px-4 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-xl transition-all"
                        onClick={onClose}
                        whileTap={{ scale: 0.97 }}
                    >
                        Cancel
                    </motion.button>
                    <motion.button
                        className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${selectedUsers.length > 0
                            ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25"
                            : "bg-slate-700 text-slate-500 cursor-not-allowed"
                            }`}
                        onClick={handleForward}
                        disabled={selectedUsers.length === 0}
                        whileTap={selectedUsers.length > 0 ? { scale: 0.97 } : {}}
                    >
                        <Forward className="w-4 h-4" />
                        Forward {selectedUsers.length > 0 && `(${selectedUsers.length})`}
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// Reply Preview Component (for showing what you're replying to)
export function ReplyPreview({ message, onCancel }) {
    if (!message) return null;

    return (
        <motion.div
            className="flex items-center gap-2 p-2 mx-3 mb-2 bg-slate-800/70 rounded-lg border-l-4 border-cyan-500"
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
            <CornerUpLeft className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
                <p className="text-xs text-cyan-400 font-medium">Replying to</p>
                <p className="text-xs text-slate-400 truncate">
                    {message.text || (message.image ? "📷 Image" : "Message")}
                </p>
            </div>
            <motion.button
                onClick={onCancel}
                className="p-1 hover:bg-slate-700/50 rounded-full transition-colors"
                whileTap={{ scale: 0.9 }}
            >
                <X className="w-4 h-4 text-slate-400" />
            </motion.button>
        </motion.div>
    );
}

export default MessageContextMenu;
