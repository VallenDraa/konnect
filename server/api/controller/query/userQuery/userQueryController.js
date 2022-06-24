import User from '../../../../model/User.js';

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

export const getOtherUserDetail = async (req, res, next) => {
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
