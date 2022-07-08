import UserModel from '../../../model/User.js';
import createError from '../../../utils/createError.js';
import bcrypt from 'bcrypt';
import { renewToken } from './tokenController.js';
import emojiTest from '../../../utils/emojiTest.js';

export const register = async (req, res, next) => {
  const isUsingEmoji = emojiTest(Object.values(req.body));
  if (isUsingEmoji) return createError(next, 400, 'Refrain from using emoji');

  const { username, password, email } = req.body;

  const initials = username
    .split(' ')
    .map((word, i) => i < 3 && word.substring(0, 1))
    .join('');

  try {
    // check if the inputted username or email has already been taken
    try {
      const isUserExists = await UserModel.exists({
        $or: [{ username }, { email }],
      });

      if (isUserExists) {
        return createError(
          next,
          409,
          'Username or Email has been taken, please choose another one !',
          { success: false }
        );
      }
    } catch (error) {
      next(error);
    }

    try {
      const hashedPW = await bcrypt.hash(password, 10);
      await UserModel.create({
        username,
        initials,
        password: hashedPW,
        email,
      });
    } catch (error) {
      next(error);
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const user = await UserModel.findOne({ username }).select(
      global.exemptedUserInfos
    );

    if (user === null) {
      return createError(next, 401, 'Username or password is invalid !');
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (isPasswordCorrect) {
      const { password, ...otherData } = user._doc;

      // send user data back as a JWT token
      const secret = process.env.JWT_SECRET;
      const token = renewToken(otherData, secret);
      res.json({ token, user: otherData });
    } else {
      return createError(next, 401, 'Username or password is invalid !');
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};
