import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

export const getAllContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getAllContacts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: userToChatId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, replyTo } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!text && !image) {
      return res.status(400).json({ message: "Text or image is required." });
    }
    if (senderId.equals(receiverId)) {
      return res.status(400).json({ message: "Cannot send messages to yourself." });
    }
    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      return res.status(404).json({ message: "Receiver not found." });
    }

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    // Check if receiver is online
    const receiverSocketId = getReceiverSocketId(receiverId);
    const isReceiverOnline = !!receiverSocketId;

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      replyTo: replyTo || null,
      isDelivered: isReceiverOnline, // Mark as delivered if receiver is online
    });

    await newMessage.save();

    // Send message to receiver if online
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Edit message
export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Only sender can edit their message
    if (!message.senderId.equals(userId)) {
      return res.status(403).json({ message: "You can only edit your own messages" });
    }

    message.text = text;
    message.isEdited = true;
    await message.save();

    // Notify the receiver in real-time
    const receiverSocketId = getReceiverSocketId(message.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageEdited", {
        messageId: message._id,
        text: message.text,
      });
    }

    res.status(200).json(message);
  } catch (error) {
    console.log("Error in editMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete message
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Only sender can delete their message
    if (!message.senderId.equals(userId)) {
      return res.status(403).json({ message: "You can only delete your own messages" });
    }

    const receiverId = message.receiverId;
    await Message.findByIdAndDelete(messageId);

    // Notify the receiver in real-time
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", { messageId });
    }

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.log("Error in deleteMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// React to message
export const reactToMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Check if user already reacted with this emoji
    const existingReaction = message.reactions.find(
      (r) => r.userId.equals(userId) && r.emoji === emoji
    );

    if (existingReaction) {
      // Remove the reaction (toggle off)
      message.reactions = message.reactions.filter(
        (r) => !(r.userId.equals(userId) && r.emoji === emoji)
      );
    } else {
      // Add the reaction
      message.reactions.push({ userId, emoji });
    }

    await message.save();

    // Notify both sender and receiver in real-time
    const otherUserId = message.senderId.equals(userId)
      ? message.receiverId
      : message.senderId;

    const otherUserSocketId = getReceiverSocketId(otherUserId);
    if (otherUserSocketId) {
      io.to(otherUserSocketId).emit("messageReaction", {
        messageId: message._id,
        reaction: { userId, emoji },
      });
    }

    res.status(200).json(message);
  } catch (error) {
    console.log("Error in reactToMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Mark messages as read
export const markMessagesAsRead = async (req, res) => {
  try {
    const { senderId } = req.params;
    const readerId = req.user._id;

    // Update all unread messages from sender to reader
    const result = await Message.updateMany(
      {
        senderId,
        receiverId: readerId,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    // Get the updated message IDs to notify the sender
    const updatedMessages = await Message.find({
      senderId,
      receiverId: readerId,
      isRead: true
    }).select('_id');

    const messageIds = updatedMessages.map(m => m._id.toString());

    // Notify sender via socket that messages were read
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesRead", {
        readerId: readerId.toString(),
        messageIds
      });
    }

    res.status(200).json({
      message: "Messages marked as read",
      count: result.modifiedCount
    });
  } catch (error) {
    console.log("Error in markMessagesAsRead: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get unread message count per user
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get unread message counts grouped by sender
    const unreadCounts = await Message.aggregate([
      {
        $match: {
          receiverId: userId,
          isRead: false
        }
      },
      {
        $group: {
          _id: "$senderId",
          count: { $sum: 1 },
          lastMessage: { $last: "$text" },
          lastMessageTime: { $last: "$createdAt" }
        }
      }
    ]);

    // Convert to object for easy lookup
    const unreadMap = {};
    unreadCounts.forEach(item => {
      unreadMap[item._id.toString()] = {
        count: item.count,
        lastMessage: item.lastMessage,
        lastMessageTime: item.lastMessageTime
      };
    });

    res.status(200).json(unreadMap);
  } catch (error) {
    console.log("Error in getUnreadCount: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // find all the messages where the logged-in user is either sender or receiver
    const messages = await Message.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
    });

    const chatPartnerIds = [
      ...new Set(
        messages.map((msg) =>
          msg.senderId.toString() === loggedInUserId.toString()
            ? msg.receiverId.toString()
            : msg.senderId.toString()
        )
      ),
    ];

    const chatPartners = await User.find({ _id: { $in: chatPartnerIds } }).select("-password");

    // Get unread counts for each chat partner
    const unreadCounts = await Message.aggregate([
      {
        $match: {
          receiverId: loggedInUserId,
          isRead: false,
          senderId: { $in: chatPartners.map(p => p._id) }
        }
      },
      {
        $group: {
          _id: "$senderId",
          count: { $sum: 1 }
        }
      }
    ]);

    // Attach unread count to each partner
    const partnersWithUnread = chatPartners.map(partner => {
      const unread = unreadCounts.find(u => u._id.toString() === partner._id.toString());
      return {
        ...partner.toObject(),
        unreadCount: unread ? unread.count : 0
      };
    });

    res.status(200).json(partnersWithUnread);
  } catch (error) {
    console.error("Error in getChatPartners: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
