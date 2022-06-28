export const NOTIFICATIONS_ACTIONS = {
  isStart: 'isStart',
  isLoading: 'isLoading',
  isLoaded: 'isLoaded',
  isError: 'isError',
};
const { isStart, isLoading, isError, isLoaded } = NOTIFICATIONS_ACTIONS;

export const NOTIFICATIONS_DEFAULT = {
  isLoading: false,
  contents: { inbox: [], outbox: [] },
  error: null,
};

export default function notificationsReducer(state, { type, payload }) {
  switch (type) {
    case isStart:
      return NOTIFICATIONS_DEFAULT;

    case isLoading:
      return {
        contents: { inbox: [], outbox: [] },
        error: null,
        isLoading: true,
      };

    case isLoaded:
      return {
        contents: payload,
        isLoading: false,
        error: null,
      };

    case isError:
      return {
        isLoading: false,
        error: payload,
        contents: { inbox: [], outbox: [] },
      };

    default:
      return NOTIFICATIONS_DEFAULT;
  }
}
