import jwt from 'jsonwebtoken';
import User from '../../../../model/User';

export const getChatHistoryPreviews = async (req, res, next) => {
  const { token } = req.body;

  try {
    const { _id } = jwt.decode(token);
    const chats = await User.findById(_id)
      .select('contacts.user')
      .populate({
        select: ['username', 'initials', 'profilePicture'],
        path: 'contacts.user',
      });
  } catch (error) {
    next(error);
  }
};

export const getChatHistory = async (req, res, next) => {};
