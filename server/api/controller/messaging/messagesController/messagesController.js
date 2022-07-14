import User from '../../../../model/User.js';
import PrivateChat from '../../../../model/PrivateChat.js';
import createError from '../../../../utils/createError.js';
import jwt from 'jsonwebtoken';

export const saveMessage = async (req, res, next) => {
  const { to, ...messageData } = req.body.message;

  // console.log(req.body.message);

  // save message new test
  try {
    // find the chat log according to the ids
    const [privateChat] = await PrivateChat.where({
      $or: [
        { 'users.0.user': to, 'users.1.user': messageData.by },
        { 'users.0.user': messageData.by, 'users.1.user': to },
      ],
    });
    const msgToPush = { ...messageData, isSent: true };

    // check if chat log exists
    if (!privateChat) {
      const newPrivateChat = {
        'users.0.user': messageData.by,
        'users.1.user': to,
        chat: [msgToPush],
      };

      // get the new chat log id and push it to the chat list of the users that are chatting
      const { _id } = await PrivateChat.create(newPrivateChat);
      await User.updateMany(
        { _id: { $in: [messageData.by, to] } },
        { $push: { chats: _id } }
      );

      return res.json({
        chatId: _id,
        success: true,
        message: req.body.message,
      });
    } else {
      privateChat.chat.push(msgToPush);
      await privateChat.save();
      return res.json({
        chatId: privateChat._id,
        success: true,
        message: req.body.message,
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const readMessage = async (req, res, next) => {
  const { time, token, senderId, chatLogId } = req.body;

  // check if the time passed in is of a date format

  if (new Date(time).getMonth().toString() === NaN.toString()) {
    return createError(next, 400, 'invalid time arguments');
  }

  // new
  try {
    // this is the id for the recipient whose lastMessageReadAt will be updated
    const { _id } = jwt.decode(token);
    const chatLog = await PrivateChat.findById(chatLogId);

    for (const i in chatLog.users) {
      const currUserId = chatLog.users[i].user.toString();

      if (currUserId === _id) {
        chatLog.users[i].lastMessageReadAt = time;
      } else {
        chatLog.users[i].lastMessageReadAt = null;
      }
    }
    await chatLog.save();
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const deleteMessage = async (req, res, next) => {};

// const setToRead = (contacts, contactIndex, toBeRead) => {
//   let timesTarget = toBeRead;

//   const updatedChat = contacts[contactIndex].chat.map((chat) => {
//     let isUpdated;

//     for (const time of timesTarget) {
//       isUpdated = chat.time.toString() === new Date(time).toString();

//       if (isUpdated) {
//         timesTarget = timesTarget.filter((item) => item !== time);
//         break;
//       }
//     }

//     return isUpdated ? { ...chat, isRead: true } : chat;
//   });

//   return updatedChat._doc;
// };

// export const readMessage = async (req, res, next) => {
//   const { toBeRead, token, senderId } = req.body;

//   try {
//     const { _id } = jwt.decode(token);

//     const result = await User.where('_id', [_id, senderId]);

//     const sender = result.find(({ _id }) => _id.toString() === senderId);
//     const recipient = result.find((user) => user._id.toString() === _id);

//     // loop over the user contacts and find the correct message to be set to read
//     const senIndex = recipient.contacts.findIndex(
//       ({ user }) => user.toString() === senderId
//     );

//     recipient.contacts[senIndex].chat = setToRead(
//       recipient.contacts,
//       senIndex,
//       toBeRead
//     );

//     const recIndex = sender.contacts.findIndex(
//       ({ user }) => user.toString() === _id
//     );
//     recipient.contacts[recIndex].chat = setToRead(
//       sender.contacts,
//       recIndex,
//       toBeRead
//     );

//     recipient.markModified('contacts.chat');
//     sender.markModified('contacts.chat');
//     await recipient.save();
//     await sender.save();

//     res.json({ success: true });
//   } catch (error) {
//     console.log(error);
//     next(error);
//   }
// };
