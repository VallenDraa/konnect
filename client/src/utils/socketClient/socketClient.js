import { io } from "socket.io-client";

const socket = io(`ws://kon-nect.herokuapp.com`);

export default socket;
