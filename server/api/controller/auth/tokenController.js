import jwt from "jsonwebtoken";
import createError from "../../../utils/createError.js";

export default function verifyToken(req, res, next) {
  const authorization = req.headers.authorization;

  // check if the client passed in an authentication token
  if (!authorization) {
    return createError(next, 403, "Pass in an auth token to proceed !");
  }

  // check if the body contains token key
  try {
    const [prefix, token] = authorization.split(" ");
    const secret = process.env.JWT_SECRET;

    // check if tokeen signature is verified
    const isVerified = jwt.verify(token, secret);
    if (isVerified) {
      res.locals.tokenData = isVerified;
      next();
    }
  } catch (error) {
    console.log(
      "🚀 ~ file: tokenController.js ~ line 24 ~ verifyToken ~ error",
      error
    );
    next(error);
  }
}

export function renewToken(data, secret) {
  return jwt.sign(data, secret, { expiresIn: "6h" });
}
