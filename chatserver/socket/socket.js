// server.js या main backend फाइल
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['https://chatxfrontend.onrender.com'],
    credentials: true,
  },
});

const userSocketMap = {};

export const getReceiverSocketId = (userId) => userSocketMap[userId];

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    socket.userId = userId;
    userSocketMap[userId] = socket.id;
  }

  io.emit('get-online-users', Object.keys(userSocketMap));

  socket.on('message-seen', async ({ messageId, senderId, receiverId }) => {
    console.log(`Message ${messageId} seen by ${receiverId}`);

    
     await MessageModel.findByIdAndUpdate(messageId, { isSeen: true });

   
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit('message-seen-update', { messageId });
    }
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      delete userSocketMap[socket.userId];
    }
    io.emit('get-online-users', Object.keys(userSocketMap));
  });
});

server.listen(process.env.PORT || 8070, () => {
  console.log('Server running');
});
