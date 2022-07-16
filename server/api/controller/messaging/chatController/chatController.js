import jwt from 'jsonwebtoken';
import PrivateChat from '../../../../model/PrivateChat.js';
import User from '../../../../model/User.js';

export const getAllChatHistory = async (req, res, next) => {
  const { token } = req.body;

  // new way
  try {
    const { _id } = jwt.decode(token);
    const { chats } = await User.findById(_id).select('chats').lean();
    console.log(chats);

    if (chats.length > 0) {
      const privateChats = await PrivateChat.where({
        _id: { $in: chats },
      })
        .populate({
          path: 'users',
          select: ['username', 'status', 'initials', 'profilePicture'],
        })
        .lean();

      // formatting the result
      const formattedPC = privateChats.map((pc) => {
        const user = pc.users.filter((user) => user._id.toString() !== _id)[0];

        return { chatId: pc._id, user, chat: pc.chat };
      });

      const response = {
        currentUser: _id,
        messageLogs: [...formattedPC],
        success: true,
      };

      res.json(response);
    } else {
      const response = {
        currentUser: _id,
        messageLogs: [],
        success: true,
      };

      res.json(response);
    }
  } catch (error) {
    next(error);
  }

  // get chat log from contact
  // try {
  //   const { _id } = jwt.decode(token);
  //   const { contacts } = await User.findById(_id)
  //     .select([
  //       'contacts.user',
  //       'contacts.lastMessageReadAt',
  //       'contacts.chat',
  //       'contacts.-_id',
  //     ])
  //     .populate({
  //       path: 'contacts.user',
  //       select: ['username', 'status', 'initials', 'profilePicture'],
  //     })
  //     .lean();

  //   // assemble object to send back to the client
  //   const response = {
  //     currentUser: _id,
  //     messageLogs: [...contacts],
  //     success: true,
  //   };

  //   res.json(response);
  // } catch (error) {
  //   console.log(error);
  //   next(error);
  // }
};

export const getChatHistory = async (req, res, next) => {};
