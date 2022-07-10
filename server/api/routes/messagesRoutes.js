import express from 'express';
import verifyToken from '../controller/auth/tokenController.js';
import {
  deleteMessage,
  readMessage,
  saveMessage,
} from '../controller/messaging/messagesController/messagesController.js';
const router = express.Router();

router.put('/save_message', verifyToken, saveMessage);
router.put('/read_message', verifyToken, readMessage);
router.put('/delete_message', verifyToken, deleteMessage);

export default router;
