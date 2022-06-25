export const ADD_REQUEST_SENT_ACTIONS = {
  Start: 'Start',
  Loading: 'Loading',
  Sent: 'Sent',
  Error: 'Error',
};
const { Start, Loading, Error, Sent } = ADD_REQUEST_SENT_ACTIONS;

export const ADD_REQUEST_SENT_DEFAULT = {
  Loading: false,
  Sent: false,
  error: null,
};

export default function addRequestSentReducer(state, { type, payload }) {
  switch (type) {
    case Start:
      return ADD_REQUEST_SENT_DEFAULT;

    case Loading:
      return {
        Sent: false,
        error: null,
        Loading: true,
      };

    case Sent:
      return {
        Loading: false,
        Sent: true,
        error: null,
      };

    case Error:
      return {
        Loading: false,
        error: payload,
        Sent: false,
      };

    default:
      return ADD_REQUEST_SENT_DEFAULT;
  }
}
