import GroupChat from "../../../model/group/GroupChat.js";
import GroupMessage from "../../../model/group/GroupMessage.js";
import User from "../../../model/User.js";
import createError from "../../../utils/createError.js";
import bcrypt from "bcrypt";

const newNotice = async (next, gc, contents) => {
  try {
    const date = new Date().toLocaleDateString();
    const newNotices = [];

    // making a new notice for each content
    for (const content of contents) {
      newNotices.push(
        await GroupMessage.create({
          chatId: gc._id,
          content,
          msgType: "notice",
        })
      );
    }

    // check if there is already an existing time group
    if (gc.chat[gc.chat.length - 1].date !== date) {
      const newTimeGroup = { date, messages: newNotices.map((m) => m._id) };
      gc.chat.push(newTimeGroup);
    } else {
      gc.chat[gc.chat.length - 1].messages.push(
        ...newNotices.map((m) => m._id)
      );
    }
    await gc.save();

    return { date, messages: newNotices };
  } catch (error) {
    next(error);
  }
};

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

    // make a new notice regarding the creation of the group
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
      return res.status.json({
        chatId: _id,
        ...extras,
        newNotice,
        success: true,
      });
    }

    res.json({
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
    const { newName, newDesc, _id, userPw } = req.body;
    const { _id: userId } = res.locals.tokenData;

    // for verifying the password
    const { password, username } = await User.findById(userId)
      .select(["password", "username"])
      .lean();
    const isPwValid = await bcrypt.compare(userPw, password);

    if (!isPwValid) {
      return createError(
        next,
        403,
        "Invalid password, unable to make edits to the group"
      );
    } else {
      // find and parse the updated data
      const updatedGroup = await GroupChat.findById(_id);
      const { name: oldName, description: oldDesc } = updatedGroup;
      const newNoticeMsgs = [];

      // check for changes
      if (oldName !== newName) {
        updatedGroup.name = newName;
        newNoticeMsgs.push(
          `${username} changed the group name from '${oldName}' to '${newName}'`
        );
      }
      if (oldDesc !== newDesc) {
        updatedGroup.description = newDesc;
        newNoticeMsgs.push(`${username} changed the group description`);
      }

      // push the new notice message
      const newNotices = await newNotice(next, updatedGroup, newNoticeMsgs);

      await updatedGroup.save();

      res.json({ success: true, newNotices });
    }
  } catch (error) {
    console.error(error);
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

    res.json({ success: true });
  } catch (error) {}
};

export const quitGroup = async (req, res, next) => {
  try {
    let newNoticeMsg,
      isAdmin = false;
    const { groupId, userId, noticeType } = req.body;
    const user = await User.findById(userId);
    const newGc = await GroupChat.findById(groupId);
    const exitDate = new Date();

    // GROUP UPDATE
    // update the admin list
    newGc.admins = newGc.admins.filter((a) => {
      if (a._id.toString() === userId) {
        isAdmin = true;
      }

      return a._id.toString() !== userId;
    });
    // update the members list if the target user is not an admin
    if (!isAdmin) {
      newGc.members = newGc.members.filter((m) => m._id.toString() !== userId);
    }
    // push the target user into the hasQuit array
    newGc.hasQuit.push({ user: userId, date: exitDate });

    // USER UPDATE
    user.groupChats = user.groupChats.filter((gc) => gc.toString !== userId);
    user.hasQuitGroup.push({ group: groupId, date: exitDate });

    switch (noticeType) {
      case "quit":
        newNoticeMsg = await newNotice(next, newGc, [
          `${user.username} has quit this group`,
        ]);
        break;

      case "kick":
        newNoticeMsg = await newNotice(next, newGc, [
          `${user.username} has been kicked from the group`,
        ]);
        break;

      default:
        createError(next, 400, "Invalid notice type !");
        break;
    }

    await newGc.save();
    await user.save();
    res.json({ success: true, newNotices: newNoticeMsg, isAdmin, exitDate });
  } catch (error) {
    next(error);
  }
};

export const deleteGroup = async (req, res, next) => {
  try {
    const { _id, userPw } = req.body;
    const { _id: userId } = res.locals.tokenData;

    const { password } = await User.findById(userId)
      .select(["password", "username"])
      .lean();
    const isPwValid = await bcrypt.compare(userPw, password);

    if (!isPwValid) {
      return createError(
        next,
        403,
        "Invalid password, unable to make edits to the group"
      );
    } else {
      await GroupChat.findByIdAndDelete(_id);

      res.status(200).json({ success: true });
    }
  } catch (error) {
    next(error);
  }
};

// remove group id from the groupchats list in database
export const removeGroup = async (req, res, next) => {
  try {
    const { groupId } = req.body;
    const { _id } = res.locals.tokenData;
    await User.findByIdAndUpdate(_id, { $pull: { groupChats: groupId } });
    const { members, admins } = await GroupChat.findById(groupId)
      .select(["members", "admins"])
      .lean();

    if (members.length === 0 && admins.length === 0) {
      await GroupChat.findByIdAndDelete(groupId);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};
