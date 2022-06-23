import MODAL_ACTIONS from './modalActions';

export default function modalReducer(
  state,
  { type, onExitReturnToHome, content }
) {
  switch (type) {
    case MODAL_ACTIONS.show:
      return {
        isActive: true,
        onExitReturnToHome: onExitReturnToHome || false,
        content: content,
      };
    case MODAL_ACTIONS.close:
      return {
        isActive: false,
        onExitReturnToHome: onExitReturnToHome || false,
        content: null,
      };
    default:
      return state;
  }
}
