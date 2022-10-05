import { io } from "socket.io-client";

// 172.27.138.123 FST 4
// 192.168.126.43 hotspot

const socket = io(`ws://192.168.126.43:3001`);

export default socket;
