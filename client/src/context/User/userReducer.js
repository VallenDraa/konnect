import USER_ACTIONS from './userAction';

export default function userReducer(state, action) {
  switch (action.type) {
    case USER_ACTIONS.loginStart:
      return { user: null, error: null };

    case USER_ACTIONS.loginFail:
      return { user: null, error: action.payload };

    case USER_ACTIONS.loginSuccess:
      return { user: action.payload, error: null };

    case USER_ACTIONS.updateStart:
      return { ...state, error: null };

    case USER_ACTIONS.updateFail:
      return { ...state, error: action.payload };

    case USER_ACTIONS.updateSuccess:
      return { user: action.payload, error: null };

    case USER_ACTIONS.logout:
      return { user: null, error: null };

    default:
      return state;
  }
}
