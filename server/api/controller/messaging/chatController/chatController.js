import jwt from 'jsonwebtoken';
import User from '../../../../model/User.js';

export const getAllChatHistory = async (req, res, next) => {
  const { token } = req.body;

  try {
    const { _id } = jwt.decode(token);
    const { contacts } = await User.findById(_id)
      .select([
        'contacts.user',
        'contacts.lastMessageReadAt',
        'contacts.chat',
        'contacts.-_id',
      ])
      .populate({
        path: 'contacts.user',
        select: ['username', 'status', 'initials', 'profilePicture'],
      });

    // assemble object to send back to the client
    const response = {
      currentUser: _id,
      messageLogs: [...contacts],
      success: true,
    };

    res.json(response);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getChatHistory = async (req, res, next) => {};
