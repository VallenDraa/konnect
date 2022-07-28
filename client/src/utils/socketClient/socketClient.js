import { io } from "socket.io-client";

const socket = io("ws://192.168.1.4:3001");

export default socket;
