import axios from "axios";
import jwt from "jsonwebtoken";
import { createErrorNonExpress } from "../../../utils/createError.js";

export default function messagesSocket(socket) {
  socket.on("new-msg", async (message, chatType, token) => {
    // save message to the database
    try {
      const { data } = await axios.post(
        `${process.env.API_URL}/messages/${chatType}/save_message`,
        { message },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // send the chat id, timesent, and new msg id if everythiBng is daijoubu
      if (data.success) {
        socket.emit("msg-sent", {
          success: true,
          to: message.to,
          timeSent: message.time,
          msgId: data.msgId,
          chatId: data.chatId,
        });

        socket
          .to(global.onlineUsers[message.to] || message.chatId)
          .emit("receive-msg", {
            success: true,
            timeSent: message.time,
            message: { ...message, _id: data.msgId, isSent: true },
            chatId: data.chatId,
            chatType,
          });
      }
    } catch (error) {
      console.error(error);
      socket.emit("msg-sent", false, {
        timeSent: message.time,
        to: message.to,
      });
      socket.emit("error", error);
    }

    // save message to reciever and send the message if target is online
  });

  socket.on("private-read-msg", async (time, token, senderId, msgIds) => {
    try {
      if (new Date(time).getMonth().toString() === NaN.toString()) {
        throw createErrorNonExpress(400, "invalid time arguments");
      }

      // set all passed in messages isRead field to true
      const { data } = await axios.put(
        `${process.env.API_URL}/messages/private/read_message`,
        { time, msgIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // check if sender is online
      const isSenderOnline = senderId in global.onlineUsers;

      if (isSenderOnline) {
        const senderSocketId = global.onlineUsers[senderId];
        const { _id: recipientId } = jwt.decode(token);

        socket
          .to(senderSocketId)
          .emit("private-msg-on-read", data.success, recipientId, time);
      }
    } catch (e) {
      console.log(e);
      socket.emit("error", e);
    }
  });

  socket.on("group-read-msg", async (time, token, groupId, userId, msgIds) => {
    try {
      if (new Date(time).getMonth().toString() === NaN.toString()) {
        throw createErrorNonExpress(400, "invalid time arguments");
      }

      // set all passed in messages isRead field to true
      // const { data } = await axios.put(
      //   `${process.env.API_URL}/messages/group/read_message`,
      //   { time, msgIds },
      //   { headers: { Authorization: `Bearer ${token}` } }
      // );

      // check if sender is online

      socket.to(groupId).emit("group-msg-on-read", true, groupId, userId, time);
    } catch (e) {
      console.log(e);
      socket.emit("error", e);
    }
  });

  socket.on("download-a-chat-history", async ({ token, pcIds, gcIds }) => {
    const url = `${
      process.env.API_URL
    }/chat/get_chat_history?pcIds=${pcIds.join(",")}&gcIds=${gcIds.join(",")}`;

    try {
      const { data } = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      socket.emit("a-chat-history-downloaded", data);
    } catch (error) {
      socket.emit("error", error);
    }
  });
}
