import jwt from 'jsonwebtoken';
import User from '../../../../model/User.js';
import createError from '../../../../utils/createError.js';

// for sending contact request response
export const sendRequestToRecipient = async (req, res, next) => {
  const { recipientId, senderId } = req.body;
  const JWT_SECRET = process.env.JWT_SECRET;

  // sending the request to the recipient
  try {
    const recipient = await User.findById(recipientId);
    const isRequestExists = recipient.requests.contacts.inbox.some(
      (request) => request.by.toString() === senderId
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

      const token = jwt.sign(_doc, JWT_SECRET);
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
  const { recipientId, senderId } = req.body;
  const JWT_SECRET = process.env.JWT_SECRET;

  // queueing the request that has been sent to the senders contact requests field
  try {
    const sender = await User.findById(senderId);
    const isRequestExists = sender.requests.contacts.outbox.some(
      (request) => request.by.toString() === recipientId
    );
    const contactOutbox = sender.requests.contacts.outbox;

    // if request exists then cancel/remove the request
    if (isRequestExists) {
      sender.requests.contacts.outbox = contactOutbox.filter(
        (request) => request.by.toString() !== recipientId
      );
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

      const token = jwt.sign(_doc, JWT_SECRET);
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
  answer && target.contacts.push({ user: oppositeId });

  // save the new data
  await target.save();
} // the logic
async function sendBackNewUserData(userId, exemptedUserInfos) {
  const JWT_SECRET = process.env.JWT_SECRET;
  const user = await User.findById(userId)
    .select(['-password', ...exemptedUserInfos])
    .lean();

  const token = jwt.sign(user, JWT_SECRET);
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
