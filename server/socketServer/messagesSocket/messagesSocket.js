import axios from 'axios';
import { createErrorNonExpress } from '../../utils/createError.js';

export default function messages(socket) {
  socket.on('new-message', async (message, token) => {
    console.log(message);

    const isTargetOnline = message.to in global.onlineUsers;
    const targetSocketId = global.onlineUsers[message.to];

    // save message to sender
    try {
      await axios.put(`${process.env.API_URL}/messages/save_message`, {
        token,
        message,
        mode: 'sender',
      });
    } catch (error) {
      // console.log(error);
      socket.emit('error', createErrorNonExpress(error));
    }

    // save message to reciever and send the message if target is online
    try {
      const { data } = await axios.put(
        `${process.env.API_URL}/messages/save_message`,
        { token, message, mode: 'receiver' }
      );

      if (isTargetOnline) {
        socket.to(targetSocketId).emit('receive-message', data);
      }
    } catch (error) {
      // console.log(error);
      socket.to(targetSocketId).emit('error', createErrorNonExpress(error));
    }
  });
}
