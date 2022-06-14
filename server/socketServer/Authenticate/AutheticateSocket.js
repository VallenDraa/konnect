import Authenticate from './AuthenticateClass.js';

let onlineUsers = {};

export default function authentication(socket) {
  socket.on('login', (userId, cb) => {
    const userTarget = new Authenticate(userId, socket.id);

    const { success, user, message } = userTarget.addUserToOnline(onlineUsers);

    if (success) {
      Object.assign(onlineUsers, user);
      cb(success, null);
      socket.emit('is-authorized', { authorized: true });
    } else {
      cb(success, message);
      socket.emit('is-authorized', { authorized: false });
    }
    console.log(onlineUsers, 'login');
  });

  socket.on('logout', (userId, cb) => {
    const userTarget = new Authenticate(userId, socket.id);

    const { success, user, message } = userTarget.removeOnlineUser(onlineUsers);

    if (success) {
      delete onlineUsers[socket.id];
      cb(success, null);
    } else {
      cb(success, message);
    }

    console.log(onlineUsers, 'log out');
  });
}

/**
 *  force remove user from the online users list
 * @param {*} socket
 */
export const tabClose = (socket) => {
  delete onlineUsers[socket.id];
  console.log(`user ${socket.id} has been force removed`);
};
