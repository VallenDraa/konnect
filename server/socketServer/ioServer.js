import authentication, {
  tabClose,
} from "./routes/authenticateSocket/autheticateSocket.js";
import contactRequestRespond from "./routes/contactsRelated/contactRequestRespondSocket/contactRequestRespondSocket.js";
import contactRequest from "./routes/contactsRelated/sendContactRequestSocket/sendContactRequestSocket.js";
import unfriend from "./routes/contactsRelated/unfriendSocket/unfriendSocket.js";
import messages from "./routes/messagesSocket/messagesSocket.js";
import onlineStatus from "./routes/onlineStatus/onlineStatus.js";

export default function socketInit(io) {
  io.on("connection", (socket) => {
    socket.on("join-room", (room) => socket.join(room));
    socket.on("leave-room", (room) => socket.leave(room));
    socket.on("disconnect", () => tabClose(socket));
    console.log("new user connected with id: " + socket.id);

    onlineStatus(socket);
    authentication(socket);
    messages(socket);
    contactRequest(socket);
    contactRequestRespond(socket);
    unfriend(socket);
  });
}
