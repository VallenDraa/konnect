import User from '../../../../model/User.js';
import createError from '../../../../utils/createError.js';
import { renewToken } from '../../auth/tokenController.js';

export const saveMessage = async (req, res, next) => {
  const { mode } = req.body;
  const { to, ...msgToPush } = req.body.message;

  if (mode !== 'sender' && mode !== 'receiver') {
    return createError(
      next,
      400,
      'invalid arguments, pass in either sender or receiver'
    );
  }

  //   save message
  try {
    const target = await User.findById(
      mode === 'sender' ? msgToPush.by : to
    ).select('-password');

    const saveMsgTo = mode === 'sender' ? to : msgToPush.by;
    target.contacts.forEach(({ user }, i) => {
      user.toString() === saveMsgTo && target.contacts[i].chat.push(msgToPush);
    });
    await target.save();

    return res.json({ message: req.body.message, success: true });
  } catch (error) {
    next(error);
  }
};

export const deleteMessage = async (req, res, next) => {};
