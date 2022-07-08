import express from 'express';
const router = express.Router();
import { getAllChatHistory } from '../controller/messaging/chatController/chatController.js';
import verifyToken from '../controller/auth/tokenController.js';

router.post('/get_all_chat_history', verifyToken, getAllChatHistory);

export default router;
