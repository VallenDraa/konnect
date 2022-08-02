import mongoose from "mongoose";

const PrivateChatSchema = new mongoose.Schema(
  {
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    type: { type: String, default: "private" },
    chat: [
      {
        date: String,
        messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "message" }],
      },
    ],
  },
  { timestamps: true }
);

const PrivateChat = mongoose.model("private_chat", PrivateChatSchema);

export default PrivateChat;
