import axios from "axios";
import jwt from "jsonwebtoken";
import { createErrorNonExpress } from "../../../utils/createError.js";

export default function messages(socket) {
  socket.on("new-msg", async (message, token) => {
    const isTargetOnline = message.to in global.onlineUsers;
    const targetSocketId = global.onlineUsers[message.to];

    // save message to the database
    try {
      const { data } = await axios.put(
        `${process.env.API_URL}/messages/save_message`,
        { message },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // send the chat id, timesent, and new msg id if everything is daijoubu
      if (data.success) {
        socket.emit("msg-sent", {
          success: true,
          to: message.to,
          timeSent: message.time,
          msgId: data.msgId,
        });

        if (isTargetOnline) {
          const newMsgData = {
            timeSent: message.time,
            message: { ...message, _id: data.msgId, isSent: true },
            ...data,
          };

          socket.to(targetSocketId).emit("receive-msg", newMsgData);
        }
      }
    } catch (error) {
      console.log(error);
      socket.emit("msg-sent", false, {
        timeSent: message.time,
        to: message.to,
      });
      console.error(error);
      socket.emit("error", error);
    }

    // save message to reciever and send the message if target is online
  });

  socket.on("read-msg", async (time, token, senderId, msgIds) => {
    try {
      if (new Date(time).getMonth().toString() === NaN.toString()) {
        throw createErrorNonExpress(400, "invalid time arguments");
      }

      // set all passed in messages isRead field to true
      const { data } = await axios.put(
        `${process.env.API_URL}/messages/read_message`,
        { time, msgIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // check if sender is online
      const isSenderOnline = senderId in global.onlineUsers;

      if (isSenderOnline) {
        const senderSocketId = global.onlineUsers[senderId];
        const { _id } = jwt.decode(token); //this'll be the recipient id

        socket.to(senderSocketId).emit("msg-on-read", data.success, _id, time);
      }
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
