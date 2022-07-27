import User from "../../../../model/User.js";
import PrivateChat from "../../../../model/PrivateChat.js";
import createError from "../../../../utils/createError.js";

export const saveMessage = async (req, res, next) => {
  const { to, ...messageData } = req.body.message;

  // save message new test
  try {
    // find the chat log according to the ids
    const [privateChat] = await PrivateChat.where({
      $or: [
        { "users.0": to, "users.1": messageData.by },
        { "users.0": messageData.by, "users.1": to },
      ],
    });
    const msgToPush = { ...req.body.message, isSent: true };

    // check if chat log exists
    if (!privateChat) {
      const newPrivateChat = {
        "users.0": messageData.by,
        "users.1": to,
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
        message: msgToPush,
      });
    } else {
      privateChat.chat.push(msgToPush);
      await privateChat.save();
      return res.json({
        chatId: privateChat._id,
        success: true,
        message: msgToPush,
      });
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const readMessage = async (req, res, next) => {
  const { time, token, senderId, chatLogId } = req.body;

  // check if the time passed in is of a date format
  if (new Date(time).getMonth().toString() === NaN.toString()) {
    return createError(next, 400, "invalid time arguments");
  }

  // individual message read status
  try {
    // this is the id for the recipient whose lastMessageReadAt will be updated
    const chatLog = await PrivateChat.findById(chatLogId);
    const { chat } = chatLog;

    // set the latest unread message to read
    const chatIdxLen = chat.length - 1;
    if (chatIdxLen > 0) {
      for (let i = chatIdxLen; i >= 0; i--) {
        if (chat[i].readAt !== null) break;

        chatLog.chat[i].readAt = time;
      }
    } else {
      chatLog.chat[chatIdxLen].readAt = time;
    }

    // save the updated message log
    await chatLog.save();
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    next(error);
  }

  // new
  // try {
  //   // this is the id for the recipient whose lastMessageReadAt will be updated
  //   const { _id } = res.locals.tokenData
  //   const chatLog = await PrivateChat.findById(chatLogId);

  //   for (const i in chatLog.users) {
  //     const currUserId = chatLog.users[i].user.toString();

  //     if (currUserId === _id) {
  //       chatLog.users[i].lastMessageReadAt = time;
  //     } else {
  //       chatLog.users[i].lastMessageReadAt = null;
  //     }
  //   }
  //   await chatLog.save();
  //   res.json({ success: true });
  // } catch (error) {
  //   next(error);
  // }
};

export const deleteMessage = async (req, res, next) => {};
