import jwt from "jsonwebtoken";

export default function onlineStatus(socket) {
  socket.on("is-user-online", (userId, token) => {
    try {
      let status;

      // check if the user passed a valid token
      if (!jwt.verify(token, process.env.JWT_SECRET)) {
        return socket.emit("error", new Error("invalid Token"));
      } else {
        // check if user is online
        const isOnline = userId in global.onlineUsers;

        if (isOnline) {
          status = "online";
        } else {
          // get the user's last seen
          const lastSeen = global.lastSeen[userId];

          status = lastSeen ? lastSeen : "offline";
        }
        socket.emit("receive-is-user-online", userId, status);
      }
    } catch (error) {
      console.error(error);
      socket.emit(error);
    }
  });
}
