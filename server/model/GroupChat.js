import mongoose from 'mongoose';

const GroupChatSchema = new mongoose.Schema(
  {
    users: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
      validate: [usersLimit, '{PATH} exceeds the limit of 2'],
    },
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

function usersLimit(val) {
  return val.length <= 2;
}

const GroupChat = mongoose.model('Group_Chat', GroupChatSchema);

export default GroupChat;
