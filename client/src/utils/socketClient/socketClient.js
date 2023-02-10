import { io } from "socket.io-client";

const socket = io(`wss://konnect.vercel.app`);

export default socket;
