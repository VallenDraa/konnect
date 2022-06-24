import User from '../../../../model/User.js';

export const getUserContactsPreview = async (req, res, next) => {
  const { userId } = req.body;

  // find the user first
  const result = await User.findById(userId)
    .select(['contacts'])
    .populate({
      path: 'contacts.user',
      select: ['username', 'profilePicture', 'initials'],
    })
    .catch((e) => next(e));

  res.json({ result });
};
