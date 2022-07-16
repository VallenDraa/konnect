import mongoose from 'mongoose';

const PrivateChatSchema = new mongoose.Schema(
  {
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],

    chat: [
      {
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
        to: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
        msgType: String,
        content: String,
        isSent: { type: Boolean, default: false },
        readAt: { type: Date, default: null },
        time: { type: Date, default: new Date() },
      },
    ],
  },
  { timestamps: true }
);

const PrivateChat = mongoose.model('private_chat', PrivateChatSchema);

export default PrivateChat;
