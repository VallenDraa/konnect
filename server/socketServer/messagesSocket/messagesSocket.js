import axios from 'axios';
import jwt from 'jsonwebtoken';
import { createErrorNonExpress } from '../../utils/createError.js';

export default function messages(socket) {
  socket.on('new-msg', async (message, token) => {
    const isTargetOnline = message.to in global.onlineUsers;
    const targetSocketId = global.onlineUsers[message.to];

    console.log(message);
    // save message to the database
    try {
      const { data } = await axios.put(
        `${process.env.API_URL}/messages/save_message`,
        { message },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // send success flag if everything is daijoubu
      if (data.success) {
        socket.emit('msg-sent', { timeSent: message.time, ...data });
      }

      if (isTargetOnline) {
        socket.to(targetSocketId).emit('receive-msg', data);
      }
    } catch (error) {
      socket.emit('msg-sent', false, {
        timeSent: message.time,
        to: message.to,
      });
      console.error(error);
      socket.emit('error', error);
    }

    // save message to reciever and send the message if target is online
  });

  socket.on('read-msg', async (time, token, senderId, chatLogId) => {
    try {
      if (new Date(time).getMonth().toString() === NaN.toString()) {
        throw createErrorNonExpress(400, 'invalid time arguments');
      }

      // set all passed in messages isRead field to true
      const { data } = await axios.put(
        `${process.env.API_URL}/messages/read_message`,
        { time, senderId, chatLogId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // check if sender is online
      const isSenderOnline = senderId in global.onlineUsers;

      if (isSenderOnline) {
        const senderSocketId = global.onlineUsers[senderId];
        const { _id } = jwt.decode(token); //this'll be the recipient id

        socket.to(senderSocketId).emit('msg-on-read', data.success, _id, time);
      }
    } catch (e) {
      console.log(e);
      socket.emit('error', e);
    }
  });
}
