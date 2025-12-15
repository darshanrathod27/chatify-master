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
  showMobileSidebar: true, // Mobile navigation state

  toggleSound: () => {
    localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
    set({ isSoundEnabled: !get().isSoundEnabled });
  },

  setShowMobileSidebar: (show) => set({ showMobileSidebar: show }),

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedUser: (selectedUser) => {
    set({ selectedUser });
    // On mobile, switch to chat view when user is selected
    if (selectedUser) {
      set({ showMobileSidebar: false });
    }
  },

  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/contacts");
      set({ allContacts: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },
  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/chats");
      set({ chats: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessagesByUserId: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isMessagesLoading: false });
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
      isOptimistic: true, // flag to identify optimistic messages (optional)
    };
    // immidetaly update the ui by adding the message
    set({ messages: [...messages, optimisticMessage] });

    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: messages.concat(res.data) });
    } catch (error) {
      // remove optimistic message on failure
      set({ messages: messages });
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  },

  // Edit message
  editMessage: async (messageId, newText) => {
    const { messages } = get();
    try {
      const res = await axiosInstance.put(`/messages/${messageId}`, { text: newText });
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
      const res = await axiosInstance.post(`/messages/${messageId}/react`, { emoji });
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

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      const currentMessages = get().messages;
      set({ messages: [...currentMessages, newMessage] });

      if (isSoundEnabled) {
        const notificationSound = new Audio("/sounds/notification.mp3");

        notificationSound.currentTime = 0; // reset to start
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
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("messageEdited");
    socket.off("messageDeleted");
    socket.off("messageReaction");
  },
}));

