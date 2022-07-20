import User from '../../../../model/User.js';
import jwt from 'jsonwebtoken';

export const findUsers = async (req, res, next) => {
  const { query } = req.query;

  try {
    const result = await User.where({ username: { $regex: query } })
      .lean()
      .select(['status', 'username', 'initials', 'profilePicture']);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getUsersPreview = async (req, res, next) => {
  const userIds = req.query.userIds.split(',');
  console.log(userIds);

  try {
    const users = await User.find({ _id: { $in: userIds } })
      .lean()
      .select(['status', 'username', 'initials', 'profilePicture']);

    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const getUserDetail = async (req, res, next) => {
  const { username } = req.query;

  try {
    const result = await User.findOne({ username })
      .lean()
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
