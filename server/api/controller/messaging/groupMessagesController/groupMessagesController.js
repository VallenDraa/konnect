export const saveMessage = async (req, res, next) => {
  try {
    // //extract the message from the body and save it seperately to the database
    const { message } = req.body;
    // if (message._id === null) delete message._id; //this will prevent null _id when creating a new message instance
    // const newMsgTimeGroup = new Date(message.time).toLocaleDateString();

    // // find the chat log according to the ids
    // const [privateChat] = await PrivateChat.where({
    //   $or: [
    //     { "users.0": message.to, "users.1": message.by },
    //     { "users.0": message.by, "users.1": message.to },
    //   ],
    // });

    // // check if chat log exists
    // if (!privateChat) {
    //   // construct the new private chat
    //   const newPrivateChat = {
    //     "users.0": message.by,
    //     "users.1": message.to,
    //     chat: [{ date: newMsgTimeGroup, messages: [] }],
    //   };
    //   const newSavedPc = await PrivateChat.create(newPrivateChat);

    //   // contruct the message to save
    //   const msgToPush = { ...message, isSent: true, chatId: newSavedPc._id };
    //   const newMsg = await PrivateMessage.create(msgToPush);

    //   // push the new message to the newly created private chat
    //   newSavedPc.chat[0].messages.push(newMsg._id);
    //   await newSavedPc.save();

    //   // get the new chat log id and push it to the chat list of the users that are chatting
    //   await User.updateMany(
    //     { _id: { $in: [newMsg.by, newMsg.to] } },
    //     { $push: { privateChats: newSavedPc._id } }
    //   );

    //   return res.status(201).json({
    //     chatId: newSavedPc._id,
    //     msgId: newMsg._id,
    //     success: true,
    //   });
    // } else {
    //   // contruct the message to save
    //   const msgToPush = { ...message, isSent: true, chatId: privateChat._id };
    //   const newMsg = await PrivateMessage.create(msgToPush);

    //   const lastTimeLogIdx = privateChat.chat.length - 1;
    //   const date = new Date(
    //     privateChat.chat[lastTimeLogIdx].date
    //   ).toLocaleDateString();

    //   date === newMsgTimeGroup
    //     ? privateChat.chat[lastTimeLogIdx].messages.push(newMsg._id)
    //     : privateChat.chat.push({
    //         date: newMsgTimeGroup,
    //         messages: [newMsg._id],
    //       });

    //   await privateChat.save();
    res
      .status(201)
      .json({ chatId: message.chatId, msgId: new Date(), success: true });
    // }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const readMessage = async (req, res, next) => {
  try {
    const { time, msgIds } = req.body;
    console.log(
      "🚀 ~ file: groupMessagesController.js ~ line 16 ~ readMessage ~  time, msgIds",
      time,
      msgIds
    );

    // // check if the time passed in is of a date format
    // if (new Date(time).getMonth().toString() === NaN.toString()) {
    //   return createError(next, 400, "invalid time arguments");
    // }

    // await PrivateMessage.updateMany({ _id: { $in: msgIds } }, { readAt: time });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const deleteMessage = async (req, res, next) => {};
