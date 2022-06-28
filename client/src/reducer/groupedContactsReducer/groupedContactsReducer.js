export const GROUPED_CONTACTS_ACTIONS = {
  isStarting: 'isStarting',
  isStartingUpdate: 'isStartingUpdate',
  isLoading: 'isLoading',
  isLoaded: 'isLoaded',
  isError: 'isError',
};
const { isStarting, isStartingUpdate, isLoading, isError, isLoaded } =
  GROUPED_CONTACTS_ACTIONS;

export const GROUPED_CONTACTS_DEFAULT = {
  isLoading: false,
  isStarting: true,
  contents: [],
  error: null,
};

export default function groupedContactsReducer(state, { type, payload }) {
  switch (type) {
    case isStarting:
      return GROUPED_CONTACTS_DEFAULT;

    case isStartingUpdate:
      return {
        ...state,
        isStarting: true,
        isLoading: false,
        error: null,
      };

    case isLoading:
      return {
        ...state,
        isStarting: false,
        isLoading: true,
        error: null,
      };

    case isLoaded:
      return {
        contents: payload,
        isStarting: false,
        isLoading: false,
        error: null,
      };

    case isError:
      return {
        ...state,
        isLoading: false,
        isStarting: false,
        error: payload,
      };

    default:
      return GROUPED_CONTACTS_DEFAULT;
  }
}
