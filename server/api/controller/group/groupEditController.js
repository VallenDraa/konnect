import GroupChat from "../../../model/group/GroupChat.js";
import GroupMessage from "../../../model/group/GroupMessage.js";
import User from "../../../model/User.js";
import createError from "../../../utils/createError.js";

export const makeGroup = async (req, res, next) => {
  try {
    const { name, users, fullInfo } = req.body;

    if (!name) {
      return createError(
        next,
        400,
        "Please provide a group name to create a new group."
      );
    }

    if (
      !users ||
      !users.admins ||
      !users.members ||
      users.admins.length === 0 ||
      users.members.length === 0
    ) {
      return createError(
        next,
        400,
        "Please provide users to create a new group."
      );
    }

    const { admins, members } = users;
    const { _id } = await GroupChat.create({ admins, members, name });
    const newGc = await GroupChat.findById(_id).populate(["admins", "members"]);

    const newNoticeMsg = await GroupMessage.create({
      chatId: newGc._id,
      content: `${newGc.admins[0].username} created a new group`,
      msgType: "notice",
    });

    const newTimeGroup = {
      date: new Date(newNoticeMsg.time).toLocaleDateString(),
      messages: [newNoticeMsg._id],
    };

    await GroupChat.updateOne({ _id }, { $push: { chat: newTimeGroup } });

    // update the groupchats list in users db
    await User.updateMany(
      { _id: { $in: [...admins, ...members] } },
      { $push: { groupChats: newGc._id } }
    );

    if (fullInfo) {
      const { _id, ...extras } = newGc._doc;
      return res
        .status(201)
        .json({ chatId: _id, ...extras, newNotice, success: true });
    }

    res.status(201).json({
      chatId: newGc._id,
      createdAt: newGc.createdAt,
      newNotice: { ...newTimeGroup, messages: [newNoticeMsg] },
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

export const editGroup = async (req, res, next) => {
  try {
    const { newName, newDescription, _id } = req.body;

    const updatedGroup = await GroupChat.findById(_id);
    const { name: oldName, description: oldDesc } = updatedGroup;

    if (oldName !== newName) updatedGroup.name = newName;
    if (oldDesc !== newDescription) updatedGroup.description = newDescription;

    await updatedGroup.save();

    res.status(204).json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const joinGroup = async (req, res, next) => {
  try {
    const { groupId, userId } = req.body;

    await GroupChat.findByIdAndUpdate(groupId, {
      $push: { admins: userId, members: userId },
      $pull: { hasQuit: userId },
    });

    res.status(204).json({ success: true });
  } catch (error) {}
};

export const quitGroup = async (req, res, next) => {
  try {
    const { groupId, userId } = req.body;

    await GroupChat.findByIdAndUpdate(groupId, {
      $pull: { admins: userId, members: userId },
      $push: { hasQuit: userId },
    });

    res.status(204).json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const deleteGroup = async (req, res, next) => {
  try {
    const { _id } = req.body;

    await GroupChat.findByIdAndDelete(_id);

    res.status(204).json({ success: true });
  } catch (error) {
    next(error);
  }
};
