import User from '../../../../model/User.js';
import createError from '../../../../utils/createError.js';
import { renewToken } from '../../auth/tokenController.js';

// for sending contact request response
export const sendRequestToRecipient = async (req, res, next) => {
  const { recipientId, senderId, cancel } = req.body;
  const JWT_SECRET = process.env.JWT_SECRET;

  // sending the request to the recipient
  try {
    const recipient = await User.findById(recipientId);
    const isRequestExists = recipient.requests.contacts.inbox.some(
      (request) => {
        return request.by.toString() === senderId && request.answer === null;
      }
    );

    const contactInbox = recipient.requests.contacts.inbox;

    // if request exists then cancel/remove the request
    if (isRequestExists) {
      recipient.requests.contacts.inbox = contactInbox.filter(
        (request) => request.by.toString() !== senderId
      );
    } else {
      recipient.requests.contacts.inbox.push({
        by: senderId,
        iat: new Date(),
      });
    }

    // save the request to the db
    recipient.markModified('requests.contacts.inbox');
    await recipient.save();

    // send the updated token & user data to the client
    try {
      const user = await User.findById(recipientId).select([
        '-password',
        ...global.exemptedUserInfos,
      ]);

      const { _doc } = user;

      const token = renewToken(_doc, JWT_SECRET);
      return isRequestExists
        ? res.json({ token, user: _doc, cancelRequest: true, success: true })
        : res.json({ token, user: _doc, cancelRequest: false, success: true });
    } catch (error) {
      next(error);
    }
  } catch (error) {
    next(error);
  }
};
export const queueRequestToSender = async (req, res, next) => {
  const { recipientId, senderId, cancel } = req.body;
  const JWT_SECRET = process.env.JWT_SECRET;

  // queueing the request that has been sent to the senders contact requests field
  try {
    const sender = await User.findById(senderId);
    const isRequestExists = sender.requests.contacts.outbox.some((request) => {
      return request.by.toString() === recipientId;
    });
    const contactOutbox = sender.requests.contacts.outbox;

    // if request exists then cancel/remove the request
    if (isRequestExists) {
      sender.requests.contacts.outbox = contactOutbox.filter(
        (request) => request.by.toString() !== recipientId
      );

      if (!cancel) {
        sender.requests.contacts.outbox.push({
          by: recipientId,
          iat: new Date(),
        });
      }
    } else {
      sender.requests.contacts.outbox.push({
        by: recipientId,
        iat: new Date(),
      });
    }

    // save the request to the db
    sender.markModified('requests.contacts.outbox');
    await sender.save();

    // send the updated token & user data to the client
    try {
      const user = await User.findById(senderId).select([
        '-password',
        ...global.exemptedUserInfos,
      ]);

      const { _doc } = user;

      const token = renewToken(_doc, JWT_SECRET);
      return isRequestExists
        ? res.json({ token, user: _doc, cancelRequest: true, success: true })
        : res.json({ token, user: _doc, cancelRequest: false, success: true });
    } catch (error) {
      next(error);
    }
  } catch (error) {
    next(error);
  }
};

// for handling contact request response
async function handleRequestResponse({
  recipientId,
  senderId,
  answer,
  isSenderMode,
}) {
  const targetId = isSenderMode ? senderId : recipientId;
  const oppositeId = isSenderMode ? recipientId : senderId;
  const boxTarget = isSenderMode ? 'outbox' : 'inbox';

  const target = await User.findById(targetId);
  const box = target.requests.contacts[boxTarget];

  // find a request in the target's requests box that has the same id as the oppposite's
  box.forEach(({ by }, i) => {
    if (by.toString() === oppositeId) {
      target.requests.contacts[boxTarget][i].answer = answer;
    }
  });

  // check if answer is true then add oppositeId to targetId and vice versa
  if (answer) {
    target.contacts.push({ user: oppositeId });
  } else {
    target.requests.contacts[boxTarget] = box.filter(
      (x) => x.by.toString() !== oppositeId
    );
    target.markModified(`requests.contacts${[boxTarget]}`);
  }

  // save the new data
  await target.save();
} // the logic
async function sendBackNewUserData(userId, exemptedUserInfos) {
  const JWT_SECRET = process.env.JWT_SECRET;
  const user = await User.findById(userId)
    .select(['-password', ...exemptedUserInfos])
    .lean();

  const token = renewToken(user, JWT_SECRET);
  return { token, user, success: true };
}
export const contactRequestRespondRecipient = async (req, res, next) => {
  const { recipientId, senderId, answer } = req.body;

  // update the recipients requests field
  try {
    handleRequestResponse({
      recipientId,
      senderId,
      answer,
      isSenderMode: false,
    }).finally(async () => {
      try {
        const user = await sendBackNewUserData(
          recipientId,
          global.exemptedUserInfos
        );
        res.json(user);
      } catch (error) {
        next(error);
      }
    });
  } catch (error) {
    next(error);
  }
};
export const contactRequestRespondSender = async (req, res, next) => {
  const { recipientId, senderId, answer } = req.body;

  // update the sender requests field
  try {
    handleRequestResponse({
      recipientId,
      senderId,
      answer,
      isSenderMode: true,
    }).finally(async () => {
      // send the updated sender data
      try {
        const user = await sendBackNewUserData(
          senderId,
          global.exemptedUserInfos
        );
        res.json(user);
      } catch (error) {
        next(error);
      }
    });
  } catch (error) {
    next(error);
  }
};

export const sendContactRequest = async (req, res, next) => {
  const { recipientId } = req.body;
  const { _id } = res.locals.tokenData;

  try {
    const users = await User.where('_id').equals([recipientId, _id]);

    // if the result doesn't return 2 data which is the recipient and sender
    if (users.length !== 2) {
      return createError(next, 400, 'Invalid arguments !');
    }

    // seperate into sender and recipient
    const sender = users.find((s) => s._id.toString() === _id);
    const recipient = users.find((r) => r._id.toString() === recipientId);

    // check if requests has already been sent
    const isRequestSent = sender.requests.contacts.outbox.some(
      ({ by }) => by.toString() === recipientId
    );
    if (isRequestSent) {
      return createError(
        next,
        409,
        'A contact request has been sent to this user !'
      );
    }

    // push the request to the database
    sender.requests.contacts.outbox.push({
      by: recipientId,
      iat: new Date(),
    });
    recipient.requests.contacts.inbox.push({
      by: _id,
      iat: new Date(),
    });

    // save it to the database
    await sender.save();
    await recipient.save();

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const respondToContactRequest = async (req, res, next) => {
  const { recipientId, answer } = req.body;
  const { _id } = res.locals.tokenData;

  try {
    const users = await User.where('_id').equals([recipientId, _id]);

    // if the result doesn't return 2 data which is the recipient and sender
    if (users.length !== 2) {
      return createError(next, 400, 'Invalid arguments !');
    }

    // seperate into sender and recipient
    const sender = users.find((s) => s._id.toString() === _id);
    const recipient = users.find((r) => r._id.toString() === recipientId);

    // push the answer to the database
    for (const i in sender.requests.contacts.outbox) {
      if (sender.requests.contacts.outbox[i].by.toString() === recipientId) {
        sender.requests.contacts.outbox[i].answer = answer;
        break;
      }
    }
    for (const i in recipient.requests.contacts.inbox) {
      if (recipient.requests.contacts.inbox[i].by.toString() === _id) {
        recipient.requests.contacts.inbox[i].answer = answer;
        break;
      }
    }
    // save it to the database
    await sender.save();
    await recipient.save();

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const deleteContactRequest = async (req, res, next) => {
  const { recipientId } = req.body;
  const { _id } = res.locals.tokenData;

  try {
    const users = await User.where('_id').equals([recipientId, _id]);

    // if the result doesn't return 2 data which is the recipient and sender
    if (users.length !== 2) {
      return createError(next, 400, 'Invalid arguments !');
    }

    // seperate into sender and recipient
    const sender = users.find((s) => s._id.toString() === _id);
    const recipient = users.find((r) => r._id.toString() === recipientId);

    // check if requests has already been sent
    const isMissing = sender.requests.contacts.outbox.every(
      ({ by }) => by.toString() !== recipientId
    );
    if (isMissing) return createError(next, 409, 'Invalid passed in ids !');

    // delete the request to the database
    sender.requests.contacts.outbox = sender.requests.contacts.outbox.filter(
      (item) => item.by.toString() !== recipientId
    );
    recipient.requests.contacts.inbox =
      recipient.requests.contacts.inbox.filter(
        (item) => item.by.toString() !== _id
      );

    // save it to the database
    await sender.save();
    await recipient.save();

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
