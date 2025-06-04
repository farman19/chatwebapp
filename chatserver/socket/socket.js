import express from "express";
const app = express();
import { Server } from "socket.io";
import http from "http";

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ['https://chatxfrontend.onrender.com'], // ✅ Frontend domain
        credentials: true
    },
});

// सभी active users का map बनाएंगे
const userSocketMap = {};

// ✅ किसी भी receiver का socket id निकालने के लिए helper
export const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
}

io.on('connection', (socket) => {
    console.log('✅ New user connected:', socket.id);

    const userId = socket.handshake.query.userId;

    if (userId !== undefined) {
        socket.userId = userId; // ✅ socket में userId सेव किया
        userSocketMap[userId] = socket.id; // ✅ map में जोड़ दिया
    }

    // सभी clients को online users की updated list भेजो
    io.emit('get-online-users', Object.keys(userSocketMap));

    socket.on('disconnect', () => {
        console.log('❌ User disconnected:', socket.id);

        // ✅ socket.userId से ही हटाओ, ना कि बाहर declare userId से
        if (socket.userId) {
            delete userSocketMap[socket.userId];
        }

        // updated list भेजो
        io.emit('get-online-users', Object.keys(userSocketMap));
    });
});

export { app, io, server };
