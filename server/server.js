import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import mongoose from "mongoose";
import authRoutes from "./api/routes/authRoutes.js";
import userQueryRoutes from "./api/routes/userQueryRoutes.js";
import contactsRoutes from "./api/routes/contactsRoutes.js";
import requestRoutes from "./api/routes/requestRoutes.js";
import notificationRoutes from "./api/routes/notificationRoutes.js";
import userEditRoutes from "./api/routes/userEditRoutes.js";
import messagesRoutes from "./api/routes/messagesRoutes.js";
import chatRoutes from "./api/routes/chatRoutes.js";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import socketInit from "./socketServer/ioServer.js";

const app = express();
export const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: ["http://localhost:3000"] },
});
socketInit(io);

// can be accessed and edited from anywhere
global.onlineUsers = {};
global.lastSeen = {};
global.exemptedUserInfos = [
  "-contacts",
  "-__v",
  "-requests",
  "-notifications",
  "-chats",
];

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
  app.use(
    cors({
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
      origin: ["http://localhost:3000", "http://localhost:3000"],
    })
  );
}
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRoutes);
app.use("/api/query/user", userQueryRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/request", requestRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/user", userEditRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/chat", chatRoutes);

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
  } catch (error) {
    console.log(error);
  }
};

app.get("/api", (req, res) => {
  res.send("this is the konnect API & web sockets");
});

// error handling
app.use((err, req, res, next) => {
  const { stack, status, message, ...additionalInfo } = err;

  const TEMPLATE = {
    success: false,
    status: status || 500,
    message,
    additionalInfo,
  };

  const isProduction = process.env.NODE_ENV === "production";

  if (!isProduction) console.log(message);

  return res
    .status(status || 500)
    .json(isProduction ? TEMPLATE : { stack, ...TEMPLATE });
});

httpServer.listen(process.env.PORT || 3001, () => {
  dbConnect();
  mongoose.connection.on("disconnected", () => console.log("db disconnected"));
  mongoose.connection.on("connected", () => console.log("db connected"));
  console.log("listening on 3001");
});
// instrument(io, { auth: false });
