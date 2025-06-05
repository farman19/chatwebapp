import express from "express";
const app = express();
import { Server } from "socket.io";
import http from "http";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ['https://chatxfrontend.onrender.com'],
    credentials: true
  },
});

const userSocketMap = {};

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

io.on('connection', (socket) => {
  console.log('✅ New user connected:', socket.id);

  const userId = socket.handshake.query.userId;
  if (userId !== undefined) {
    socket.userId = userId;
    userSocketMap[userId] = socket.id;
  }

  io.emit('get-online-users', Object.keys(userSocketMap));

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
    if (socket.userId) {
      delete userSocketMap[socket.userId];
    }
    io.emit('get-online-users', Object.keys(userSocketMap));
  });
});

// ✅ Export app, io, and server
export { app, io, server };
