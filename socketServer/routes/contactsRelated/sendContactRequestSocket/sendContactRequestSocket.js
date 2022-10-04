import axios from "axios";

export default function contactRequestSocket(socket) {
  socket.on("send-add-contact", async (payload) => {
    const { recipientId, senderId, token } = payload;
    const isRecipientOnline = recipientId in global.onlineUsers;
    const recipientSocketId = isRecipientOnline
      ? global.onlineUsers[recipientId]
      : null;

    try {
      const { data } = await axios.put(
        `${process.env.API_URL}/request/send_contact_request`,
        { recipientId, senderId, token },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      socket.emit("receive-send-add-contact", {
        success: data.success,
        notif: data.senderNotif,
        type: "outbox",
      });
      // check if the recipient is online
      if (isRecipientOnline) {
        socket.to(recipientSocketId).emit("receive-send-add-contact", {
          success: data.success,
          notif: data.recipientNotif,
          type: "inbox",
        });
      }
    } catch (error) {
      // console.error(error);
      socket.emit("error", error);
      if (isRecipientOnline) {
        socket.to(recipientSocketId).emit("error", error);
      }
    }
  });

  socket.on("cancel-add-contact", async (payload) => {
    const { senderId, recipientId, token } = payload;
    const isRecipientOnline = recipientId in global.onlineUsers;
    const recipientSocketId = isRecipientOnline
      ? global.onlineUsers[recipientId]
      : null;

    try {
      const { data } = await axios.put(
        `${process.env.API_URL}/request/delete_contact_request`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      socket.emit("receive-cancel-add-contact", {
        senderId,
        recipientId,
        success: data.success,
        type: "outbox",
      });
      // check if the recipient is online
      if (isRecipientOnline) {
        socket.to(recipientSocketId).emit("receive-cancel-add-contact", {
          senderId,
          recipientId,
          success: data.success,
          type: "inbox",
        });
      }
    } catch (error) {
      // console.error(error);
      socket.emit("error", error);
      if (isRecipientOnline) {
        socket.to(recipientSocketId).emit("error", error);
      }
    }
  });
}
