import User from '../../../model/User.js';

export const sendRequestToRecipient = async (req, res, next) => {
  const { recipientId, senderId } = req.query;

  try {
    const recipient = await User.findById(recipientId);

    // if request exists then cancel the request
    if (recipient.requests.contacts.from.includes(senderId)) {
      recipient.requests.contacts.from =
        recipient.requests.contacts.from.filter((id) => id === senderId);

      recipient.markModified('requests.contacts.from');
      await recipient.save();

      const { password, __v, iat, ...newUserData } = recipient._doc;
      return res.json({ newUserData, cancelRequest: true });
    } else {
      recipient.requests.contacts.from.push(senderId);
      await recipient.save();

      const { password, __v, iat, ...newUserData } = recipient._doc;
      res.json({ newUserData, success: true });
    }
  } catch (error) {
    next(error);
  }
};

export const queueRequestToSender = async (req, res, next) => {
  const { recipientId, senderId } = req.query;

  try {
    const sender = await User.findById(senderId);

    // if request exists then cancel the request
    if (sender.requests.contacts.to.includes(recipientId)) {
      sender.requests.contacts.to = sender.requests.contacts.to.filter(
        (id) => id === recipientId
      );

      sender.markModified('requests.contacts.to');

      await sender.save();

      const { password, __v, iat, ...newUserData } = sender._doc;
      return res.json({ newUserData, cancelRequest: true });
    } else {
      sender.requests.contacts.to.push(recipientId);
      await sender.save();

      const { password, __v, iat, ...newUserData } = sender._doc;
      res.json({ newUserData, success: true });
    }
  } catch (error) {
    next(error);
  }
};
