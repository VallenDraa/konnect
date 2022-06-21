import User from '../../../model/User.js';

export const contactRequestDetails = async (req, res, next) => {
  const { ids, userId } = req.body;

  try {
    const user = await User.findById(userId).populate([
      {
        path: 'requests.contacts.inbox.by',
        select: ['username', 'initials', 'profilePicture'],
      },
      {
        path: 'requests.contacts.outbox.by',
        select: ['username', 'initials', 'profilePicture'],
      },
    ]);
    const result = { inbox: [], outbox: [] };

    // find the matching contact request notif id from the body with the users data, then get the notif details
    Object.keys(result).forEach((type) => {
      user.requests.contacts[type].forEach((details, i) => {
        if (details._id.toString() !== ids[type][i]._id) return;

        const { _id, ...otherDetails } = details._doc;
        result.outbox.push(otherDetails);
      });
    });

    // returns the finishing results
    res.json(result);
  } catch (error) {
    next(error);
  }
};
