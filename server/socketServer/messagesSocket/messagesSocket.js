import axios from 'axios';
import jwt from 'jsonwebtoken';
import { createErrorNonExpress } from '../../utils/createError.js';

export default function messages(socket) {
  socket.on('new-msg', async (message, token) => {
    // console.log(message);
    const isTargetOnline = message.to in global.onlineUsers;
    const targetSocketId = global.onlineUsers[message.to];

    // save message to sender
    try {
      const { data } = await axios.put(
        `${process.env.API_URL}/messages/save_message`,
        {
          token,
          message,
          mode: 'sender',
        }
      );

      if (data.success) {
        socket.emit('msg-sent', data.success, {
          timeSent: message.time,
          to: message.to,
        });
      }
    } catch (error) {
      console.log(error);
      socket.emit('msg-sent', false, {
        timeSent: message.time,
        to: message.to,
      });
      // console.log(error);
      socket.emit('error', error);
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
      socket.to(targetSocketId).emit('error', error);
    }
  });

  socket.on('read-msg', async (time, token, senderId, cb) => {
    try {
      if (new Date(time).getMonth().toString() === NaN.toString()) {
        throw createErrorNonExpress(400, 'invalid time arguments');
      }

      // set all passed in messages isRead field to true
      const { data } = await axios.put(
        `${process.env.API_URL}/messages/read_message`,
        { time, token, senderId }
      );

      // check if sender is online
      const isSenderOnline = senderId in global.onlineUsers;

      if (isSenderOnline) {
        const senderSocketId = global.onlineUsers[senderId];
        const { _id } = jwt.decode(token); //this'll be the recipient id

        socket.to(senderSocketId).emit('msg-on-read', data.success, _id, time);
      }
    } catch (e) {
      socket.emit('error', e);
    }
  });
}
