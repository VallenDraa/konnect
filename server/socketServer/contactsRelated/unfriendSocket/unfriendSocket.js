import { createErrorNonExpress } from '../../../utils/createError.js';
import axios from 'axios';

export default function unfriend(socket) {
  socket.on('remove-contact', async (myId, targetId, token) => {
    const isTargetOnline = targetId in global.onlineUsers;
    const targetSocketId = isTargetOnline ? global.onlineUsers[targetId] : null;

    // remove the target id from the my contact
    try {
      const senderData = await axios.put(
        `${process.env.API_URL}/user/unfriend`,
        { myId, targetId, token }
      );

      if (senderData.data.success) {
        socket.emit('update-client-data', senderData.data, { unfriend: true });
      } else {
        const { message, status } = senderData.data;
        socket.emit('error', createErrorNonExpress(null, status, message));
      }
    } catch (error) {
      socket.emit('error', createErrorNonExpress(error));
    }

    // remove the my id from the target's contact
    try {
      const targetData = await axios.put(
        `${process.env.API_URL}/user/unfriend`,
        { myId: targetId, targetId: myId, token }
      );

      //   only send back info to the target client if target is online
      if (isTargetOnline) {
        if (targetData.data.success) {
          console.log(targetSocketId);
          socket
            .to(targetSocketId)
            .emit('update-client-data', targetData.data, { unfriend: true });
        } else {
          const { message, status } = senderData.data;
          socket.emit('error', createErrorNonExpress(null, status, message));
        }
      }
    } catch (error) {
      isTargetOnline && socket.emit('error', createErrorNonExpress(error));
    }
  });
}
