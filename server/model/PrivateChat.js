import mongoose from "mongoose";
import MessageSchema from "./Message.js";

const PrivateChatSchema = new mongoose.Schema(
  {
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    type: { type: String, default: "private" },
    chat: [MessageSchema],
  },
  { timestamps: true }
);

const PrivateChat = mongoose.model("private_chat", PrivateChatSchema);

export default PrivateChat;
