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

export const getChatNotifications = async (req, res, next) => {};

export const getAllChatId = async (req, res, next) => {
  // new way
  try {
    const { _id } = res.locals.tokenData;
    const { chats } = await User.findById(_id).select("chats").lean();

    if (chats.length > 0) {
      const privateChats = await PrivateChat.where({
        _id: { $in: chats },
      })
        .select(["users", "_id"])
        .populate({
          path: "users",
          select: ["username", "status", "initials", "profilePicture"],
        })
        .lean();

      // formatting the result
      const formattedPC = privateChats.map((pc) => {
        const user = pc.users.filter((user) => user._id.toString() !== _id)[0];

        return { chatId: pc._id, user };
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
