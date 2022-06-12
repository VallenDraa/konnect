/**
 *
 * @param {Function} next an express next method to call the error
 * @param {Number} status an HTTP status code
 * @param {String} message message that explains/give further instruction regarding the error
 * @param  {Object} additionalInfo object containing additional info which will be appended to the JSON response
 *
 * @return {} will return the next method and also send a JSON response back to the client
 *
 */

export default function createError(next, status, message, additionalInfo) {
  const err = new Error();
  err.message = message;
  err.status = status;

  if (additionalInfo) Object.assign(err, additionalInfo);

  next(err);
  return;
}
