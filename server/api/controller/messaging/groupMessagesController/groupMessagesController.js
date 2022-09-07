import GroupChat from "../../../../model/group/GroupChat.js";
import GroupMessage from "../../../../model/group/GroupMessage.js";

export const saveMessage = async (req, res, next) => {
  try {
    // //extract the message from the body and save it seperately to the database
    const { message } = req.body;
    const { beenReadBy, ...parsedMsg } = message;

    if (parsedMsg._id === null) delete parsedMsg._id; //this will prevent null _id when creating a new message instance
    const newMsgTimeGroup = new Date(parsedMsg.time).toLocaleDateString();
    const newMsgTemp = await GroupMessage.create({
      ...parsedMsg,
      isSent: true,
    });

    // update the read list to include the sender
    const newMsg = await GroupMessage.findByIdAndUpdate(
      newMsgTemp._id,
      { beenReadBy },
      { new: true }
    );

    const groupChat = await GroupChat.findById(parsedMsg.chatId);
    const lastTimeGroup = groupChat.chat[groupChat.chat.length - 1];

    // check if the lastTimegroup matches the incoming message's one
    lastTimeGroup.date === newMsgTimeGroup
      ? lastTimeGroup.messages.push(newMsg._id)
      : groupChat.chat.push({ date: newMsgTimeGroup, messages: [newMsg._id] });

    await groupChat.save();

    res
      .status(201)
      .json({ chatId: message.chatId, msgId: newMsg._id, success: true });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const readMessage = async (req, res, next) => {
  try {
    const { time, msgIds, user } = req.body;

    // check if the time passed in is of a date format
    if (new Date(time).getMonth().toString() === NaN.toString()) {
      return createError(next, 400, "invalid time arguments");
    }

    const msgs = await GroupMessage.find({ _id: { $in: msgIds } });

    for (const msg of msgs) {
      if (!msg.beenReadBy.includes((u) => u.user.toString() === user)) {
        msg.beenReadBy.push({ user, readAt: time });

        await msg.save();
      }
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const deleteMessage = async (req, res, next) => {};
