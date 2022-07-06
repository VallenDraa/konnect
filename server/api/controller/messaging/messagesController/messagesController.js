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

    target.contacts.forEach(({ user }, i) => {
      if ((user.toString() === mode) === 'sender' ? to : msgToPush.by) {
        target.contacts[i].chat.push(msgToPush);
      }
    });
    await target.save();

    const token = renewToken(target._doc, process.env.JWT_SECRET);

    return res.json({ user: target, token, success: true });
  } catch (error) {
    next(error);
  }
};

export const deleteMessage = async (req, res, next) => {};
