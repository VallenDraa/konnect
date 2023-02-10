import { io } from "socket.io-client";

const socket = io(`wss://konnect-api.up.railway.app`);

export default socket;
