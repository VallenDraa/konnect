import createError from '../../../utils/createError.js';
import { renewToken } from '../auth/tokenController.js';
import User from '../../../model/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export const editProfile = async (req, res, next) => {
  const { firstName, lastName, status, token } = req.body;

  try {
    // decode token
    const { _id } = jwt.decode(token);

    const user = await User.findById(_id);

    user.firstName = firstName;
    user.lastName = lastName;
    user.status = status;

    await user.save();

    const newToken = renewToken(user._doc, process.env.JWT_SECRET);

    res.json({ user: user._doc, token: newToken, success: true });
  } catch (error) {
    next(error);
  }
};

export const editAccount = async (req, res, next) => {
  const { password, username, token } = req.body;

  try {
    // check if the username is already taken
    try {
      const isUsernameTaken = await User.exists({ username });
      isUsernameTaken && createError(next, 401, 'Invalid username or password');
    } catch (error) {
      next(error);
    }

    // decode token
    const { _id } = jwt.decode(token);

    try {
      const user = await User.findById(_id);

      // if password is incorrect send error to client
      const isPwCorrect = await bcrypt.compare(password, user.password);
      !isPwCorrect && createError(next, 401, 'Invalid username or password');

      // change username
      user.username = username;

      await user.save();
    } catch (error) {
      next(error);
    }

    // decrypt password
  } catch (error) {
    next(error);
  }
};

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
