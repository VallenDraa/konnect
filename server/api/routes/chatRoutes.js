import express from "express";
const router = express.Router();
import {
  getAllChatHistory,
  getAllChatId,
  getChatHistory,
} from "../controller/messaging/chatController/chatController.js";
import verifyToken from "../controller/auth/tokenController.js";

router.get("/get_all_chat_history", verifyToken, getAllChatHistory);
router.get("/get_chat_history", verifyToken, getChatHistory);
router.get("/get_all_chat_id", verifyToken, getAllChatId);

export default router;
