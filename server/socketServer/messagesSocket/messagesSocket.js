import axios from 'axios';
import { createErrorNonExpress } from '../../utils/createError.js';

export default function messages(socket) {
  socket.on('new-message', async (message, token) => {
    const isTargetOnline = message.to in global.onlineUsers;
    const targetSocketId = global.onlineUsers[message.to];

    // save message to sender
    try {
      const sender = await axios.put(
        `${process.env.API_URL}/messages/save_message`,
        { token, message, mode: 'sender' }
      );

      socket.emit('update-client-data', sender.data);
    } catch (error) {
      console.log(error);
      socket.emit('error', createErrorNonExpress(error));
    }

    // save message to reciever
    try {
      const receiver = await axios.put(
        `${process.env.API_URL}/messages/save_message`,
        { token, message, mode: 'receiver' }
      );

      socket.to(targetSocketId).emit('update-client-data', receiver.data);
    } catch (error) {
      console.log(error);
      socket.to(targetSocketId).emit('error', createErrorNonExpress(error));
    }

    if (isTargetOnline) {
      socket.to(targetSocketId).emit('receive-message', message);
    }
  });
}
