import MODAL_ACTIONS from './modalActions';

export default function modalReducer(
  state,
  { type, pathname, onExitReturnToHome, content }
) {
  switch (type) {
    case MODAL_ACTIONS.show:
      return {
        isActive: true,
        pathname: pathname || null,
        onExitReturnToHome: onExitReturnToHome || false,
        content: content,
      };
    case MODAL_ACTIONS.close:
      return {
        isActive: false,
        pathname: pathname || null,
        onExitReturnToHome: onExitReturnToHome || false,
        content: null,
      };
    default:
      return state;
  }
}
