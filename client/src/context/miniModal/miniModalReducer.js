import MINI_MODAL_ACTIONS from './miniModalActions';

export default function miniModalReducer(
  state,
  { type, onExitReturnToHome, content }
) {
  switch (type) {
    case MINI_MODAL_ACTIONS.show:
      return {
        isActive: true,
        onExitReturnToHome: onExitReturnToHome || false,
        content: content,
      };
    case MINI_MODAL_ACTIONS.close:
      return {
        isActive: false,
        onExitReturnToHome: onExitReturnToHome || false,
        content: null,
      };
    default:
      return state;
  }
}
