import jwt from "jsonwebtoken";
import createError from "../../../utils/createError.js";

export default function verifyToken(req, res, next) {
  try {
    // check if the body contains token key
    const authorization = req.headers.authorization;

    // check if the client passed in an authentication token
    if (!authorization) {
      return createError(next, 403, "Pass in an auth token to proceed !");
    }
    const [prefix, token] = authorization.split(" ");
    const secret = process.env.JWT_SECRET;

    // check if tokeen signature is verified
    const isVerified = jwt.verify(token, secret);
    if (isVerified) {
      res.locals.tokenData = isVerified;
      next();
    }
  } catch (error) {
    next(error);
  }
}

export function renewToken(data, secret) {
  return jwt.sign(data, secret, { expiresIn: "3h" });
}
