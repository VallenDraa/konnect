import Authenticate from './authenticateClass.js';
import axios from 'axios';

export default function authentication(socket) {
  socket.on('login', async ({ userId, token }, cb) => {
    const userTarget = new Authenticate(userId, socket.id);

    const { success, user, message } = userTarget.addUserToOnline(
      global.onlineUsers
    );

    if (success) {
      Object.assign(global.onlineUsers, user);
      cb(success, null);
      socket.emit('is-authorized', { authorized: true });

      // get all chat history if the user is authenticated
      try {
        const { data } = await axios.post(
          `${process.env.API_URL}/chat/get_all_chat_history`,
          { token }
        );

        if (data.success) {
          socket.emit('download-all-chats', data);
        } else {
          console.error(error);
          socket.emit('error', data);
        }
      } catch (error) {
        console.error(error);

        socket.emit('error', error);
      }
    } else {
      cb(success, message);
      socket.emit('is-authorized', { authorized: false });
    }
    console.log(global.onlineUsers, 'login');
  });

  socket.on('logout', (userId, cb) => {
    const userTarget = new Authenticate(userId, socket.id);

    const { success, user, message } = userTarget.removeOnlineUser(
      global.onlineUsers
    );

    if (success) {
      delete global.onlineUsers[userId];
      cb(success, null);
    } else {
      cb(success, message);
    }

    console.log(global.onlineUsers, 'log out');
  });
}

/**
 *  force remove user from the online users list
 * @param {*} socket
 */
export const tabClose = (socket) => {
  const objKey = Object.keys(global.onlineUsers).filter(
    (key) => global.onlineUsers[key] === socket.id
  )[0];
  console.log(objKey);

  delete global.onlineUsers[objKey];
  console.log(`user ${socket.id} has been force removed`);
};
