import mongoose from "mongoose";

const GroupChatSchema = new mongoose.Schema(
  {
    name: { type: String, required: false, default: null },
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    description: { type: String, default: "" },
    type: { type: String, default: "group" },
    profilePicture: { type: String, default: "" },
    chat: [
      {
        date: String,
        messages: [
          { type: mongoose.Schema.Types.ObjectId, ref: "group_message" },
        ],
      },
    ],
    hasQuit: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        date: { type: Date, default: new Date() },
      },
    ],
  },
  { timestamps: true }
);

const GroupChat = mongoose.model("group_chat", GroupChatSchema);

export default GroupChat;
