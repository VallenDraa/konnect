import mongoose from 'mongoose';

const GroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    profilePicture: { type: String, required: false, default: '' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    messageLog: [{ type: String, content: String, default: null }],
  },
  { timestamps: true }
);

const GroupModel = mongoose.model('user', GroupSchema);

export default GroupModel;
