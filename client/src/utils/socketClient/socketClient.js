import { io } from 'socket.io-client';

const socket = io('ws://192.168.1.5:3001');

export default socket;
