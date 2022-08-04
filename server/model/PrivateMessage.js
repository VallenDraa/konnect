import mongoose from "mongoose";

export const PrivateMessageSchema = new mongoose.Schema({
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: "private_chat" },
  by: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  to: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  msgType: String,
  content: mongoose.Schema.Types.Mixed,
  isSent: { type: Boolean, default: false },
  readAt: { type: Date, default: null },
  time: { type: Date, default: new Date() },
});

const PrivateMessage = mongoose.model("private_message", PrivateMessageSchema);

export default PrivateMessage;
