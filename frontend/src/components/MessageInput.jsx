import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useKeyboardSound from "../hooks/useKeyboardSound";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";
import { ImageIcon, SendIcon, XIcon, CornerUpLeft } from "lucide-react";

function MessageInput({ replyTo, onCancelReply }) {
  const { playRandomKeyStrokeSound } = useKeyboardSound();
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const fileInputRef = useRef(null);

  const { sendMessage, isSoundEnabled, startTyping, stopTyping } = useChatStore();

  // Focus input when replying
  useEffect(() => {
    if (replyTo && inputRef.current) {
      inputRef.current.focus();
    }
  }, [replyTo]);

  // Handle input focus for mobile keyboard
  const handleInputFocus = () => {
    // Small delay to let keyboard open
    setTimeout(() => {
      if (inputRef.current) {
        // Scroll input into view on iOS/Android
        inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 300);
  };

  // Debounced typing handler
  const handleTyping = useCallback(() => {
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      startTyping();
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      stopTyping();
    }, 2000);
  }, [startTyping, stopTyping]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (isTypingRef.current) stopTyping();
    };
  }, [stopTyping]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;
    if (isSoundEnabled) playRandomKeyStrokeSound();

    if (isTypingRef.current) {
      isTypingRef.current = false;
      stopTyping();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }

    sendMessage({
      text: text.trim(),
      image: imagePreview,
      replyTo: replyTo?._id || null,
    });

    setText("");
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (onCancelReply) onCancelReply();
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    if (isSoundEnabled) playRandomKeyStrokeSound();

    if (e.target.value.length > 0) {
      handleTyping();
    } else {
      if (isTypingRef.current) {
        isTypingRef.current = false;
        stopTyping();
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file?.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <motion.div
      ref={containerRef}
      className="border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-sm safe-area-bottom chat-input-area keyboard-transition"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Reply Preview */}
      <AnimatePresence>
        {replyTo && (
          <motion.div
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border-b border-slate-700/30"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div className="w-1 h-8 bg-cyan-500 rounded-full" />
            <CornerUpLeft className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-cyan-400 font-medium">Replying</p>
              <p className="text-xs text-slate-400 truncate">
                {replyTo.text || (replyTo.image ? "📷 Image" : "Message")}
              </p>
            </div>
            <motion.button
              onClick={onCancelReply}
              className="p-1.5 hover:bg-slate-700/50 rounded-full transition-colors"
              whileTap={{ scale: 0.9 }}
            >
              <XIcon className="w-4 h-4 text-slate-400" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-3 md:p-4">
        {/* Image Preview */}
        <AnimatePresence>
          {imagePreview && (
            <motion.div
              className="max-w-3xl mx-auto mb-3 flex items-center"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg border border-slate-700 shadow-lg"
                />
                <motion.button
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-200 hover:bg-red-500 transition-colors shadow-md"
                  type="button"
                  whileTap={{ scale: 0.9 }}
                >
                  <XIcon className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex space-x-2 md:space-x-3">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={handleTextChange}
            onFocus={handleInputFocus}
            enterKeyHint="send"
            autoComplete="off"
            autoCorrect="on"
            spellCheck="true"
            className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-xl py-2.5 md:py-3 px-4 text-sm md:text-base text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all"
            placeholder={replyTo ? "Type your reply..." : "Type your message..."}
          />

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
          />

          <motion.button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`bg-slate-800/50 text-slate-400 hover:text-slate-200 rounded-xl px-3 md:px-4 transition-colors border border-slate-700/50 ${imagePreview ? "text-cyan-500 border-cyan-500/50" : ""
              }`}
            whileTap={{ scale: 0.95 }}
          >
            <ImageIcon className="w-5 h-5" />
          </motion.button>

          <motion.button
            type="submit"
            disabled={!text.trim() && !imagePreview}
            className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl px-4 md:px-6 py-2.5 md:py-3 font-medium hover:from-cyan-600 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
            whileTap={{ scale: 0.95 }}
          >
            <SendIcon className="w-5 h-5" />
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}
export default MessageInput;
