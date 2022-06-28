import User from '../../../model/User.js';
import { renewToken } from '../auth/tokenController.js';

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
        if (content._id.toString() !== ids[type][i]?._id) return;

        result[type].push({ ...content._doc, sentAt: new Date() });
      });
    }

    // returns the finishing results
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const setNotifToSeen = async (req, res, next) => {
  console.time('setNotifToSeen');

  const { userId, notifIds, boxType } = req.body;

  try {
    const user = await User.findById(userId);

    // loop over the requests key ex. contacts, and etc
    for (const key of Object.keys(user.requests)) {
      // this'll be inbox or outbox
      const contents = user.requests[key][boxType];

      // check if boxContents id exists in notifIds
      contents.forEach(({ _id }, i) => {
        const isNotifExists = notifIds.includes(_id.toString());

        if (isNotifExists) {
          user.requests[key][boxType][i].seen = true;
        }
      });
    }
    await user.save();

    // make a new token

    const token = renewToken(user._doc, process.env.JWT_SECRET);

    res.json({ user, token });
  } catch (error) {
    next(error);
  }
  console.timeEnd('setNotifToSeen');
};
