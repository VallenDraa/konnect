export const ADD_REQUEST_SENT_ACTIONS = {
  isStart: 'isStart',
  isLoading: 'isLoading',
  isSent: 'isSent',
  isError: 'isError',
};
const { isStart, isLoading, isError, isSent } = ADD_REQUEST_SENT_ACTIONS;

export const ADD_REQUEST_SENT_DEFAULT = {
  isLoading: false,
  isSent: false,
  error: null,
};

export default function addRequestSentReducer(state, { type, payload }) {
  switch (type) {
    case isStart:
      return ADD_REQUEST_SENT_DEFAULT;

    case isLoading:
      return {
        isSent: false,
        error: null,
        isLoading: true,
      };

    case isSent:
      return {
        isLoading: false,
        isSent: true,
        error: null,
      };

    case isError:
      return {
        isLoading: false,
        error: payload.error,
        isSent: false,
      };

    default:
      return ADD_REQUEST_SENT_DEFAULT;
  }
}
