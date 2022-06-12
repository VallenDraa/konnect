import Authenticate from './AuthenticateClass.js';

let onlineUsers = [];

export default function authentication(socket) {
  socket.on('login', (userId, cb) => {
    const userTarget = new Authenticate(userId, socket.id);

    const { success, user, message } = userTarget.addUserToOnline(onlineUsers);

    if (success) {
      onlineUsers.push(user);
      cb(success, null);
    } else {
      cb(success, message);
    }
  });

  socket.on('logout', (userId, cb) => {
    const userTarget = new Authenticate(userId, socket.id);

    const { success, user, message } = userTarget.removeOnlineUser(onlineUsers);

    if (success) {
      onlineUsers = onlineUsers.filter((onlineUser) => onlineUser !== user);
      cb(success, null);
    } else {
      cb(success, message);
    }
  });
}
