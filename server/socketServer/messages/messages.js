export const getNewMessage = (socket) => {
  socket.on('new-message', (msg) => {
    socket.broadcast.emit('receive-message', msg);
  });
};
