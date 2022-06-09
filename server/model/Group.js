import mongoose from 'mongoose';

const GroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    profilePicture: { type: String, required: false },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    messageLog: [{ type: mongoose.Schema.Types.ObjectId, ref: 'message' }],
  },
  { timestamps: true }
);

const GroupModel = mongoose.model('user', GroupSchema);

export default GroupModel;
