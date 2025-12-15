import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Trash2, Forward, Smile, X, Check } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

// Popular emoji reactions
const EMOJI_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🔥", "👏"];

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

    const menuItems = [
        ...(isOwnMessage
            ? [
                {
                    icon: Pencil,
                    label: "Edit",
                    onClick: () => {
                        onEdit(message);
                        onClose();
                    },
                    color: "text-cyan-400",
                },
                {
                    icon: Trash2,
                    label: "Delete",
                    onClick: () => {
                        onDelete(message);
                        onClose();
                    },
                    color: "text-red-400",
                },
            ]
            : []),
        {
            icon: Smile,
            label: "React",
            onClick: () => setShowEmojiPicker(!showEmojiPicker),
            color: "text-yellow-400",
        },
        {
            icon: Forward,
            label: "Forward",
            onClick: () => {
                onForward(message);
                onClose();
            },
            color: "text-green-400",
        },
    ];

    return (
        <AnimatePresence>
            <motion.div
                ref={menuRef}
                className="fixed z-50 bg-slate-800/95 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-xl overflow-hidden"
                style={{
                    top: Math.min(position.y, window.innerHeight - 250),
                    left: Math.min(position.x, window.innerWidth - 180),
                }}
                initial={{ opacity: 0, scale: 0.8, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -10 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
                {/* Emoji picker */}
                <AnimatePresence>
                    {showEmojiPicker && (
                        <motion.div
                            className="flex gap-1 p-2 border-b border-slate-700/50 flex-wrap max-w-[200px]"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                        >
                            {EMOJI_REACTIONS.map((emoji) => (
                                <motion.button
                                    key={emoji}
                                    className="text-xl p-1.5 hover:bg-slate-700/50 rounded-lg transition-colors"
                                    onClick={() => {
                                        onReact(message, emoji);
                                        onClose();
                                    }}
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    {emoji}
                                </motion.button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Menu items */}
                <div className="p-1.5">
                    {menuItems.map((item, index) => (
                        <motion.button
                            key={item.label}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-200 hover:bg-slate-700/50 rounded-lg transition-colors"
                            onClick={item.onClick}
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <item.icon className={`w-4 h-4 ${item.color}`} />
                            <span>{item.label}</span>
                        </motion.button>
                    ))}
                </div>
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="bg-slate-800 border border-slate-700/50 rounded-2xl p-6 w-full max-w-md shadow-2xl"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-lg font-semibold text-slate-200 mb-4">Edit Message</h3>

                <textarea
                    ref={inputRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    rows={3}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSave();
                        }
                    }}
                />

                <div className="flex justify-end gap-3 mt-4">
                    <motion.button
                        className="px-4 py-2 text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-2"
                        onClick={onClose}
                        whileTap={{ scale: 0.95 }}
                    >
                        <X className="w-4 h-4" />
                        Cancel
                    </motion.button>
                    <motion.button
                        className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors flex items-center gap-2"
                        onClick={handleSave}
                        whileTap={{ scale: 0.95 }}
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="bg-slate-800 border border-slate-700/50 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-lg font-semibold text-slate-200 mb-2">Delete Message?</h3>
                <p className="text-slate-400 text-sm mb-6">
                    This message will be permanently deleted. This action cannot be undone.
                </p>

                <div className="flex justify-end gap-3">
                    <motion.button
                        className="px-4 py-2 text-slate-400 hover:text-slate-200 transition-colors"
                        onClick={onClose}
                        whileTap={{ scale: 0.95 }}
                    >
                        Cancel
                    </motion.button>
                    <motion.button
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2"
                        onClick={() => {
                            onConfirm(message._id);
                            onClose();
                        }}
                        whileTap={{ scale: 0.95 }}
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="bg-slate-800 border border-slate-700/50 rounded-2xl p-6 w-full max-w-sm shadow-2xl max-h-[80vh] flex flex-col"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-lg font-semibold text-slate-200 mb-4">Forward Message</h3>

                <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
                    {contacts.map((contact) => (
                        <motion.button
                            key={contact._id}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${selectedUsers.includes(contact._id)
                                    ? "bg-cyan-500/20 border border-cyan-500/50"
                                    : "bg-slate-700/30 hover:bg-slate-700/50 border border-transparent"
                                }`}
                            onClick={() => toggleUser(contact._id)}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="w-10 h-10 rounded-full overflow-hidden">
                                <img
                                    src={contact.profilePic || "/avatar.png"}
                                    alt={contact.fullName}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <span className="text-slate-200 text-sm">{contact.fullName}</span>
                            {selectedUsers.includes(contact._id) && (
                                <Check className="w-4 h-4 text-cyan-400 ml-auto" />
                            )}
                        </motion.button>
                    ))}
                </div>

                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-700/50">
                    <motion.button
                        className="px-4 py-2 text-slate-400 hover:text-slate-200 transition-colors"
                        onClick={onClose}
                        whileTap={{ scale: 0.95 }}
                    >
                        Cancel
                    </motion.button>
                    <motion.button
                        className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${selectedUsers.length > 0
                                ? "bg-cyan-500 hover:bg-cyan-600 text-white"
                                : "bg-slate-700 text-slate-500 cursor-not-allowed"
                            }`}
                        onClick={handleForward}
                        disabled={selectedUsers.length === 0}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Forward className="w-4 h-4" />
                        Forward {selectedUsers.length > 0 && `(${selectedUsers.length})`}
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default MessageContextMenu;
