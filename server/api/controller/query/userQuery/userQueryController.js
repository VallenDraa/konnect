import User from '../../../../model/User.js';
import jwt from 'jsonwebtoken';

export const findUsers = async (req, res, next) => {
  const { query } = req.query;

  try {
    const result = await User.where({ username: { $regex: query } }).select([
      'username',
      'initials',
      'profilePicture',
    ]);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const findUsersFromContact = async (req, res, next) => {
  const { query, token } = req.body;

  try {
    const { _id } = jwt.decode(token);
    const results = [];

    // get all the users from the contact that match the query
    const { contacts } = await User.findById(_id)
      .select('contacts.user')
      .populate({
        select: ['username', 'initials', 'profilePicture'],
        path: 'contacts.user',
        match: { username: { $regex: query } },
      });

    for (const item of contacts) {
      if (item.user !== null) results.push(item);
    }

    res.json(results);
  } catch (error) {
    next(error);
  }
};

export const getUsersPreview = async (req, res, next) => {
  const { userIds } = req.body;

  try {
    const users = await User.find({ _id: { $in: userIds } }).select([
      'username',
      'initials',
      'profilePicture',
    ]);

    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const getUserDetail = async (req, res, next) => {
  const { username } = req.query;

  try {
    const result = await User.findOne({ username })
      .select(['-password', '-settings'])
      .populate({
        path: 'contacts.user',
        select: ['username', 'initials', 'profilePicture'],
      });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {};
