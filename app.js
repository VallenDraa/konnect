import express from "express";
import { createServer } from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";
import authRoutes from "./api/routes/authRoutes.js";
import userQueryRoutes from "./api/routes/userQueryRoutes.js";
import contactsRoutes from "./api/routes/contactRoutes.js";
import requestRoutes from "./api/routes/requestRoutes.js";
import notificationRoutes from "./api/routes/notificationRoutes.js";
import userEditRoutes from "./api/routes/userEditRoutes.js";
import privateMessagesRoutes from "./api/routes/privateMessagesRoutes.js";
import groupMessagesRoutes from "./api/routes/groupMessagesRoutes.js";
import groupRoutes from "./api/routes/groupRoutes.js";
import chatRoutes from "./api/routes/chatRoutes.js";
import cookieParser from "cookie-parser";
import socketInit from "./socketServer/socketServer.js";

const app = express();
export const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://kon-nect.herokuapp.com/"]
        : ["http://localhost:3000", "http://192.168.126.43:3000"],
    // 172.27.138.123 FST 4
    // 192.168.126.43 hotspot
  },
});

// can be accessed and edited from anywhere
global.onlineUsers = { aliases: {} };
global.refreshTokens = {};
global.lastSeen = {};
global.exemptedUserInfos = [
  "-contacts",
  "-__v",
  "-requests",
  "-notifications",
  "-privateChats",
  "-groupChats",
];

if (process.env.NODE_ENV !== "production") {
  try {
    const dotenv = await import("dotenv");
    const { default: cors } = await import("cors");

    dotenv.config();
    app.use(
      cors({
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"],
        origin:
          process.env.NODE_ENV === "production"
            ? ["https://kon-nect.herokuapp.com/"]
            : ["http://localhost:3000", "http://192.168.126.43:3000"],
        // 172.27.138.123 FST 4
        // 192.168.126.43 hotspot
      })
    );
  } catch (error) {
    console.error(error);
  }
}

app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRoutes);
app.use("/api/query/user", userQueryRoutes);
app.use("/api/group", groupRoutes);
app.use("/api/contact", contactsRoutes);
app.use("/api/request", requestRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/user", userEditRoutes);
app.use("/api/messages/private", privateMessagesRoutes);
app.use("/api/messages/group", groupMessagesRoutes);
app.use("/api/chat", chatRoutes);

app.get("/api", (req, res) => {
  res.send("this is the konnect API & web sockets");
});

if (process.env.NODE_ENV === "production") {
  try {
    const { default: path } = await import("path");
    const { default: url } = await import("url");

    const __filename = url.fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  } catch (e) {
    console.error(e);
  }
}
// error handling
app.use((err, req, res, next) => {
  const { stack, status, message, ...additionalInfo } = err;
  const isProduction = process.env.NODE_ENV === "production";
  const TEMPLATE = {
    success: false,
    status: status || 500,
    message,
    additionalInfo,
  };

  if (!isProduction) console.error(err);

  return res
    .status(status || 500)
    .json(isProduction ? TEMPLATE : { stack, ...TEMPLATE });
});

httpServer.listen(process.env.PORT || 3001, async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    mongoose.connection.on("disconnected", () =>
      console.log("db disconnected")
    );
    mongoose.connection.on("connected", () => {
      console.log("db connected");
    });

    console.log("listening on 3001");
    socketInit(io);
  } catch (error) {
    console.log(
      "🚀 ~ file: server.js ~ line 121 ~ httpServer.listen ~ error",
      error.message
    );
  }
});
