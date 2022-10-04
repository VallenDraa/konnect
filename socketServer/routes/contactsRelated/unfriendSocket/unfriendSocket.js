import { createErrorNonExpress } from "../../../../utils/createError.js";
import axios from "axios";

export default function unfriendSocket(socket) {
  socket.on("remove-contact", async (myId, targetId, token) => {
    const isTargetOnline = targetId in global.onlineUsers;
    const targetSocketId = isTargetOnline ? global.onlineUsers[targetId] : null;

    // remove the target id from the my contact
    try {
      const { data } = await axios.put(
        `${process.env.API_URL}/user/unfriend`,
        { myId, targetId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        socket.emit("receive-remove-contact", {
          success: true,
          idToRemove: targetId,
        });

        if (isTargetOnline) {
          socket.to(targetSocketId).emit("receive-remove-contact", {
            success: true,
            idToRemove: myId,
          });
        }
      } else {
        const { message, status } = senderData.data;
        socket.emit("error", createErrorNonExpress(status, message));
      }
    } catch (error) {
      socket.emit("error", error);
    }
  });
}
