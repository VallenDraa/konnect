import mongoose from "mongoose";

export const GroupMessageSchema = new mongoose.Schema({
  chatId: [{ type: mongoose.Schema.Types.ObjectId, ref: "group_chat" }],
  by: { type: mongoose.Schema.Types.ObjectId, ref: "user", default: null },
  msgType: {
    type: String,
    enum: ["notice", "text", "image", "video", "link", "call"],
  },
  content: mongoose.Schema.Types.Mixed,
  isSent: { type: Boolean, default: false },
  beenReadBy: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
      readAt: { type: Date, default: null },
    },
  ],
  time: { type: Date, default: new Date() },
});

const GroupMessage = mongoose.model("group_message", GroupMessageSchema);

export default GroupMessage;
