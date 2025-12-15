import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Trash2, Forward, Smile, X, Check, Reply, CornerUpLeft } from "lucide-react";
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
    onReply,
    isOwnMessage,
}) {
    const menuRef = useRef(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [menuStyle, setMenuStyle] = useState({ top: 0, left: 0 });

    // Calculate position - DIRECTLY attached to the bubble
    useEffect(() => {
        const bubbleRect = position.bubbleRect;
        const menuWidth = 160;
        const menuHeight = 280;

        let left, top;

        if (bubbleRect) {
            // Use bubbleRect to position menu right next to the message
            if (isOwnMessage) {
                // Own message (right side) - put menu on LEFT
                left = bubbleRect.left - menuWidth - 10;
                // If not enough space on left, flip to right
                if (left < 10) {
                    left = bubbleRect.right + 10;
                }
            } else {
                // Other's message (left side) - put menu on RIGHT
                left = bubbleRect.right + 10;
                // If not enough space on right, flip to left
                if (left + menuWidth > window.innerWidth - 10) {
                    left = bubbleRect.left - menuWidth - 10;
                }
            }

            // Align vertically with bubble top, slightly offset
            top = bubbleRect.top;

            // If menu would go below screen, move it up
            if (top + menuHeight > window.innerHeight - 20) {
                top = window.innerHeight - menuHeight - 20;
            }
            // Don't go above screen
            if (top < 20) top = 20;
        } else {
            // Fallback - shouldn't happen
            left = Math.max(10, Math.min(position.x, window.innerWidth - menuWidth - 10));
            top = Math.max(10, Math.min(position.y, window.innerHeight - menuHeight - 10));
        }

        // Extra safety: ensure within bounds
        left = Math.max(10, Math.min(left, window.innerWidth - menuWidth - 10));

        setMenuStyle({ top, left });
    }, [position, isOwnMessage]);

    // Close on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose();
            }
        };
        setTimeout(() => document.addEventListener("click", handleClick), 50);
        document.addEventListener("contextmenu", onClose);
        return () => {
            document.removeEventListener("click", handleClick);
            document.removeEventListener("contextmenu", onClose);
        };
    }, [onClose]);

    // Close on Escape
    useEffect(() => {
        const handleEsc = (e) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    const menuItems = [
        {
            icon: CornerUpLeft,
            label: "Reply",
            onClick: () => { onReply?.(message); onClose(); },
            color: "text-blue-400",
        },
        // Only show Edit/Delete for own messages
        ...(isOwnMessage ? [
            {
                icon: Pencil,
                label: "Edit",
                onClick: () => { onEdit?.(message); onClose(); },
                color: "text-amber-400",
            },
            {
                icon: Trash2,
                label: "Delete",
                onClick: () => { onDelete?.(message); onClose(); },
                color: "text-red-400",
            },
        ] : []),
        {
            icon: Smile,
            label: "React",
            onClick: () => setShowEmojiPicker(!showEmojiPicker),
            color: "text-yellow-400",
        },
        {
            icon: Forward,
            label: "Forward",
            onClick: () => { onForward?.(message); onClose(); },
            color: "text-green-400",
        },
    ];

    return (
        <motion.div
            ref={menuRef}
            className="fixed z-[999] bg-slate-800/95 backdrop-blur-md border border-slate-700/60 rounded-xl shadow-2xl overflow-hidden"
            style={{ top: menuStyle.top, left: menuStyle.left, minWidth: 150 }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
        >
            {/* Emoji picker */}
            <AnimatePresence>
                {showEmojiPicker && (
                    <motion.div
                        className="flex gap-1.5 p-3 border-b border-slate-700/50 flex-wrap justify-center bg-slate-900/50"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                    >
                        {EMOJI_REACTIONS.map((emoji) => (
                            <motion.button
                                key={emoji}
                                className="text-xl p-1.5 hover:bg-slate-700/60 rounded-lg"
                                onClick={() => { onReact(message, emoji); onClose(); }}
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
            <div className="py-1">
                {menuItems.map((item) => (
                    <motion.button
                        key={item.label}
                        onClick={item.onClick}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-700/50 transition-colors ${item.color}`}
                        whileTap={{ scale: 0.98 }}
                    >
                        <item.icon className="w-4 h-4" />
                        <span className="text-sm text-slate-200">{item.label}</span>
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
}

// Edit Message Modal
export function EditMessageModal({ message, onSave, onClose }) {
    const [text, setText] = useState(message?.text || "");
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
    }, []);

    const handleSave = async () => {
        if (text.trim() && text !== message.text) {
            await onSave(message._id, text.trim());
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
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                        <Pencil className="w-5 h-5 text-amber-400" />
                        Edit Message
                    </h3>
                    <motion.button onClick={onClose} className="p-1 hover:bg-slate-700/50 rounded-full" whileTap={{ scale: 0.9 }}>
                        <X className="w-5 h-5 text-slate-400" />
                    </motion.button>
                </div>

                <textarea
                    ref={inputRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-700 rounded-xl p-3 text-slate-200 resize-none h-24 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    placeholder="Edit your message..."
                />

                <div className="flex justify-end gap-3 mt-4">
                    <motion.button onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-slate-200 rounded-xl" whileTap={{ scale: 0.97 }}>
                        Cancel
                    </motion.button>
                    <motion.button
                        onClick={handleSave}
                        disabled={!text.trim()}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl flex items-center gap-2 disabled:opacity-50"
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

// Delete Message Modal
export function DeleteMessageModal({ message, onConfirm, onClose }) {
    const handleDelete = async () => {
        await onConfirm(message._id);
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
                className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-5 w-full max-w-sm shadow-2xl text-center"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                    <Trash2 className="w-7 h-7 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-200 mb-2">Delete Message?</h3>
                <p className="text-slate-400 text-sm mb-5">This message will be deleted for everyone.</p>

                <div className="flex gap-3">
                    <motion.button onClick={onClose} className="flex-1 px-4 py-2.5 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-xl" whileTap={{ scale: 0.97 }}>
                        Cancel
                    </motion.button>
                    <motion.button onClick={handleDelete} className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl" whileTap={{ scale: 0.97 }}>
                        Delete
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// Forward Message Modal
export function ForwardMessageModal({ message, onForward, onClose }) {
    const { users } = useChatStore();
    const { authUser } = useAuthStore();
    const [selected, setSelected] = useState([]);

    const otherUsers = users?.filter((u) => u._id !== authUser._id) || [];

    const toggleUser = (id) => {
        setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    };

    const handleForward = async () => {
        if (selected.length > 0) {
            await onForward(message, selected);
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
                className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-5 w-full max-w-sm shadow-2xl"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                        <Forward className="w-5 h-5 text-green-400" />
                        Forward To
                    </h3>
                    <motion.button onClick={onClose} className="p-1 hover:bg-slate-700/50 rounded-full" whileTap={{ scale: 0.9 }}>
                        <X className="w-5 h-5 text-slate-400" />
                    </motion.button>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2 mb-4">
                    {otherUsers.map((user) => (
                        <motion.button
                            key={user._id}
                            onClick={() => toggleUser(user._id)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${selected.includes(user._id) ? "bg-cyan-500/20 border border-cyan-500/50" : "bg-slate-800/50 hover:bg-slate-700/50 border border-transparent"}`}
                            whileTap={{ scale: 0.98 }}
                        >
                            <img src={user.profilePic || "/avatar.png"} alt={user.fullName} className="w-10 h-10 rounded-full object-cover" />
                            <span className="text-slate-200 text-sm">{user.fullName}</span>
                            {selected.includes(user._id) && <Check className="w-4 h-4 text-cyan-400 ml-auto" />}
                        </motion.button>
                    ))}
                </div>

                <motion.button
                    onClick={handleForward}
                    disabled={selected.length === 0}
                    className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
                    whileTap={{ scale: 0.97 }}
                >
                    <Forward className="w-4 h-4" />
                    Forward to {selected.length} {selected.length === 1 ? "person" : "people"}
                </motion.button>
            </motion.div>
        </motion.div>
    );
}

export default MessageContextMenu;
