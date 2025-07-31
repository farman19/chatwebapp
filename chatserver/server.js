
import express from 'express';
import dotenv from "dotenv";
import connectDB from "./dbconfig/dbmongo.js";
import userRoute from "./routes/userroutes.js";
import messageRoute from "./routes/messageroutes.js";
import friendRoutes from"./routes/friendsroutes.js";


import cors from "cors";
import cookieParser from 'cookie-parser';
import path from 'path';
import { app, server, io, getReceiverSocketId } from "./socket/socket.js";

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_BASE_URL;
console.log(FRONTEND_URL)
// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: FRONTEND_URL,  
  credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

console.log("======",FRONTEND_URL)
// app.get("/check-cookies", (req, res) => {
//   console.log("Cookies from client:", req.cookies); 
//   res.json({ cookies: req.cookies });
// });


app.use("/uploads", express.static(path.join(process.cwd(), "filessaveup")));

// Serve React frontend build

// const buildPath = path.resolve(__dirname, "../chatx/build");
// app.use(express.static(buildPath));

// app.get("/", (req, res) => {
//   res.sendFile(path.resolve(buildPath, "index.html"));
// });

// Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/message", messageRoute);
app.use('/api/v1/friend', friendRoutes);

// Start server
server.listen(PORT, () => {
  connectDB();
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
