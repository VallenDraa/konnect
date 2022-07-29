import PrivateChat from "../../../../model/PrivateChat.js";
import User from "../../../../model/User.js";
import createError from "../../../../utils/createError.js";

export const getAllChatHistory = async (req, res, next) => {
  try {
    const { _id } = res.locals.tokenData;
    const { chats } = await User.findById(_id).select("chats").lean();

    if (chats.length > 0) {
      const privateChats = await PrivateChat.where({ _id: { $in: chats } })
        .populate({
          path: "users",
          select: ["username", "status", "initials", "profilePicture"],
        })
        .lean();

      // formatting the result
      const formattedPC = privateChats.map((pc) => {
        const user = pc.users.filter((user) => user._id.toString() !== _id)[0];

        return { chatId: pc._id, user, chat: pc.chat, type: pc.type };
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
};

export const getChatHistory = async (req, res, next) => {
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

  try {
    // get the private chat ids that the client requested
    let privateChats = [];
    let groupChats = [];

    if (parsedPcIds.length > 0) {
      privateChats = await PrivateChat.where({ _id: { $in: parsedPcIds } })
        .select(["chat", "type", "users"])
        .lean();

      privateChats = privateChats.map((pc) => ({
        chat: pc.chat,
        type: pc.type,
        user: pc.users.filter((u) => u.toString() !== _id)[0],
      }));
    }

    // if (groupChats.length > 0)
    //WIP

    res.json({ success: true, privateChats, groupChats });
  } catch (error) {
    next(error);
  }
};

async function fetchUnreadMsgFromDb(chatIds, userId) {
  const pc = await PrivateChat.where({ _id: { $in: chatIds } })
    .select(["chat.readAt", "chat.by"])
    .lean();

  const totalUnreadMsg = pc.reduce(
    (p, c) => {
      const chatIdxLen = c.chat.length - 1;
      const newDetail = { [c._id]: 0 };

      // check if the length is more than 0
      if (chatIdxLen > 0) {
        // loop from the back of the chat log and count the unread message
        for (let i = chatIdxLen; i >= 0; i--) {
          if (c.chat[i].by.toString() !== userId) {
            if (c.chat[i].readAt) break;
            else newDetail[c._id]++;
          }
        }
      } else {
        if (chatIdxLen === 0) {
          if (c.chat[chatIdxLen].by.toString() === userId) return p;
          if (c.chat[chatIdxLen].readAt) return p;

          newDetail[c._id]++;
        }
      }

      // assemble the final result
      const newTotals = {
        detail: { ...p.detail, ...newDetail },
        total: p.total + newDetail[c._id],
      };
      return newDetail[c._id] > 0 ? newTotals : p;
    },
    { detail: {}, total: 0 }
  );
  return totalUnreadMsg;
}
export const getChatNotifications = async (req, res, next) => {
  try {
    const { _id } = res.locals.tokenData;
    const { chats } = await User.findById(_id).select("chats").lean();

    if (chats.length > 0) {
      const totalUnreadMsg = await fetchUnreadMsgFromDb(chats, _id);

      res.json(totalUnreadMsg);
    } else {
      res.json({ detail: {}, total: 0 });
    }
  } catch (error) {
    next(error);
  }
};

export const getAllChatId = async (req, res, next) => {
  // new way
  try {
    const { _id } = res.locals.tokenData;
    const { chats } = await User.findById(_id).select("chats").lean();

    if (chats.length > 0) {
      const privateChats = await PrivateChat.where({
        _id: { $in: chats },
      })
        .select(["users", "_id", "chat"])
        .slice("chat", -1)
        .populate({
          path: "users",
          select: ["username", "status", "initials", "profilePicture"],
        })
        .lean();

      // formatting the result
      const formattedPC = privateChats.map((pc) => {
        const user = pc.users.filter((user) => user._id.toString() !== _id)[0];

        return { chatId: pc._id, user, chat: pc.chat, preview: true };
      });
      const unreadMsg = await fetchUnreadMsgFromDb(chats, _id, true);

      const response = {
        currentUser: _id,
        messageLogs: [...formattedPC],
        unreadMsg,
        success: true,
      };

      res.json(response);
    } else {
      const response = {
        currentUser: _id,
        unreadMsg: { detail: {}, total: 0 },
        messageLogs: [],
        success: true,
      };

      res.json(response);
    }
  } catch (error) {
    next(error);
  }
};
