import User from '../../../model/User.js';
import createError from '../../../utils/createError.js';
import { renewToken } from '../auth/tokenController.js';

export const getAllNotifications = async (req, res, next) => {
  const { full } = req.query; //only accepts true or false
  const { _id } = res.locals.tokenData;
  const box = ['inbox', 'outbox'];

  try {
    const { notifications, requests } = await User.findById(_id)
      .lean()
      .populate(
        !JSON.parse(full)
          ? []
          : [
              {
                path: 'requests.contacts.inbox.by',
                select: ['username', 'initials', 'profilePicture'],
              },
              {
                path: 'requests.contacts.outbox.by',
                select: ['username', 'initials', 'profilePicture'],
              },
            ]
      );

    const { outbox: notifOutbox, inbox: notifInbox } = notifications;

    // the helper variables
    const result = { inbox: [], outbox: [] };
    const largestNotifLen =
      notifOutbox.length >= notifInbox.length
        ? notifOutbox.length
        : notifInbox.length;
    let largestReqLen = 0;

    // loop over the requests key and determine which array is the largest
    for (const key of Object.keys(requests)) {
      const inboxLen = requests[key].inbox.length;
      const outboxLen = requests[key].outbox.length;

      if (inboxLen >= outboxLen) {
        largestReqLen = largestReqLen >= inboxLen ? largestReqLen : inboxLen;
      } else {
        largestReqLen = largestReqLen >= outboxLen ? largestReqLen : outboxLen;
      }
    }

    // assign the notifications and requests to the result object
    const biggestArrayLen =
      largestNotifLen >= largestReqLen ? largestNotifLen : largestReqLen;
    for (let i = 0; i < biggestArrayLen; i++) {
      if (notifOutbox[i]) {
        result.outbox.push({ ...notifOutbox[i], type: 'notifications' });
      }

      if (notifInbox[i]) {
        result.inbox.push({ ...notifInbox[i], type: 'notifications' });
      }

      if (requests.contacts.outbox[i]) {
        result.outbox.push({
          ...requests.contacts.outbox[i],
          type: 'contact_request',
        });
      }
      if (requests.contacts.inbox[i]) {
        result.inbox.push({
          ...requests.contacts.inbox[i],
          type: 'contact_request',
        });
      }
    }

    // sort by the latest notifcations
    result.inbox = result.inbox.sort((a, b) => b.iat > a.iat);
    result.outbox = result.outbox.sort((a, b) => b.iat > a.iat);

    res.json({ notifications: result });
  } catch (error) {
    next(error);
  }
};

export const contactRequestDetails = async (req, res, next) => {
  const { ids } = req.body;

  const { _id } = res.locals.tokenData;

  try {
    const { requests } = await User.findById(_id)
      .lean()
      .select(['requests', '-_id'])
      .populate([
        {
          path: 'notifications.inbox.by',
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

        result[type].push({ ...content, sentAt: new Date() });
      });
    }

    // returns the finishing results
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const setNotifToSeen = async (req, res, next) => {
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
};
