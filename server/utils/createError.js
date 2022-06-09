export default function makeError(status, message) {
  const err = new Error();
  err.message = message;
  err.status = status;

  throw err;
}
