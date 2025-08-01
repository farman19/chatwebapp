import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import jwt from 'jsonwebtoken';
import { Message } from "../models/messagemodle.js";

const app = express();
const server = http.createServer(app);

const FRONTEND_URL = process.env.FRONTEND_BASE_URL;

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));

const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    credentials: true
  }
});

// ✅ Socket User Map
const userSocketMap = {};

// ✅ Get Receiver Socket Id
export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

// ✅ Socket Authentication Middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  // console.log("🔑 Token in socket:", token);

  if (!token) {
    console.log('❌ Token missing');
    return next(new Error("Authentication error: Token missing"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    socket.userId = decoded.userId; 
    userSocketMap[socket.userId] = socket.id;
    // console.log("✅ Socket Authenticated:", socket.userId);
     io.emit('get-online-users', Object.keys(userSocketMap));
    next();
  } catch (error) {
    console.error("❌ Socket Auth Error:", error.message);
    return next(new Error("Authentication error: Invalid token"));
  }
});

io.on('connection', (socket) => {
  // console.log('✅ New user connected:', socket.userId);

  io.emit('get-online-users', Object.keys(userSocketMap));
  // ✅ Message Seen - Single ya Multiple dono ke liye
// socket.js  (या जहाँ भी आप socket.io init करते हैं)
socket.on("message-seen", async ({ messageIds, senderId, receiverId }) => {
  // console.log(
  //   "📩 Seen request received:",
  //   messageIds,
  //   "=== sender:",
  //   senderId,
  //   "receiver:",
  //   receiverId
  // );

  try {
    const idsArray = Array.isArray(messageIds)
      ? messageIds
      : messageIds
      ? [messageIds]
      : [];

    if (!idsArray.length) return;

    // ✅ Add this line 👇
    const now = new Date(); // <--- this is what was missing

    // 1️⃣ Update DB with seen + seenTime
    const result = await Message.updateMany(
      { _id: { $in: idsArray }, receiverId },
      {
        $set: {
          isSeen: true,
          seenTime: now,
        },
      }
    );
    // console.log("📦 DB update result:", result);

    const senderSocketId = getReceiverSocketId(senderId);
    const receiverSocketId = getReceiverSocketId(receiverId);

    // console.log(
    //   "📡 Sockets — sender:",
    //   senderSocketId,
    //   "receiver:",
    //   receiverSocketId
    // );

    // 3️⃣ Emit to viewer
    if (senderSocketId) {
      io.to(senderSocketId).emit("message-seen-update", {
        messageIds: idsArray,
        senderId,
        receiverId,
        seenTime: now.toISOString(), // ✅ send timestamp
      });
      // console.log("🚀 emitted to viewer:", senderSocketId);
    }

    // 4️⃣ Emit to msg owner (count update)
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("message-seen-update", {
        messageIds: idsArray,
        senderId,
        receiverId,
        seenTime: now.toISOString(), // ✅ also include here
      });
      // console.log("🚀 emitted to owner:", receiverSocketId);
    }
  } catch (err) {
    console.error("❌ Error updating message seen:", err);
  }
});


  // ✅ Send Friend Request
  socket.on('send-friend-request', ({ receiverId, sender }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
  

    if (receiverSocketId) {
      io.to(receiverSocketId).emit('new-friend-request', { sender });
    }
  });

  // ✅ Cancel Friend Request
  socket.on('cancel-friend-request', ({ receiverId, senderId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('cancel-friend-request-update', { senderId });
    }
  });

  // ✅ Accept Friend Request
  socket.on('accept-friend-request', ({ receiverId, sender }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('friend-request-accepted', { sender });
    }
  });

  // ✅ Unfriend
  socket.on('unfriend', ({ receiverId, senderId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('unfriend-update', { senderId });
    }
  });

  // ✅ Disconnect
  socket.on('disconnect', () => {
    // console.log('❌ User disconnected:', socket.userId);
    delete userSocketMap[socket.userId];
    io.emit('get-online-users', Object.keys(userSocketMap));
  });
});




export { app, io, server };
