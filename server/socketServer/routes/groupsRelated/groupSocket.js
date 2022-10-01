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
        createdAt: data.createdAt,
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
      } else {
        throw new Error("Fail to make group !");
      }
    } catch (error) {
      console.error(error);
      socket.emit("error", error);
    }
  });
  socket.on("edit-group", async ({ token, userPw, ...newGroupInfos }) => {
    try {
      const { data } = await axios.put(
        `${process.env.API_URL}/group/edit_group`,
        { ...newGroupInfos, userPw },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        socket.emit("receive-edit-group", {
          ...newGroupInfos,
          newNotices: data.newNotices,
        });
        socket.to(newGroupInfos._id).emit("receive-edit-group", {
          ...newGroupInfos,
          newNotices: data.newNotices,
        });
      } else {
        throw new Error("Fail to save the group edit");
      }
    } catch (error) {
      // console.error(error);
      socket.emit("error", error);
    }
  });
  socket.on("delete-group", async (groupId) => {});
  socket.on("join-group", async (groupId) => socket.join(groupId));
  socket.on("add-to-group", async (groupId) => socket.kick(groupId));
  socket.on("quit-group", async (groupId) => socket.kick(groupId));
}
