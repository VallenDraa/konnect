import jwt from 'jsonwebtoken';

export default function verifyToken(req, res, next) {
  // check if the body contains token key
  try {
    const { token } = req.body['token'] ? req.body : req.query;
    const secret = process.env.JWT_SECRET;

    // check if tokeen signature is verified
    if (jwt.verify(token, secret)) {
      next();
    }
  } catch (error) {
    console.log(error, 'verifytoken');
    next(error);
  }
}

export function renewToken(data, secret) {
  return jwt.sign(data, secret, { expiresIn: '6h' });
}
