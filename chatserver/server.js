// server.js (या index.js जो main file हो)
import express from 'express';
import dotenv from "dotenv";
import connectDB from "./dbconfig/dbmongo.js";
import userRoute from "./routes/userroutes.js";
import messageRoute from "./routes/messageroutes.js";
import cors from "cors";
import cookieParser from 'cookie-parser';
import path from 'path';
import { app, server } from "./socket/socket.js"; // app defined via socket.js
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const PORT = process.env.PORT || 5000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
 origin: ["https://chatxfrontend.onrender.com", "http://localhost:3000"],
  credentials: true
}));


// ✅ Serve static files from 'filessaveup' folder
app.use("/uploads", express.static(path.join(process.cwd(), "filessaveup")));

// Serve React frontend build

const buildPath = path.resolve(__dirname, "client/build");
app.use(express.static(buildPath));

app.get("/", (req, res) => {
  res.sendFile(path.resolve(buildPath, "index.html"));
});

// Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/message", messageRoute);

// Start server
server.listen(PORT, () => {
  connectDB();
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
