import axios from "axios";

export default function groupSocket(socket) {
  socket.on("make-new-group", async (name, users, token) => {
    const { members, admins } = users;

    try {
      const { data } = await axios.post(
        `${process.env.API_URL}/group/make_group`,
        { users, name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      socket.join(data.chatId);

      const info = {
        success: true,
        chatId: data.chatId,
        newNotice: data.newNotice,
        name,
        users,
      };

      if (data.success) {
        socket.emit("receive-make-new-group", { ...info, initiator: true });

        // check if members are online
        for (const member of members) {
          if (member in global.onlineUsers) {
            const targetSocketId = global.onlineUsers[member];

            socket
              .to(targetSocketId)
              .emit("receive-make-new-group", { ...info, initiator: false });
            socket.to(targetSocketId).emit("join-group", info.chatId);
          }
        }
      }
    } catch (error) {
      console.error(error);
      socket.emit("error", error);
    }
  });

  socket.on("join-group", async (groupId) => socket.join(groupId));
}
