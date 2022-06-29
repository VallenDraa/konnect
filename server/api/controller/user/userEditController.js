import createError from '../../../utils/createError.js';
import { renewToken } from '../auth/tokenController.js';
import User from '../../../model/User.js';

export const editProfile = async (req, res, next) => {};

export const editAccount = async (req, res, next) => {};

export const editSettings = async (req, res, next) => {};

export const unfriend = async (req, res, next) => {
  const { targetId, myId } = req.body;

  // remove the contact from my account
  try {
    const me = await User.findById(myId).select(global.exemptedUserInfos);

    // check if the target is still in the contact
    const isStillInContact = me.contacts.some(
      (contact) => contact.user.toString() === targetId
    );
    if (!isStillInContact) {
      return createError(next, 404, 'Invalid target id !');
    }

    me.contacts = me.contacts.filter(
      (contact) => contact.user.toString() !== targetId
    );

    await me.save();

    const token = renewToken(me._doc, process.env.JWT_SECRET);

    res.json({ user: me._doc, token, success: true });
  } catch (error) {
    next(error);
  }

  // remove me from the target's contact
};
