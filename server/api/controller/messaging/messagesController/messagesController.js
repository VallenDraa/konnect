import User from "../../../../model/User.js";
import PrivateChat from "../../../../model/PrivateChat.js";
import createError from "../../../../utils/createError.js";
import Message from "../../../../model/Message.js";

export const saveMessage = async (req, res, next) => {
  try {
    //extract the message from the body and save it seperately to the database
    const { message } = req.body;
    if (message._id === null) delete message._id; //this will prevent null _id when creating a new message instance
    const msgToPush = { ...message, isSent: true };
    const newMsg = await Message.create(msgToPush);
    const newMsgTimeGroup = new Date(newMsg.time).toLocaleDateString();

    // find the chat log according to the ids
    const [privateChat] = await PrivateChat.where({
      $or: [
        { "users.0": newMsg.to, "users.1": newMsg.by },
        { "users.0": newMsg.by, "users.1": newMsg.to },
      ],
    });

    // check if chat log exists
    if (!privateChat) {
      const newPrivateChat = {
        "users.0": newMsg.by,
        "users.1": newMsg.to,
        chat: [{ date: newMsgTimeGroup, messages: [newMsg._id] }],
      };

      // get the new chat log id and push it to the chat list of the users that are chatting
      const { _id: newPcId } = await PrivateChat.create(newPrivateChat);
      await User.updateMany(
        { _id: { $in: [newMsg.by, newMsg.to] } },
        { $push: { privates: newPcId } }
      );

      return res.json({ chatId: newPcId, msgId: newMsg._id, success: true });
    } else {
      const lastTimeLogIdx = privateChat.chat.length - 1;
      const date = new Date(
        privateChat.chat[lastTimeLogIdx].date
      ).toLocaleDateString();

      date === newMsgTimeGroup
        ? privateChat.chat[lastTimeLogIdx].messages.push(newMsg._id)
        : privateChat.chat.push({
            date: newMsgTimeGroup,
            messages: [newMsg._id],
          });

      await privateChat.save();
      res.json({ chatId: privateChat._id, msgId: newMsg._id, success: true });
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const readMessage = async (req, res, next) => {
  const { time, msgIds } = req.body;

  // check if the time passed in is of a date format
  if (new Date(time).getMonth().toString() === NaN.toString()) {
    return createError(next, 400, "invalid time arguments");
  }

  try {
    await Message.updateMany({ _id: { $in: msgIds } }, { readAt: time });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const deleteMessage = async (req, res, next) => {};
