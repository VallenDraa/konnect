import User from "../../../../model/User.js";
import createError from "../../../../utils/createError.js";

export const sendContactRequest = async (req, res, next) => {
  const { recipientId, senderId } = req.body;

  try {
    const users = await User.where("_id").equals([recipientId, senderId]);

    // if the result doesn't return 2 data which is the recipient and sender
    if (users.length !== 2) {
      return createError(next, 400, "Invalid arguments !");
    }

    // seperate into sender and recipient
    const sender = users.find((s) => s._id.toString() === senderId);
    const recipient = users.find((r) => r._id.toString() === recipientId);
    const senderOutbox = sender.requests.contacts.outbox;
    const recipientInbox = recipient.requests.contacts.inbox;

    // check if requests has already been sent
    const isRequestSentButNotAnswered = senderOutbox.some(
      ({ by, answer }) => by.toString() === recipientId && answer === null
    );
    if (isRequestSentButNotAnswered) {
      return createError(
        next,
        409,
        "A contact request has been sent to this user !"
      );
    }

    const senderPrevReq = senderOutbox.findIndex(({ by, answer }) => {
      return by.toString() === recipientId && answer !== null;
    });
    const recipientPrevReq = recipientInbox.findIndex(({ by, answer }) => {
      return by.toString() === senderId && answer !== null;
    });

    const iat = new Date();
    if (senderPrevReq === -1 && recipientPrevReq === -1) {
      // push the request to the database
      senderOutbox.push({ by: recipientId, iat });
      recipientInbox.push({ by: senderId, iat });
    } else {
      senderOutbox[senderPrevReq].answer = null;
      recipientInbox[recipientPrevReq].answer = null;
    }

    // save it to the database
    await sender.save();
    await recipient.save();

    const senderNotif = senderOutbox[senderOutbox.length - 1];
    const { by: senderBy, ...newSenderNotif } = senderNotif._doc;

    const recipientNotif = recipientInbox[recipientInbox.length - 1];
    const { by: recipientBy, ...newRecipientNotif } = recipientNotif._doc;

    res.json({
      success: true,
      iat,
      senderNotif: {
        ...newSenderNotif,
        type: "contact_request",
        by: {
          _id: recipient._id,
          username: recipient.username,
          initials: recipient.initials,
          profilePicture: recipient.profilePicture,
        },
      },
      recipientNotif: {
        ...newRecipientNotif,
        type: "contact_request",
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
    const users = await User.where("_id").equals([recipientId, senderId]);

    // if the result doesn't return 2 data which is the recipient and sender
    if (users.length !== 2) {
      return createError(next, 400, "Invalid arguments !");
    }

    // seperate into sender and recipient
    const sender = users.find((s) => s._id.toString() === senderId);
    const recipient = users.find((r) => r._id.toString() === recipientId);
    const senderOutbox = sender.requests.contacts.outbox;
    const recipientInbox = recipient.requests.contacts.inbox;

    // push the answer to the database
    for (const i in senderOutbox) {
      if (senderOutbox[i].by.toString() === recipientId) {
        senderOutbox[i].answer = answer;
        break;
      }
    }
    for (const i in recipientInbox) {
      if (recipientInbox[i].by.toString() === senderId) {
        recipientInbox[i].answer = answer;
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

  try {
    const users = await User.where("_id").equals([recipientId, senderId]);

    // if the result doesn't return 2 data which is the recipient and sender
    if (users.length !== 2) {
      return createError(next, 400, "Invalid arguments !");
    }

    // seperate into sender and recipient
    const sender = users.find((s) => s._id.toString() === senderId);
    const recipient = users.find((r) => r._id.toString() === recipientId);
    const senderOutbox = sender.requests.contacts.outbox;
    const recipientInbox = recipient.requests.contacts.inbox;

    // check if requests has already been sent
    const isMissing = senderOutbox.every(({ by }) => {
      return by.toString() !== recipientId;
    });
    if (isMissing) return createError(next, 409, "Invalid passed in ids !");

    // delete the request to the database
    sender.requests.contacts.outbox = senderOutbox.filter(
      (item) => item.by.toString() !== recipientId
    );
    recipient.requests.contacts.inbox = recipientInbox.filter(
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
