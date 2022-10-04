import { io } from "socket.io-client";

const link = ["192.168.1.6", "localhost"];

const socket = io(`ws://${link[1]}:3001`);

export default socket;
