export default function roomsSocket(socket) {
  socket.on("join-room", (room) => socket.join(room));
  socket.on("leave-room", (room) => socket.leave(room));
}
