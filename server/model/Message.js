import mongoose from "mongoose";

export const MessageSchema = new mongoose.Schema({
  by: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  to: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  msgType: String,
  content: mongoose.Schema.Types.Mixed,
  isSent: { type: Boolean, default: false },
  readAt: { type: Date, default: null },
  time: { type: Date, default: new Date() },
});

const Message = mongoose.model("message", MessageSchema);

export default Message;
