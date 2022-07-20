import User from '../../../../model/User.js';
import createError from '../../../../utils/createError.js';

export const sendContactRequest = async (req, res, next) => {
  const { recipientId, senderId } = req.body;

  try {
    const users = await User.where('_id').equals([recipientId, senderId]);

    // if the result doesn't return 2 data which is the recipient and sender
    if (users.length !== 2) {
      return createError(next, 400, 'Invalid arguments !');
    }

    // seperate into sender and recipient
    const sender = users.find((s) => s._id.toString() === senderId);
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

    const iat = new Date();
    // push the request to the database
    sender.requests.contacts.outbox.push({ by: recipientId, iat });
    recipient.requests.contacts.inbox.push({ by: senderId, iat });

    // save it to the database
    await sender.save();
    await recipient.save();

    const senderNotif =
      sender.requests.contacts.outbox[
        sender.requests.contacts.outbox.length - 1
      ];
    const { by: senderBy, ...newSenderNotif } = senderNotif._doc;

    const recipientNotif =
      recipient.requests.contacts.inbox[
        recipient.requests.contacts.inbox.length - 1
      ];
    const { by: recipientBy, ...newRecipientNotif } = recipientNotif._doc;

    res.json({
      success: true,
      iat,
      senderNotif: {
        ...newSenderNotif,
        type: 'contact_request',
        by: {
          _id: recipient._id,
          username: recipient.username,
          initials: recipient.initials,
          profilePicture: recipient.profilePicture,
        },
      },
      recipientNotif: {
        ...newRecipientNotif,
        type: 'contact_request',
        by: {
          _id: sender._id,
          username: sender.username,
          initials: sender.initials,
          profilePicture: sender.profilePicture,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const respondToContactRequest = async (req, res, next) => {
  const { senderId, recipientId, answer } = req.body;

  try {
    const users = await User.where('_id').equals([recipientId, senderId]);

    // if the result doesn't return 2 data which is the recipient and sender
    if (users.length !== 2) {
      return createError(next, 400, 'Invalid arguments !');
    }

    // seperate into sender and recipient
    const sender = users.find((s) => s._id.toString() === senderId);
    const recipient = users.find((r) => r._id.toString() === recipientId);

    // push the answer to the database
    for (const i in sender.requests.contacts.outbox) {
      if (sender.requests.contacts.outbox[i].by.toString() === recipientId) {
        sender.requests.contacts.outbox[i].answer = answer;
        break;
      }
    }
    for (const i in recipient.requests.contacts.inbox) {
      if (recipient.requests.contacts.inbox[i].by.toString() === senderId) {
        recipient.requests.contacts.inbox[i].answer = answer;
        break;
      }
    }

    // add each other contact if answer is true
    if (answer) {
      sender.contacts.push({ user: recipientId });
      recipient.contacts.push({ user: senderId });
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
  const { recipientId, senderId } = req.body;
  console.log(recipientId, senderId);

  try {
    const users = await User.where('_id').equals([recipientId, senderId]);

    // if the result doesn't return 2 data which is the recipient and sender
    if (users.length !== 2) {
      return createError(next, 400, 'Invalid arguments !');
    }

    // seperate into sender and recipient
    const sender = users.find((s) => s._id.toString() === senderId);
    const recipient = users.find((r) => r._id.toString() === recipientId);

    // check if requests has already been sent
    const isMissing = sender.requests.contacts.outbox.every(({ by }) => {
      return by.toString() !== recipientId;
    });
    if (isMissing) return createError(next, 409, 'Invalid passed in ids !');

    // delete the request to the database
    sender.requests.contacts.outbox = sender.requests.contacts.outbox.filter(
      (item) => item.by.toString() !== recipientId
    );
    recipient.requests.contacts.inbox =
      recipient.requests.contacts.inbox.filter(
        (item) => item.by.toString() !== senderId
      );

    // save it to the database
    await sender.save();
    await recipient.save();

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
