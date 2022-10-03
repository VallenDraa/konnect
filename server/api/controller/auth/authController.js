import UserModel from "../../../model/User.js";
import createError from "../../../utils/createError.js";
import bcrypt from "bcrypt";
import { renewToken } from "./tokenController.js";
import emojiTest from "../../../utils/emojiTest.js";
import jwt from "jsonwebtoken";

export const register = async (req, res, next) => {
  const isUsingEmoji = emojiTest(Object.values(req.body));
  if (isUsingEmoji) return createError(next, 400, "Refrain from using emoji");

  const { username, password, email } = req.body;

  const initials = username
    .split(" ")
    .map((word, i) => i < 3 && word.substring(0, 1))
    .join("");

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
          "Username or Email has been taken, please choose another one !",
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
        settings: { general: { animation: true, menuSwiping: true } },
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
    const user = await UserModel.findOne({ username })
      .select(global.exemptedUserInfos)
      .lean();

    if (user === null) {
      return createError(next, 401, "Username or password is invalid !");
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (isPasswordCorrect) {
      const { password, ...otherData } = user;

      // send user data back as a JWT token
      const token = renewToken(otherData, process.env.JWT_SECRET);
      const refreshToken = jwt.sign(otherData, process.env.JWT_REFRESH_SECRET);

      global.refreshTokens[user._id.toString()] = refreshToken;

      res.json({ token, refreshToken, user: otherData });
    } else {
      return createError(next, 401, "Username or password is invalid !");
    }
  } catch (error) {
    next(error);
  }
};
