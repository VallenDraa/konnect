export default function messages(socket) {
  socket.on('new-message', (msg) => {
    const isTargetOnline = msg.to in global.onlineUsers;
    const targetSocketId = global.onlineUsers[msg.to];

    console.log(msg);

    if (isTargetOnline) {
      socket.to(targetSocketId).emit('receive-message', msg);
    }
  });
}
