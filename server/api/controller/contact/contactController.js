import User from "../../../model/User.js";

export const findUsersFromContact = async (req, res, next) => {
  const { query } = req.query;

  try {
    const { _id } = res.locals.tokenData;
    const results = [];

    // get all the users from the contact that match the query
    const { contacts } = await User.findById(_id)
      .select("contacts.user")
      .populate({
        path: "contacts.user",
        select: ["username", "initials", "profilePicture", "status"],
        match: { username: { $regex: query } },
      });

    contacts.forEach((item) => item.user && results.push(item));

    res.json(results);
  } catch (error) {
    next(error);
  }
};

export const getUserContactsPreview = async (req, res, next) => {
  try {
    const { _id } = res.locals.tokenData;

    // find the user first
    const { contacts } = await User.findById(_id)
      .select(["contacts", "-_id"])
      .populate({
        path: "contacts.user",
        select: ["username", "profilePicture", "initials", "status"],
      });

    res.json({ contacts });
  } catch (error) {
    next(error);
  }
};
