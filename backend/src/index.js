import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { db } from "../db/db.js";
import { userRouter } from "../routes/user.route.js";
import { messageRouter } from "../routes/message.route.js";
import { conversationRouter } from "../routes/conversation.route.js";
import { app, server } from "../lib/socket.js";

dotenv.config();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

async function connectDB() {
  try {
    const connection = await db.getConnection();
    console.log("Database connected successfully");
    connection.release();
  } catch (err) {
    console.error("Database connection failed:", err);
  }
}
connectDB();

// Routes
app.use("/api/u", userRouter);
app.use("/api/c", conversationRouter);
app.use("/api/m", messageRouter);

// Use server.listen for Socket.io
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});