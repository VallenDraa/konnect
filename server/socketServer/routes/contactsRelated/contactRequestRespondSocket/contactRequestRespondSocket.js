import axios from "axios";

export default function contactRequestRespondSocket(socket) {
  socket.on("contact-requests-response", async (payload) => {
    const { recipientId, senderId, answer } = payload;
    const isSenderOnline = senderId in global.onlineUsers;

    // updating the recipients data
    try {
      const { data } = await axios.put(
        `${process.env.API_URL}/request/respond_to_contact_request`,
        { recipientId, answer, senderId },
        { headers: { Authorization: `Bearer ${payload.token}` } }
      );

      socket.emit("receive-contact-request-response", {
        ...payload,
        ...data,
        type: "inbox",
      });
      // check if sender is online
      if (isSenderOnline) {
        socket
          .to(global.onlineUsers[senderId])
          .emit("receive-contact-request-response", {
            ...payload,
            ...data,
            type: "outbox",
          });
      }
    } catch (error) {
      console.error(error);
      socket.emit("receive-contact-request-response", error);
      if (isSenderOnline) {
        socket
          .to(global.onlineUsers[senderId])
          .emit("receive-contact-request-response", error);
      }
    }
  });
}
