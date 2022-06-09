import mongoose, { Schema } from 'mongoose';

const MessageSchema = new mongoose.Schema(
  {
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    content: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

const MessageModel = mongoose.model('message', MessageSchema);

export default MessageModel;
