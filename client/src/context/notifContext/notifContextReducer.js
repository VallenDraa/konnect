import NOTIF_CONTEXT_ACTIONS from './notifContextActions';

export default function notifReducer(state, action) {
  switch (action.type) {
    case NOTIF_CONTEXT_ACTIONS.start:
      return {
        ...state,
        isStartingUpdate: false,
        isStarting: true,
        isLoading: false,
        isLoaded: false,
        error: null,
      };

    case NOTIF_CONTEXT_ACTIONS.loading:
      return {
        ...state,
        isStartingUpdate: false,
        isStarting: false,
        isLoading: true,
        isLoaded: false,
        error: null,
      };

    case NOTIF_CONTEXT_ACTIONS.error:
      return {
        ...state,
        isStartingUpdate: false,
        isStarting: false,
        isLoading: false,
        isLoaded: false,
        error: action.payload,
      };

    case NOTIF_CONTEXT_ACTIONS.loaded:
      return {
        content: action.payload,
        isStartingUpdate: false,
        error: null,
        isStarting: false,
        isLoading: false,
        isLoaded: true,
      };

    case NOTIF_CONTEXT_ACTIONS.startUpdate:
      return {
        ...state,
        isStartingUpdate: false,
        isStarting: true,
        isLoading: false,
        isLoaded: false,
        error: null,
      };

    case NOTIF_CONTEXT_ACTIONS.updateLoaded:
      return {
        content: action.payload,
        isStartingUpdate: false,
        isStarting: false,
        isLoading: false,
        isLoaded: true,
        error: null,
      };

    default:
      return state;
  }
}
