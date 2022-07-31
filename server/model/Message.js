import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  by: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  to: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  msgType: String,
  content: String,
  isSent: { type: Boolean, default: false },
  readAt: { type: Date, default: null },
  time: { type: Date, default: new Date() },
});

export default MessageSchema;
