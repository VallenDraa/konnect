import PrivateChat from "../../../../model/private/PrivateChat.js";
import createError from "../../../../utils/createError.js";
import User from "../../../../model/User.js";
import GroupChat from "../../../../model/group/GroupChat.js";

export const getAllChatHistory = async (req, res, next) => {
  try {
    const { _id } = res.locals.tokenData;
    const { privateChats: pcIds, groupChats: gcIds } = await User.findById(_id)
      .select("privateChats", "groupChats")
      .lean();

    const chats = [];

    // if both chats are empty returns an empty result
    if (pcIds.length === 0 && gcIds.length === 0) {
      const response = {
        currentUser: _id,
        messageLogs: [],
        success: true,
      };

      return res.json(response);
    }

    if (pcIds.length > 0) {
      const privateChats = await PrivateChat.where({ _id: { $in: pcIds } })
        .populate([
          {
            path: "users",
            select: ["username", "status", "initials", "profilePicture"],
          },
          "chat.messages",
        ])
        .lean();

      chats.push(...privateChats);
    }

    if (gcIds.length > 0) {
      const groupChats = await GroupChat.where({ _id: { $in: gcIds } })
        .populate([
          {
            path: "admins",
            select: ["username", "status", "initials", "profilePicture"],
          },
          {
            path: "members",
            select: ["username", "status", "initials", "profilePicture"],
          },
          "chat.messages",
        ])
        .lean();

      chats.push(...groupChats);
    }

    // formatting the result
    const formattedChats = chats.map((c) => {
      switch (c.type) {
        case "private":
          const [user] = c.users.filter((user) => user._id.toString() !== _id);
          return {
            chatId: c._id,
            user,
            chat: c.chat,
            type: c.type,
          };

        case "group":
          return {
            name: c.name,
            profilePicture: c.profilePicture,
            chatId: c._id,
            admins: c.admins,
            members: c.members,
            chat: c.chat,
            type: c.type,
          };

        default:
          return createError(next, 400, "Invalid chat type !");
      }
    });

    const response = {
      currentUser: _id,
      messageLogs: [...formattedChats],
      success: true,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getChatHistory = async (req, res, next) => {
  try {
    const { pcIds, gcIds } = req.query;
    const parsedPcIds = pcIds.split(","); //private chat ids
    const parsedGcIds = gcIds.split(","); //group chat ids
    const { _id } = res.locals.tokenData;

    // check if client passed in at least one type of chat id
    if (parsedGcIds.length <= 0 && parsedPcIds.length <= 0) {
      return createError(
        next,
        409,
        "Please provide one or more chat ids to proceed !"
      );
    }

    // get the private chat ids that the client requested
    let privateChats = [];
    let groupChats = [];

    if (parsedPcIds.length > 0) {
      privateChats = await PrivateChat.where({ _id: { $in: parsedPcIds } })
        .select(["chat", "type", "users"])
        .populate("chat.messages")
        .lean();

      privateChats = privateChats.map((pc) => ({
        chat: pc.chat,
        type: pc.type,
        user: pc.users.filter((u) => u.toString() !== _id)[0],
      }));
    }

    res.json({ success: true, privateChats, groupChats });
  } catch (error) {
    next(error);
  }
};

async function fetchUnreadMsgFromDb(chats, userId, next) {
  try {
    const totalUnreadMsg = chats.reduce(
      (p, c) => {
        const unreadId = c.type === "private" ? c.user._id : c.chatId;
        const timeGroups = c.chat;
        const timeGroupMaxIdx = timeGroups.length - 1;
        const newDetail = { [unreadId]: 0 };

        // check if the length is more than 0
        if (timeGroupMaxIdx > 0) {
          // loop over the time group from the back
          for (let i = timeGroupMaxIdx; i >= 0; i--) {
            const chatMaxIdx = timeGroups[i].messages.length - 1;

            // loop over the messages in the time group from the back
            for (let z = chatMaxIdx; z >= 0; i--) {
              if (timeGroups[i].messages[z].msgType === "notice") continue;

              if (timeGroups[i].messages[z].by.toString() !== userId) {
                if (timeGroups[i].messages[z].readAt) break;

                newDetail[unreadId]++;
              }
            }
          }
        } else {
          const chatMaxIdx = timeGroups[timeGroupMaxIdx].messages.length - 1;

          // loop over the messages in the time group from the back4
          if (chatMaxIdx === 0) {
            if (timeGroups[0].messages[0].msgType === "notice") return p;
            if (timeGroups[0].messages[0].by.toString() === userId) return p;
            if (timeGroups[0].messages[0].readAt) return p;

            newDetail[unreadId]++;
          } else {
            for (let z = chatMaxIdx; z >= 0; z--) {
              if (timeGroups[0].messages[z].msgType === "notice") continue;

              if (timeGroups[0].messages[z].by.toString() !== userId) {
                if (timeGroups[0].messages[z].readAt) break;

                newDetail[unreadId]++;
              }
            }
          }
        }

        // assemble the final result
        const newTotals = {
          detail: { ...p.detail, ...newDetail },
          total: p.total + newDetail[unreadId],
        };
        return newDetail[unreadId] > 0 ? newTotals : p;
      },
      { detail: {}, total: 0 }
    );

    return totalUnreadMsg;
  } catch (error) {
    console.log(error);
    next(error);
  }
}
export const getChatNotifications = async (req, res, next) => {
  try {
    const { _id } = res.locals.tokenData;
    const { privateChats } = await User.findById(_id)
      .select("privateChats")
      .lean();

    if (privateChats.length > 0) {
      const totalUnreadMsg = await fetchUnreadMsgFromDb(
        privateChats,
        _id,
        next
      );

      res.json(totalUnreadMsg);
    } else {
      res.json({ detail: {}, total: 0 });
    }
  } catch (error) {
    next(error);
  }
};

export const getAllChatId = async (req, res, next) => {
  try {
    const { _id } = res.locals.tokenData;
    const { privateChats: pcIds, groupChats: gcIds } = await User.findById(_id)
      .select(["privateChats", "groupChats"])
      .lean();
    const chats = [];

    // if both chats are empty returns an empty result
    if (pcIds.length === 0 && gcIds.length === 0) {
      const response = {
        currentUser: _id,
        unreadMsg: { detail: {}, total: 0 },

        messageLogs: [],
        success: true,
      };

      return res.json(response);
    }

    if (pcIds.length > 0) {
      const privateChats = await PrivateChat.where({ _id: { $in: pcIds } })
        .slice("chat", -1)
        .populate([
          {
            path: "users",
            select: ["username", "status", "initials", "profilePicture"],
          },
          "chat.messages",
        ])
        .lean();

      chats.push(...privateChats);
    }

    if (gcIds.length > 0) {
      const groupChats = await GroupChat.where({ _id: { $in: gcIds } })
        .slice("chat", -1)
        .populate([
          {
            path: "admins",
            select: ["username", "status", "initials", "profilePicture"],
          },
          {
            path: "members",
            select: ["username", "status", "initials", "profilePicture"],
          },
          "chat.messages",
        ])
        .lean();

      chats.push(...groupChats);
    }

    // formatting the result
    const formattedChats = chats.map((c) => {
      switch (c.type) {
        case "private":
          const [user] = c.users.filter((user) => user._id.toString() !== _id);

          return {
            chatId: c._id,
            user,
            chat: c.chat,
            type: c.type,
            preview: true,
          };

        case "group":
          return {
            name: c.name,
            profilePicture: c.profilePicture,
            chatId: c._id,
            admins: c.admins,
            members: c.members,
            chat: c.chat,
            type: c.type,
            preview: true,
          };
        default:
          return createError(next, 400, "Invalid chat type !");
      }
    });

    const unreadMsg = await fetchUnreadMsgFromDb(formattedChats, _id, next);

    res.json({
      currentUser: _id,
      messageLogs: [...formattedChats],
      unreadMsg,
      success: true,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
