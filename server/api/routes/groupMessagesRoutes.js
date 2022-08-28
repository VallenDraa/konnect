import express from "express";
import verifyToken from "../controller/auth/tokenController.js";
import {
  deleteMessage,
  readMessage,
  saveMessage,
} from "../controller/messaging/groupMessagesController/groupMessagesController.js";
const router = express.Router();

router.post("/save_message", verifyToken, saveMessage);
router.put("/read_message", verifyToken, readMessage);
router.delete("/delete_message", verifyToken, deleteMessage);

export default router;
