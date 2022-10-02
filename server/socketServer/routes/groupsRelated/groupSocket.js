import axios from "axios";

export default function groupSocket(socket) {
  socket.on("make-new-group", async (name, users, token) => {
    try {
      const { members, admins } = users;
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
  socket.on("edit-group", async ({ token, userPw, newName, newDesc, _id }) => {
    try {
      const { data } = await axios.put(
        `${process.env.API_URL}/group/edit_group`,
        { newName, newDesc, _id, userPw },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        socket.emit("receive-edit-group", {
          newName,
          newDesc,
          _id,
          newNotices: data.newNotices,
        });
        socket.to(_id).emit("receive-edit-group", {
          newName,
          newDesc,
          _id,
          newNotices: data.newNotices,
        });
      } else {
        throw new Error("Fail to save the group edit");
      }
    } catch (error) {
      console.error(error);
      socket.emit("error", error);
    }
  });
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
  socket.on("invite-to-group", async ({ groupId, invitedIds, token }) => {
    try {
      const { data } = await axios.put(
        `${process.env.API_URL}/group/invite_to_group`,
        { invitedIds, groupId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        for (const id of invitedIds) {
          if (id in global.onlineUsers) {
            const targetSocketId = global.onlineUsers[id];

            socket
              .to(targetSocketId)
              .emit("receive-invite-to-group", { notif: data.notif });
          }
        }

        socket.emit("receive-invite-to-group", {
          newNotice: data.newNotice,
          groupId,
        });

        socket.to(groupId).emit("receive-invite-to-group", {
          newNotice: data.newNotice,
          groupId,
        });
      } else {
        throw new Error("Fail to invite new participants to the group");
      }
    } catch (error) {
      socket.emit(error);
    }
  });

  socket.on("accept-group-invite", async ({ groupId, userId, token }) => {
    try {
      const { data } = await axios.put(
        `${process.env.API_URL}/group/accept_invitation`,
        { userId, groupId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        socket.join(groupId);

        socket.emit("receive-accept-invitation", {
          newNotice: data.newNotice,
          groupId,
          userId,
        });

        socket.to(groupId).emit("receive-accept-invitation", {
          newNotice: data.newNotice,
          groupId,
          userId,
        });
      } else {
        throw new Error("Fail to accept group invitation");
      }
    } catch (error) {
      socket.emit(error);
    }
  });

  socket.on("reject-group-invite", async ({ groupId, userId, token }) => {
    try {
      const { data } = await axios.put(
        `${process.env.API_URL}/group/reject_invitation`,
        { userId, groupId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        socket.emit("receive-reject-invitation", {
          success: data.success,
          groupId,
          userId,
        });

        socket.to(groupId).emit("receive-reject-invitation", {
          success: data.success,
          groupId,
          userId,
        });
      } else {
        throw new Error("Fail to reject group invitation");
      }
    } catch (error) {
      socket.emit(error);
    }
  });

  socket.on("quit-group", async ({ groupId, userId, token }) => {
    try {
      const { data } = await axios.put(
        `${process.env.API_URL}/group/quit_group`,
        { groupId, userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        socket.leave(groupId);

        socket.emit("receive-quit-group", {
          groupId,
          userId,
          newNotices: data.newNotices,
          isAdmin: data.isAdmin,
          exitDate: data.exitDate,
          newAdmin: data.newAdmin,
        });

        socket.to(groupId).emit("receive-quit-group", {
          groupId,
          userId,
          newNotices: data.newNotices,
          isAdmin: data.isAdmin,
          exitDate: data.exitDate,
          newAdmin: data.newAdmin,
        });
      } else {
        throw new Error("Fail to quit the group");
      }
    } catch (error) {
      socket.emit("error", error);
    }
  });
  socket.on(
    "kick-from-group",
    async ({ groupId, kickedId, kickerId, token }) => {
      try {
        const { data } = await axios.put(
          `${process.env.API_URL}/group/kick_from_group`,
          { groupId, kickedId, kickerId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (data.success) {
          socket.leave(groupId);

          socket.emit("receive-kick-from-group", {
            groupId,
            userId: kickedId,
            token,
            newNotices: data.newNotices,
            isAdmin: data.isAdmin,
            exitDate: data.exitDate,
            newAdmin: data.newAdmin,
          });
          socket.to(groupId).emit("receive-kick-from-group", {
            groupId,
            userId: kickedId,
            newNotices: data.newNotices,
            isAdmin: data.isAdmin,
            exitDate: data.exitDate,
            newAdmin: data.newAdmin,
          });
        } else {
          throw new Error("Fail to quit the group");
        }
      } catch (error) {
        socket.emit("error", error);
      }
    }
  );
  socket.on("give-admin-status", async ({ groupId, userId, userPw, token }) => {
    try {
      const { data } = await axios.put(
        `${process.env.API_URL}/group/give_admin_status`,
        { groupId, userId, userPw },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        socket.emit("receive-give-admin-status", {
          groupId,
          userId,
          newNotice: data.newNotice,
        });
        socket.to(groupId).emit("receive-give-admin-status", {
          groupId,
          userId,
          newNotice: data.newNotice,
        });
      } else {
        throw new Error("Fail to give admin status");
      }
    } catch (error) {
      console.log(
        "🚀 ~ file: groupSocket.js ~ line 161 ~ socket.on ~ error",
        error
      );
      socket.emit("error", error);
    }
  });
  socket.on(
    "revoke-admin-status",
    async ({ groupId, userId, userPw, token }) => {
      try {
        const { data } = await axios.put(
          `${process.env.API_URL}/group/revoke_admin_status`,
          { groupId, userId, userPw },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (data.success) {
          socket.emit("receive-revoke-admin-status", {
            groupId,
            userId,
            newNotice: data.newNotice,
          });
          socket.to(groupId).emit("receive-revoke-admin-status", {
            groupId,
            userId,
            newNotice: data.newNotice,
          });
        } else {
          throw new Error("Fail to revoke admin status");
        }
      } catch (error) {
        console.log("🚀 ~ file: groupSocket.js ~ line 185 ~ error", error);
        socket.emit("error", error);
      }
    }
  );
}
