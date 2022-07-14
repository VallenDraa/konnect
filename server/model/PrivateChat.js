import mongoose from 'mongoose';

const PrivateChatSchema = new mongoose.Schema(
  {
    users: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
        lastMessageReadAt: { type: Date, default: null },
      },
    ],

    chat: [
      {
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
        msgType: String,
        content: String,
        isSent: false,
        time: { type: Date, default: new Date() },
      },
    ],
  },
  { timestamps: true }
);

const PrivateChat = mongoose.model('private_chat', PrivateChatSchema);

export default PrivateChat;
