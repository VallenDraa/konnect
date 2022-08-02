import PrivateChat from "../../../../model/PrivateChat.js";
import User from "../../../../model/User.js";
import createError from "../../../../utils/createError.js";

export const getAllChatHistory = async (req, res, next) => {
  try {
    const { _id } = res.locals.tokenData;
    const { chats } = await User.findById(_id).select("chats").lean();

    if (chats.length > 0) {
      const privateChats = await PrivateChat.where({ _id: { $in: chats } })
        .populate([
          {
            path: "users",
            select: ["username", "status", "initials", "profilePicture"],
          },
          "chat.messages",
        ])
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

async function fetchUnreadMsgFromDb(chatIds, userId, next) {
  try {
    const pc = await PrivateChat.where({ _id: { $in: chatIds } })
      .select("chat")
      .populate("chat.messages")
      .lean();

    const totalUnreadMsg = pc.reduce(
      (p, c) => {
        const timeGroups = c.chat;
        const timeGroupMaxIdx = timeGroups.length - 1;
        const newDetail = { [c._id]: 0 };
        // check if the length is more than 0
        if (timeGroupMaxIdx > 0) {
          // loop over the time group from the back
          for (let i = timeGroupMaxIdx; i >= 0; i--) {
            const chatMaxIdx = timeGroups[i].messages.length - 1;

            // loop over the messages in the time group from the back
            for (let z = chatMaxIdx; z >= 0; i--) {
              if (timeGroups[i].messages[z].by.toString() !== userId) {
                if (timeGroups[i].messages[z].readAt) break;

                newDetail[c._id]++;
              }
            }
          }
        } else {
          const chatMaxIdx = timeGroups[timeGroupMaxIdx].messages.length - 1;

          // loop over the messages in the time group from the back4
          if (chatMaxIdx === 0) {
            if (timeGroups[0].messages[0].by.toString() === userId) return p;
            if (timeGroups[0].messages[0].readAt) return p;

            newDetail[c._id]++;
          } else {
            for (let z = chatMaxIdx; z >= 0; z--) {
              if (timeGroups[0].messages[z].by.toString() !== userId) {
                if (timeGroups[0].messages[z].readAt) break;

                newDetail[c._id]++;
              }
            }
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

    console.log(totalUnreadMsg);
    return totalUnreadMsg;
  } catch (error) {
    console.log(error);
    next(error);
  }
}
export const getChatNotifications = async (req, res, next) => {
  try {
    const { _id } = res.locals.tokenData;
    const { chats } = await User.findById(_id).select("chats").lean();

    if (chats.length > 0) {
      const totalUnreadMsg = await fetchUnreadMsgFromDb(chats, _id, next);

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
        .populate([
          {
            path: "users",
            select: ["username", "status", "initials", "profilePicture"],
          },
          "chat.messages",
        ])
        .lean();

      // formatting the result
      const formattedPC = privateChats.map((pc) => {
        const user = pc.users.filter((user) => user._id.toString() !== _id)[0];

        return { chatId: pc._id, user, chat: pc.chat, preview: true };
      });
      const unreadMsg = await fetchUnreadMsgFromDb(chats, _id, next);
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
