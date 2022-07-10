import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    firstName: { type: String, default: '' },
    status: { type: String, default: '' },
    lastName: { type: String, default: '' },
    initials: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String, default: '' },
    contacts: [
      {
        lastMessageReadAt: { type: Date, default: null },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
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
    ],
    // this'll contain any other type of notifications other than requests
    notifications: {
      inbox: [
        {
          iat: { type: Date, default: new Date() },
          seen: { type: Boolean, default: false },
          contents: { type: mongoose.Schema.Types.Mixed },
        },
      ],
      outbox: [
        {
          iat: { type: Date, default: new Date() },
          seen: { type: Boolean, default: false },
          contents: { type: mongoose.Schema.Types.Mixed },
        },
      ],
    },
    // this'll only contain requests notifications
    requests: {
      contacts: {
        inbox: [
          {
            by: { type: mongoose.Schema.ObjectId, ref: 'user' },
            seen: { type: Boolean, default: false },
            answer: { type: Boolean, default: null },
            iat: { type: Date, default: new Date() },
          },
        ],
        outbox: [
          {
            by: { type: mongoose.Schema.ObjectId, ref: 'user' },
            seen: { type: Boolean, default: false },
            answer: { type: Boolean, default: null },
            iat: { type: Date, default: new Date() },
          },
        ],
      },
    },
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'group' }],
    settings: {
      general: { type: Object, default: {} },
      calls: { type: Object, default: {} },
      messages: { type: Object, default: {} },
    },
  },
  { timestamps: true }
);

const User = mongoose.model('user', UserSchema);

export default User;
