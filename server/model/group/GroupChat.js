import mongoose from "mongoose";

const GroupChatSchema = new mongoose.Schema(
  {
    name: { type: String, required: false, default: null },
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    profilePicture: { type: String, default: "" },
    chat: [
      {
        date: String,
        messages: [
          { type: mongoose.Schema.Types.ObjectId, ref: "group_message" },
        ],
      },
    ],
  },
  { timestamps: true }
);

const GroupChat = mongoose.model("group_chat", GroupChatSchema);

export default GroupChat;
