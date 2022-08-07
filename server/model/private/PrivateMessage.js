import mongoose from "mongoose";

export const PrivateMessageSchema = new mongoose.Schema({
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: "private_chat" },
  by: { type: mongoose.Schema.Types.ObjectId, ref: "user", default: null },
  to: { type: mongoose.Schema.Types.ObjectId, ref: "user", default: null },
  msgType: {
    type: String,
    enum: ["notice", "text", "image", "video", "link", "call"],
  },
  content: mongoose.Schema.Types.Mixed,
  isSent: { type: Boolean, default: false },
  readAt: { type: Date, default: null },
  time: { type: Date, default: new Date() },
});

const PrivateMessage = mongoose.model("private_message", PrivateMessageSchema);

export default PrivateMessage;
