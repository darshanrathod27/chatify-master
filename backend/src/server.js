import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js"; // Aapka purana env file, baaki variables ke liye
import { app, server } from "./lib/socket.js";

// Safety ke liye dotenv config (agar local chala rahe ho to)
dotenv.config();

const __dirname = path.resolve();

// CHANGE 1: Direct process.env use karein taaki Render ka PORT (eg: 10000) pick ho sake
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "5mb" })); // req.body

// CORS setup
app.use(
  cors({
    origin: process.env.CLIENT_URL || ENV.CLIENT_URL, // Environment var ko priority di
    credentials: true,
  })
);

app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// CHANGE 2: Deployment logic fixed
// Hum ab seedha check kar rahe hain ki kya Render ne NODE_ENV ko 'production' set kiya hai
if (process.env.NODE_ENV === "production") {
  // Frontend ki built files serve karein
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  // Kisi bhi aur route par index.html bhejein
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

server.listen(PORT, () => {
  console.log("Server running on port: " + PORT);
  connectDB();
});
