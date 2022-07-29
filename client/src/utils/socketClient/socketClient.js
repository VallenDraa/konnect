import { io } from "socket.io-client";

const socket = io("ws://localhost:3001");

export default socket;
