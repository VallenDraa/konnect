import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String, default: '' },
    contacts: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
        messageLog: [{ type: mongoose.Schema.Types.ObjectId, ref: 'message' }],
      },
    ],
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'group' }],
  },
  { timestamps: true }
);

const UserModel = mongoose.model('user', UserSchema);

export default UserModel;
