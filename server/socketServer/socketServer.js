import authenticationSocket, {
  tabClose,
} from "./routes/authenticateSocket/autheticateSocket.js";
import contactRequestRespondSocket from "./routes/contactsRelated/contactRequestRespondSocket/contactRequestRespondSocket.js";
import contactRequestSocket from "./routes/contactsRelated/sendContactRequestSocket/sendContactRequestSocket.js";
import unfriendSocket from "./routes/contactsRelated/unfriendSocket/unfriendSocket.js";
import groupSocket from "./routes/groupsRelated/groupSocket.js";
import messagesSocket from "./routes/messagesSocket/messagesSocket.js";
import onlineStatusSocket from "./routes/onlineStatus/onlineStatus.js";
import roomsSocket from "./routes/rooms/roomsSocket.js";

export default function socketInit(io) {
  io.on("connection", (socket) => {
    socket.on("disconnect", () => tabClose(socket));
    console.log("new user connected with id: " + socket.id);

    roomsSocket(socket);
    onlineStatusSocket(socket);
    authenticationSocket(socket);
    messagesSocket(socket);
    contactRequestSocket(socket);
    contactRequestRespondSocket(socket);
    unfriendSocket(socket);
    groupSocket(socket);
  });
}
