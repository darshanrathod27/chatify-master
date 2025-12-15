import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [ENV.CLIENT_URL],
    credentials: true,
  },
});

// apply authentication middleware to all socket connections
io.use(socketAuthMiddleware);

// we will use this function to check if the user is online or not
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// this is for storing online users
const userSocketMap = {}; // {userId:socketId}

// Track who is viewing whose chat
const viewingChatMap = {}; // {viewerId: chatPartnerId}

io.on("connection", (socket) => {
  console.log("A user connected", socket.user.fullName);

  const userId = socket.userId;
  userSocketMap[userId] = socket.id;

  // io.emit() is used to send events to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Typing indicator - user started typing
  socket.on("typing", ({ receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userTyping", { userId });
    }
  });

  // Typing indicator - user stopped typing
  socket.on("stopTyping", ({ receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userStoppedTyping", { userId });
    }
  });

  // Mark messages as read
  socket.on("markAsRead", ({ senderId, messageIds }) => {
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesRead", {
        readerId: userId,
        messageIds
      });
    }
  });

  // User is viewing a chat (Snapchat-like viewing indicator)
  socket.on("viewingChat", ({ chatPartnerId }) => {
    viewingChatMap[userId] = chatPartnerId;
    const partnerSocketId = getReceiverSocketId(chatPartnerId);
    if (partnerSocketId) {
      io.to(partnerSocketId).emit("userViewingChat", { userId });
    }
  });

  // User left the chat
  socket.on("leftChat", ({ chatPartnerId }) => {
    delete viewingChatMap[userId];
    const partnerSocketId = getReceiverSocketId(chatPartnerId);
    if (partnerSocketId) {
      io.to(partnerSocketId).emit("userLeftChat", { userId });
    }
  });

  // with socket.on we listen for events from clients
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.user.fullName);

    // Notify chat partner that user left (if viewing someone's chat)
    if (viewingChatMap[userId]) {
      const partnerSocketId = getReceiverSocketId(viewingChatMap[userId]);
      if (partnerSocketId) {
        io.to(partnerSocketId).emit("userLeftChat", { userId });
      }
      delete viewingChatMap[userId];
    }

    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
