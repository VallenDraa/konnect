import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import messages from './socketServer/messagesSocket/messagesSocket.js';
import mongoose from 'mongoose';
import authRoutes from './api/routes/authRoutes.js';
import userQueryRoutes from './api/routes/userQueryRoutes.js';
import contactQueryRoutes from './api/routes/contactQueryRoutes.js';
import requestRoutes from './api/routes/requestRoutes.js';
import notificationRoutes from './api/routes/notificationRoutes.js';
import userEditRoutes from './api/routes/userEditRoutes.js';
import messagesRoutes from './api/routes/messagesRoutes.js';
import cookieParser from 'cookie-parser';
import authentication, {
  tabClose,
} from './socketServer/authenticateSocket/autheticateSocket.js';
import sendContactRequest from './socketServer/contactsRelated/sendContactRequestSocket/sendContactRequestSocket.js';
import contactRequestRespond from './socketServer/contactsRelated/contactRequestRespondSocket/contactRequestRespondSocket.js';
import unfriend from './socketServer/contactsRelated/unfriendSocket/unfriendSocket.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: ['http://localhost:3000', 'http://192.168.1.5:3000'] },
});
// can be accessed and edited from anywhere
global.onlineUsers = {};
global.exemptedUserInfos = [
  // '-contacts.chat'
  '-__v',
];

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
  app.use(
    cors({
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
      origin: ['http://localhost:3000', 'http://192.168.1.5:3000'],
    })
  );
}
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', authRoutes);
app.use('/api/query/user', userQueryRoutes);
app.use('/api/query/contact', contactQueryRoutes);
app.use('/api/request', requestRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/user', userEditRoutes);
app.use('/api/messages', messagesRoutes);

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
  } catch (error) {
    console.log(error);
  }
};

io.on('connection', (socket) => {
  console.log('new user connected with id: ' + socket.id);

  socket.on('disconnect', () => tabClose(socket));

  authentication(socket);
  messages(socket);
  sendContactRequest(socket);
  contactRequestRespond(socket);
  unfriend(socket);
});

app.get('/api', (req, res) => {
  res.send('this is the konnect API & web sockets');
});

// error handling
app.use((err, req, res, next) => {
  const { stack, status, message, ...additionalInfo } = err;

  const TEMPLATE = {
    success: false,
    status: status || 500,
    message,
    additionalInfo,
  };

  const isProduction = process.env.NODE_ENV === 'production';

  isProduction && console.log(err);

  return res
    .status(status || 500)
    .json(isProduction ? TEMPLATE : { stack, ...TEMPLATE });
});

httpServer.listen(3001, () => {
  dbConnect();
  mongoose.connection.on('disconnected', () => console.log('db disconnected'));
  mongoose.connection.on('connected', () => console.log('db connected'));
  console.log('listening on 3001');
});
