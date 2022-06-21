import jwt from 'jsonwebtoken';
import User from '../../../../model/User.js';
import createError from '../../../../utils/createError.js';

export const sendRequestToRecipient = async (req, res, next) => {
  const { recipientId, senderId } = req.body;
  const JWT_SECRET = process.env.JWT_SECRET;

  try {
    // check if passed ids exists
    if (!(await User.exists({ _id: recipientId })))
      return createError(
        next,
        404,
        "The recipient for the contact request doesn't exist"
      );
    if (!(await User.exists({ _id: senderId })))
      return createError(
        next,
        404,
        "The sender for the contact request doesn't exist"
      );

    const recipient = await User.findById(recipientId);
    const isRequestExists = recipient.requests.contacts.inbox.some(
      (request) => request.by.toString() === senderId
    );
    console.log(isRequestExists);
    const contactInbox = recipient.requests.contacts.inbox;

    // if request exists then cancel the request
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
        '-requests.contacts.inbox.by',
        '-requests.contacts.inbox.seen',
        '-requests.contacts.inbox.iat',
        '-requests.contacts.outbox.by',
        '-requests.contacts.outbox.seen',
        '-requests.contacts.outbox.iat',
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

  try {
    // check if passed ids exists
    if (!(await User.exists({ _id: recipientId })))
      return createError(
        next,
        404,
        "The recipient for the contact request doesn't exist"
      );
    if (!(await User.exists({ _id: senderId })))
      return createError(
        next,
        404,
        "The sender for the contact request doesn't exist"
      );

    const sender = await User.findById(senderId);
    const isRequestExists = sender.requests.contacts.outbox.some(
      (request) => request.by.toString() === recipientId
    );
    const contactOutbox = sender.requests.contacts.outbox;

    // if request exists then cancel the request
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
        '-requests.contacts.inbox.by',
        '-requests.contacts.inbox.seen',
        '-requests.contacts.inbox.iat',
        '-requests.contacts.outbox.by',
        '-requests.contacts.outbox.seen',
        '-requests.contacts.outbox.iat',
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

export const removeContactRequest = async (senderId, recipientId) => {};
