export const SEARCH_RESULTS_ACTIONS = {
  start: "start",
  loading: "loading",
  error: "error",
  loaded: "loaded",
};

export const SEARCH_RESULTS_DEFAULT = {
  start: false,
  loading: false,
  content: null,
  error: null,
};

export default function searchResultsReducer(state, action) {
  switch (action.type) {
    case SEARCH_RESULTS_ACTIONS.start:
      return SEARCH_RESULTS_DEFAULT;

    case SEARCH_RESULTS_ACTIONS.loading:
      return {
        ...state,
        loading: true,
      };

    case SEARCH_RESULTS_ACTIONS.error:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case SEARCH_RESULTS_ACTIONS.loaded:
      return {
        ...state,
        loading: false,
        content: action.payload,
      };
    default:
      return state;
  }
}
