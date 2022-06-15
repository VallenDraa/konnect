import User from '../../model/User.js';

export const findUser = async (req, res, next) => {
  const { query } = req.query;

  try {
    const result = await User.where({ username: { $regex: query } }).select(
      'username'
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getUserDetail = async (req, res, next) => {
  const { username } = req.query;

  try {
    const result = await User.findOne({ username }).select([
      '-password',
      '-settings',
    ]);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
