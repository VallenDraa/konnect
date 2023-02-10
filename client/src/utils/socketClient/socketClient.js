import { io } from "socket.io-client";

const socket = io(`wss://konnect-api.vercel.app`);

export default socket;
