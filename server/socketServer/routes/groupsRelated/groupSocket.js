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
  socket.on("remove-group", async ({ token, groupId }) => {
    try {
      const { data } = await axios.put(
        `${process.env.API_URL}/group/remove_group`,
        { groupId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        socket.emit("receive-remove-group", { groupId });
      } else {
        throw new Error("Fail to remove group from the chats list !");
      }
    } catch (error) {
      socket.emit(error);
    }
  });
  socket.on("join-group", async (groupId) => socket.join(groupId));
  socket.on("add-to-group", async (groupId) => socket.kick(groupId));
  socket.on("quit-group", async ({ groupId, userId, token }) => {
    try {
      const { data } = await axios.put(
        `${process.env.API_URL}/group/quit_group`,
        { groupId, userId, noticeType: "quit" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        socket.leave(groupId);

        socket.emit("receive-quit-group", {
          groupId,
          userId,
          token,
          newNotices: data.newNotices,
          isAdmin: data.isAdmin,
          exitDate: data.exitDate,
        });
        socket.to(groupId).emit("receive-quit-group", {
          groupId,
          userId,
          newNotices: data.newNotices,
          isAdmin: data.isAdmin,
          exitDate: data.exitDate,
        });
      } else {
        throw new Error("Fail to quit the group");
      }
    } catch (error) {
      console.error(error);
      socket.emit("error", error);
    }
  });
}
