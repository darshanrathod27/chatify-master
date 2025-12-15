import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,
  showMobileSidebar: true,

  // Typing and viewing indicators
  typingUsers: {}, // {userId: true}
  viewingUsers: {}, // {userId: true} - users currently viewing your chat
  unreadCounts: {}, // {userId: count}

  toggleSound: () => {
    localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
    set({ isSoundEnabled: !get().isSoundEnabled });
  },

  setShowMobileSidebar: (show) => set({ showMobileSidebar: show }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  setSelectedUser: (selectedUser) => {
    const { selectedUser: prevUser } = get();
    const socket = useAuthStore.getState().socket;

    // Notify previous chat partner that we left
    if (prevUser && socket) {
      socket.emit("leftChat", { chatPartnerId: prevUser._id });
    }

    set({ selectedUser });

    // On mobile, switch to chat view when user is selected
    if (selectedUser) {
      set({ showMobileSidebar: false });

      // Notify new chat partner that we're viewing their chat
      if (socket) {
        socket.emit("viewingChat", { chatPartnerId: selectedUser._id });
      }

      // Mark messages as read when opening chat
      get().markMessagesAsRead(selectedUser._id);
    }
  },

  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/contacts");
      set({ allContacts: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load contacts");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/chats");
      set({ chats: res.data });

      // Extract unread counts from chat partners
      const unreadCounts = {};
      res.data.forEach(chat => {
        if (chat.unreadCount > 0) {
          unreadCounts[chat._id] = chat.unreadCount;
        }
      });
      set({ unreadCounts });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load chats");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessagesByUserId: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });

      // Mark messages as read after loading
      get().markMessagesAsRead(userId);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  markMessagesAsRead: async (senderId) => {
    try {
      await axiosInstance.post(`/messages/read/${senderId}`);

      // Clear unread count for this user
      const { unreadCounts } = get();
      const newUnreadCounts = { ...unreadCounts };
      delete newUnreadCounts[senderId];
      set({ unreadCounts: newUnreadCounts });

      // Update messages to show as read
      const { messages } = get();
      set({
        messages: messages.map(msg =>
          msg.senderId === senderId ? { ...msg, isRead: true } : msg
        )
      });
    } catch (error) {
      console.log("Error marking messages as read:", error);
    }
  },

  // Typing indicator functions
  startTyping: () => {
    const { selectedUser } = get();
    const socket = useAuthStore.getState().socket;
    if (selectedUser && socket) {
      socket.emit("typing", { receiverId: selectedUser._id });
    }
  },

  stopTyping: () => {
    const { selectedUser } = get();
    const socket = useAuthStore.getState().socket;
    if (selectedUser && socket) {
      socket.emit("stopTyping", { receiverId: selectedUser._id });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const { authUser } = useAuthStore.getState();

    const tempId = `temp-${Date.now()}`;

    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text,
      image: messageData.image,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
      isRead: false,
    };

    set({ messages: [...messages, optimisticMessage] });

    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: messages.concat(res.data) });
    } catch (error) {
      set({ messages: messages });
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  },

  // Edit message
  editMessage: async (messageId, newText) => {
    const { messages } = get();
    try {
      await axiosInstance.put(`/messages/${messageId}`, { text: newText });
      set({
        messages: messages.map((msg) =>
          msg._id === messageId
            ? { ...msg, text: newText, isEdited: true }
            : msg
        ),
      });
      toast.success("Message edited");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to edit message");
    }
  },

  // Delete message
  deleteMessage: async (messageId) => {
    const { messages } = get();
    try {
      await axiosInstance.delete(`/messages/${messageId}`);
      set({ messages: messages.filter((msg) => msg._id !== messageId) });
      toast.success("Message deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete message");
    }
  },

  // React to message
  reactToMessage: async (messageId, emoji) => {
    const { messages } = get();
    const { authUser } = useAuthStore.getState();
    try {
      await axiosInstance.post(`/messages/${messageId}/react`, { emoji });
      set({
        messages: messages.map((msg) =>
          msg._id === messageId
            ? {
              ...msg,
              reactions: [
                ...(msg.reactions || []),
                { emoji, userId: authUser._id },
              ],
            }
            : msg
        ),
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add reaction");
    }
  },

  // Forward message
  forwardMessage: async (message, userIds) => {
    try {
      for (const userId of userIds) {
        await axiosInstance.post(`/messages/send/${userId}`, {
          text: message.text,
          image: message.image,
        });
      }
      toast.success(`Message forwarded to ${userIds.length} user(s)`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to forward message");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser, isSoundEnabled } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    // New message received
    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;

      if (isMessageSentFromSelectedUser) {
        const currentMessages = get().messages;
        set({ messages: [...currentMessages, newMessage] });

        // Mark as read since we're viewing the chat
        get().markMessagesAsRead(selectedUser._id);
      } else {
        // Update unread count for other users
        const { unreadCounts } = get();
        set({
          unreadCounts: {
            ...unreadCounts,
            [newMessage.senderId]: (unreadCounts[newMessage.senderId] || 0) + 1
          }
        });
      }

      if (isSoundEnabled) {
        const notificationSound = new Audio("/sounds/notification.mp3");
        notificationSound.currentTime = 0;
        notificationSound.play().catch((e) => console.log("Audio play failed:", e));
      }
    });

    // Listen for message edits
    socket.on("messageEdited", ({ messageId, text }) => {
      const currentMessages = get().messages;
      set({
        messages: currentMessages.map((msg) =>
          msg._id === messageId ? { ...msg, text, isEdited: true } : msg
        ),
      });
    });

    // Listen for message deletes
    socket.on("messageDeleted", ({ messageId }) => {
      const currentMessages = get().messages;
      set({ messages: currentMessages.filter((msg) => msg._id !== messageId) });
    });

    // Listen for reactions
    socket.on("messageReaction", ({ messageId, reaction }) => {
      const currentMessages = get().messages;
      set({
        messages: currentMessages.map((msg) =>
          msg._id === messageId
            ? { ...msg, reactions: [...(msg.reactions || []), reaction] }
            : msg
        ),
      });
    });

    // Listen for messages read (blue ticks)
    socket.on("messagesRead", ({ readerId, messageIds }) => {
      if (readerId === selectedUser._id) {
        const currentMessages = get().messages;
        set({
          messages: currentMessages.map((msg) =>
            messageIds.includes(msg._id) ? { ...msg, isRead: true } : msg
          ),
        });
      }
    });

    // Listen for typing indicator
    socket.on("userTyping", ({ userId }) => {
      if (userId === selectedUser._id) {
        set({ typingUsers: { ...get().typingUsers, [userId]: true } });
      }
    });

    socket.on("userStoppedTyping", ({ userId }) => {
      const { typingUsers } = get();
      const newTypingUsers = { ...typingUsers };
      delete newTypingUsers[userId];
      set({ typingUsers: newTypingUsers });
    });

    // Listen for viewing indicator (Snapchat-like)
    socket.on("userViewingChat", ({ userId }) => {
      set({ viewingUsers: { ...get().viewingUsers, [userId]: true } });
    });

    socket.on("userLeftChat", ({ userId }) => {
      const { viewingUsers, typingUsers } = get();
      const newViewingUsers = { ...viewingUsers };
      const newTypingUsers = { ...typingUsers };
      delete newViewingUsers[userId];
      delete newTypingUsers[userId];
      set({ viewingUsers: newViewingUsers, typingUsers: newTypingUsers });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    const { selectedUser } = get();

    // Notify that we left the chat
    if (selectedUser && socket) {
      socket.emit("leftChat", { chatPartnerId: selectedUser._id });
    }

    socket.off("newMessage");
    socket.off("messageEdited");
    socket.off("messageDeleted");
    socket.off("messageReaction");
    socket.off("messagesRead");
    socket.off("userTyping");
    socket.off("userStoppedTyping");
    socket.off("userViewingChat");
    socket.off("userLeftChat");

    // Clear typing and viewing users
    set({ typingUsers: {}, viewingUsers: {} });
  },
}));
