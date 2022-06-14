import MODAL_ACTIONS from './modalActions';
export default function modalReducer(state, action) {
  switch (action.type) {
    case MODAL_ACTIONS.show:
      return {
        isActive: true,
        onExitReturnToHome: action.onExitReturnToHome || true,
        content: action.content,
      };
    case MODAL_ACTIONS.close:
      return {
        isActive: false,
        onExitReturnToHome: action.onExitReturnToHome || true,
        content: null,
      };
    default:
      return state;
  }
}
