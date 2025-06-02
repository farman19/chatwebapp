import express from "express";
const app = express();
import { Server } from "socket.io";
import http from "http";







const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ['https://chatx-xilj.onrender.com'],
        credentials: true
    },
});
const userSocketMap = {}; 

export const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
}



io.on('connection', (socket) => {
    console.log(' new user connected', socket.id);

    const userId = socket.handshake.query.userId;

    if (userId !== undefined) {
        socket.userId = userId; // socket में userId सेव कर दिया
        userSocketMap[userId] = socket.id;
    }

    io.emit('get-online-users', Object.keys(userSocketMap));

    socket.on('disconnect', () => {
        // console.log("user disconnected", socket.id);

       
        
            delete userSocketMap[userId];
       

        io.emit('get-online-users', Object.keys(userSocketMap));
    });
});



export { app, io, server };
