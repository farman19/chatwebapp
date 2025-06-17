import dotenv from 'dotenv';
dotenv.config();
import express from "express";
const app = express();
import { Server } from "socket.io";
import http from "http";
import { Message } from "../models/messagemodle.js"; 

const server = http.createServer(app);
const FRONTEND_URL = process.env.FRONTEND_BASE_URL;

const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    credentials: true
  },
});

const userSocketMap = {};

// ✅ Get receiver's socket ID
export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

// ✅ Connection handler
io.on('connection', (socket) => {
  console.log('✅ New user connected:', socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) {
    socket.userId = userId;
    userSocketMap[userId] = socket.id;
  }

  io.emit('get-online-users', Object.keys(userSocketMap));

  // ✅ Handle seen event
  socket.on('message-seen', async ({ messageId, senderId, receiverId }) => {
    console.log(`👁️ Message ${messageId} seen by ${receiverId}`);

    try {
      await Message.findByIdAndUpdate(messageId, { isSeen: true });

      const senderSocketId = getReceiverSocketId(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit('message-seen-update', { messageId });
      }
    } catch (error) {
      console.error("❌ Error updating message seen status:", error);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
    if (socket.userId) {
      delete userSocketMap[socket.userId];
    }
    io.emit('get-online-users', Object.keys(userSocketMap));
  });
});

// ✅ Export
export { app, io, server };

