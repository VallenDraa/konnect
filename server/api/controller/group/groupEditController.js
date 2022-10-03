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

export const inviteToGroup = async (req, res, next) => {
  try {
    const { invitedIds, groupId } = req.body;
    const { _id: inviterId } = res.locals.tokenData;
    const { username, initials, profilePicture } = await User.findById(
      inviterId
    )
      .select(["username", "initials", "profilePicture"])
      .lean();
    const inviteDate = new Date();
    const invitedNames = [];

    for (const invitedId of invitedIds) {
      // find the invited user data and update
      const invited = await User.findById(invitedId);
      invited.requests.groups.inbox.push({
        by: inviterId,
        group: groupId,
        iat: inviteDate,
      });
      invitedNames.push(invited.username);
      await invited.save();
    }

    // find the inviter group and add the invited user id to the invitedList
    const newGc = await GroupChat.findById(groupId);
    newGc.invited.push(
      ...invitedIds.map((id) => ({ user: id, date: inviteDate }))
    );

    const newNoticeMsg = await newNotice(next, newGc, [
      `${username} has invited ${invitedNames.map((name) => name)}`,
    ]);

    res.json({
      success: true,
      newNotice: newNoticeMsg,
      notif: {
        type: "group_request",
        iat: inviteDate,
        group: {
          _id: groupId,
          name: newGc.name,
          profilePicture: newGc.profilePicture,
        },
        by: { _id: inviterId, username, initials, profilePicture },
        seen: false,
        answer: null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const acceptInvitation = async (req, res, next) => {
  try {
    const { groupId, userId } = req.body;

    // update the group invite answer
    const user = await User.findById(userId);
    if (user.requests.groups.inbox.length === 0) {
      if (user.requests.groups.inbox[0].group + "" === groupId) {
        const { group, by, seen, iat, _id } = user.requests.groups.inbox[0];
        user.requests.groups.inbox[0] = {
          group,
          by,
          seen,
          iat,
          _id,
          answer: true,
        };
      }
    } else {
      for (let i = 0; i < user.requests.groups.inbox.length; i++) {
        if (user.requests.groups.inbox[i].group + "" === groupId) {
          const { group, by, seen, iat, _id } = user.requests.groups.inbox[i];
          user.requests.groups.inbox[i] = {
            group,
            by,
            seen,
            iat,
            _id,
            answer: true,
          };
        }
      }
    }
    user.hasQuitGroup = user.hasQuitGroup.filter(
      (g) => g.group.toString() !== groupId
    );
    user.groupChats.push(groupId);
    await user.save();

    // update the groupData
    const newGc = await GroupChat.findById(groupId);
    newGc.invited = newGc.invited.filter((inv) => {
      return inv.user.toString() !== userId;
    });
    newGc.hasQuit = newGc.hasQuit.filter(({ user }) => {
      user.toString() !== userId;
    });
    newGc.members.push(userId);

    // make a new notice about a new participant that has entered the group
    const newNoticeMsg = await newNotice(next, newGc, [
      `${user.username} has joined this group`,
    ]);

    res.json({ success: true, newNotice: newNoticeMsg });
  } catch (error) {
    next(error);
  }
};

export const rejectInvitation = async (req, res, next) => {
  try {
    const { groupId, userId } = req.body;

    // update the group invite answer
    const user = await User.findById(userId);
    if (user.requests.groups.inbox.length === 0) {
      if (user.requests.groups.inbox[0].group + "" === groupId) {
        const { group, by, seen, iat, _id } = user.requests.groups.inbox[0];
        user.requests.groups.inbox[0] = {
          group,
          by,
          seen,
          iat,
          _id,
          answer: false,
        };
      }
    } else {
      for (let i = 0; i < user.requests.groups.inbox.length; i++) {
        if (user.requests.groups.inbox[i].group + "" === groupId) {
          const { group, by, seen, iat, _id } = user.requests.groups.inbox[i];
          user.requests.groups.inbox[i] = {
            group,
            by,
            seen,
            iat,
            _id,
            answer: false,
          };
        }
      }
    }
    await user.save();

    // update the groupData
    const newGc = await GroupChat.findById(groupId);
    newGc.invited = newGc.invited.filter((inv) => {
      return inv.user.toString() !== userId;
    });

    await newGc.save();

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const quitGroup = async (req, res, next) => {
  try {
    let newNoticeMsg;
    let isAdmin = false;
    let adminShift = false;

    const { groupId, userId } = req.body;
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

    // check if there is no admin left
    if (newGc.admins.length === 0 && newGc.members.length > 0) {
      newGc.admins.push(newGc.members[0]);

      newGc.members.shift();
      adminShift = true;
    }

    // USER UPDATE
    user.groupChats = user.groupChats.filter((gc) => gc.toString !== userId);
    user.hasQuitGroup.push({ group: groupId, date: exitDate });

    // create new notice
    newNoticeMsg = await newNotice(next, newGc, [
      `${user.username} has quit this group`,
    ]);

    await newGc.save();
    await user.save();
    res.json({
      success: true,
      newNotices: newNoticeMsg,
      isAdmin,
      exitDate,
      newAdmin: adminShift ? newGc.admins[0] : null,
    });
  } catch (error) {
    next(error);
  }
};

export const kickGroup = async (req, res, next) => {
  try {
    let newNoticeMsg;
    let isAdmin = false;
    let adminShift = false;

    const { groupId, kickedId, kickerId } = req.body;
    const user = await User.findById(kickedId);
    const { username: kickerUsername } = await User.findById(kickerId)
      .lean()
      .select("username");
    const newGc = await GroupChat.findById(groupId);
    const exitDate = new Date();

    // GROUP UPDATE
    // update the admin list
    newGc.admins = newGc.admins.filter((a) => {
      if (a._id.toString() === kickedId) {
        isAdmin = true;
      }

      return a._id.toString() !== kickedId;
    });
    // update the members list if the target user is not an admin
    if (!isAdmin) {
      newGc.members = newGc.members.filter(
        (m) => m._id.toString() !== kickedId
      );
    }
    // push the target user into the hasQuit array
    newGc.hasQuit.push({ user: kickedId, date: exitDate });

    // check if there is no admin left
    if (newGc.admins.length === 0 && newGc.members.length > 0) {
      newGc.admins.push(newGc.members[0]);

      newGc.members.shift();
      adminShift = true;
    }

    // USER UPDATE
    user.groupChats = user.groupChats.filter((gc) => gc.toString !== kickedId);
    user.hasQuitGroup.push({ group: groupId, date: exitDate });

    // create new notice
    newNoticeMsg = await newNotice(next, newGc, [
      `${user.username} has been kicked from the group by ${kickerUsername}`,
    ]);

    await newGc.save();
    await user.save();
    res.json({
      success: true,
      newNotices: newNoticeMsg,
      isAdmin,
      exitDate,
      newAdmin: adminShift ? newGc.admins[0] : null,
    });
  } catch (error) {
    next(error);
  }

  // send notification
  // user.notifications.inbox.push({
  //   iat: exitDate,
  //   contents: `You have been kicked from ${newGc.name} by ${kickerUsername}`,
  // });
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

export const giveAdminStatus = async (req, res, next) => {
  try {
    const { groupId, userId, userPw } = req.body;
    const { _id } = res.locals.tokenData;
    const { username: giver, password } = await User.findById(_id)
      .lean()
      .select(["username", "password"]);
    const isPwValid = await bcrypt.compare(userPw, password);

    if (!isPwValid) {
      return createError(
        next,
        403,
        "Invalid password, unable to give admin access"
      );
    } else {
      const { username: receiver } = await User.findById(userId)
        .lean()
        .select("username");

      await GroupChat.findByIdAndUpdate(groupId, {
        $pull: { members: userId },
        $push: { admins: userId },
      });

      // make new notice about the status change
      const newNoticeMsg = await newNotice(
        next,
        await GroupChat.findById(groupId),
        [`${giver} has given ${receiver} admin status`]
      );

      res.json({ success: true, newNotice: newNoticeMsg });
    }
  } catch (error) {
    next(error);
  }
};

export const revokeAdminStatus = async (req, res, next) => {
  try {
    const { groupId, userId, userPw } = req.body;
    const { _id } = res.locals.tokenData;
    const { username: revoker, password } = await User.findById(_id)
      .lean()
      .select(["username", "password"]);

    const isPwValid = await bcrypt.compare(userPw, password);

    if (!isPwValid) {
      return createError(
        next,
        403,
        "Invalid password, unable to give admin access"
      );
    } else {
      const { username: revoked } = await User.findById(userId)
        .lean()
        .select("username");

      await GroupChat.findByIdAndUpdate(groupId, {
        $pull: { admins: userId },
        $push: { members: userId },
      });

      // make new notice about the status change
      const newNoticeMsg = await newNotice(
        next,
        await GroupChat.findById(groupId),
        [`${revoked} has revoked ${revoker}'s admin status`]
      );

      res.json({ success: true, newNotice: newNoticeMsg });
    }
  } catch (error) {
    next(error);
  }
};
