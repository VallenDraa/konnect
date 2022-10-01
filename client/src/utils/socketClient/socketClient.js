import { io } from "socket.io-client";

const link = ["192.168.1.6", "localhost"];

const socket = io(`ws://${link[0]}:3001`);

export default socket;
