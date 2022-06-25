import User from '../../../model/User.js';

export const contactRequestDetails = async (req, res, next) => {
  const { ids, userId } = req.body;

  try {
    const { requests } = await User.findById(userId)
      .select(['requests', '-_id'])
      .populate([
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
    for (const type of Object.keys(result)) {
      const notifBoxes = requests.contacts[type]; //inbox or outbox

      notifBoxes.forEach((content, i) => {
        if (content._id.toString() !== ids[type][i]._id) return;

        result[type].push(content._doc);
      });
    }

    // returns the finishing results
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const setNotifToSeen = async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
};
