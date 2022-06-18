import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    initials: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String, default: '' },
    contacts: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
        messageLog: [{ type: mongoose.Schema.Types.ObjectId, ref: 'message' }],
      },
    ],
    requests: {
      contacts: {
        to: [{ type: mongoose.Schema.ObjectId, ref: 'user' }],
        from: [{ type: mongoose.Schema.ObjectId, ref: 'user' }],
      },
    },
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'group' }],
    settings: Object,
  },
  { timestamps: true }
);

const UserModel = mongoose.model('user', UserSchema);

export default UserModel;
