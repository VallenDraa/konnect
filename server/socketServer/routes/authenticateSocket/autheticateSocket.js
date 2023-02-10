import Authenticate from "./authenticateClass.js";
import axios from "axios";

export default function authenticationSocket(socket) {
  socket.on("login", async ({ userId, token }, cb) => {
    const userTarget = new Authenticate(userId, socket.id);

    const { success, user, message } = userTarget.addUserToOnline(
      global.onlineUsers
    );

    if (success) {
      Object.assign(global.onlineUsers, user);
      Object.assign(global.onlineUsers.aliases, { [socket.id]: userId });

      cb(success, null);
      socket.emit("is-authorized", { authorized: true });

      // get all chat history if the user is authenticated
      try {
        const { data } = await axios.get(
          `${process.env.API_URL}/chat/get_all_chat_id`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // emit the statu to the user that is currently chatting
        delete global.lastSeen[userId];
        socket.to("chats").emit("change-user-status", userId, "online");

        socket.emit("download-all-chat-ids", data);
      } catch (error) {
        socket.emit("error", error);
      }
    } else {
      cb(success, message);
      socket.emit("is-authorized", { authorized: false });
    }
  });

  socket.on("logout", async (userId, cb) => {
    const userTarget = new Authenticate(userId, socket.id);

    const { success, user, message } = userTarget.removeOnlineUser(
      global.onlineUsers
    );

    if (success) {
      delete global.onlineUsers[userId];
      delete global.onlineUsers.aliases[socket.id];
      delete global.refreshTokens[userId];
      cb(success, null);
    } else {
      cb(success, message);
    }

    const time = new Date();

    // emit the statu to the user that is currently chatting
    global.lastSeen[userId] = time;
    socket.to("chats").emit("change-user-status", userId, time);

    console.log(global.onlineUsers, "logged out");
    console.log(global.refreshTokens);
  });
}

/**
 *  force remove user from the online users list
 * @param {*} socket
 */
export const tabClose = async (socket) => {
  const userId = global.onlineUsers.aliases[socket.id];

  delete global.onlineUsers[userId];
  delete global.onlineUsers.aliases[socket.id];
  delete global.refreshTokens[userId];

  // emit the status to the user that is currently chatting
  const time = new Date();
  global.lastSeen[userId] = time;
  socket.to("chats").emit("change-user-status", userId, time);

  console.log(`user with the socket id of ${socket.id} has forced quit`);
};
