import User from '../../../../model/User.js';

export const getUserContactsPreview = async (req, res, next) => {
  const { userId } = req.body;

  // find the user first
  const { contacts } = await User.findById(userId)
    .select(['contacts', '-_id'])
    .populate({
      path: 'contacts.user',
      select: ['username', 'profilePicture', 'initials'],
    })
    .catch((e) => next(e));

  res.json({ contacts });
};
