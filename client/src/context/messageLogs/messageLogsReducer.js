import MESSAGE_LOGS_ACTIONS from './messageLogsActions';

export default function messageLogsReducer(state, action) {
  switch (action.type) {
    case MESSAGE_LOGS_ACTIONS.start:
      return {
        ...state,
        isStartingUpdate: false,
        isStarting: true,
        isInitialLoading: false,
        isLoaded: false,
        error: null,
      };
    case MESSAGE_LOGS_ACTIONS.initialLoading:
      return {
        ...state,
        isStartingUpdate: false,
        isStarting: false,
        isInitialLoading: true,
        isLoaded: false,
        error: null,
      };

    case MESSAGE_LOGS_ACTIONS.error:
      return {
        ...state,
        isStartingUpdate: false,
        isStarting: false,
        isInitialLoading: false,
        isLoaded: false,
        error: action.payload,
      };

    case MESSAGE_LOGS_ACTIONS.loaded:
      return {
        content: action.payload,
        isStartingUpdate: false,
        error: null,
        isStarting: false,
        isInitialLoading: false,
        isLoaded: true,
      };

    case MESSAGE_LOGS_ACTIONS.startUpdate:
      return {
        ...state,
        isStartingUpdate: false,

        isStarting: true,
        isInitialLoading: false,
        isLoaded: false,
        error: null,
      };

    case MESSAGE_LOGS_ACTIONS.updateError:
      return {
        ...state,
        isStartingUpdate: false,
        isStarting: false,
        isInitialLoading: false,
        isLoaded: false,
        error: action.payload,
      };

    case MESSAGE_LOGS_ACTIONS.updateLoaded:
      return {
        content: action.payload,
        isStartingUpdate: false,
        isStarting: false,
        isInitialLoading: false,
        isLoaded: true,
        error: null,
      };

    default:
      return state;
  }
}
