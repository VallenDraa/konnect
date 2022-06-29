export default function messages(socket) {
  socket.on('new-message', (msg) => {
    console.log(msg);
    socket.broadcast.emit('receive-message', msg);
  });
}
