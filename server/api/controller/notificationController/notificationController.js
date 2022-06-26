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
        if (content._id.toString() !== ids[type][i]?._id) return;

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
  const { userId, notifIds } = req.body;

  try {
    const notifs = await User.findById(userId).select('requests');

    console.time('setNotifToSeen');
    for (const key of Object.keys(notifs.requests)) {
      for (const box in notifs.requests[key]) {
        if (box === 'inbox' || box === 'outbox') {
          // this'll be inbox or outbox
          const contents = notifs.requests[key][box];

          // check if boxContents id exists in notifIds
          contents.forEach(({ _id }, i) => {
            const isNotifExists = notifIds.includes(_id.toString());

            if (isNotifExists) {
              notifs.requests[key][box][i].seen = true;
            }
          });
        }
      }
    }
    console.timeEnd('setNotifToSeen');

    console.log(notifs);

    await notifs.save();

    res.json(notifs);
  } catch (error) {
    next(error);
  }
};
