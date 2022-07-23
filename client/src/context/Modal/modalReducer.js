import MODAL_ACTIONS from './modalActions';

export default function modalReducer(
  state,
  { type, onExitReturnToHome, content, prevUrl, title }
) {
  switch (type) {
    case MODAL_ACTIONS.show:
      return {
        isActive: true,
        onExitReturnToHome: onExitReturnToHome || false,
        prevUrl,
        content: content,
        title,
      };
    case MODAL_ACTIONS.close:
      return {
        isActive: false,
        onExitReturnToHome: onExitReturnToHome || false,
        prevUrl,
        content: null,
        title: null,
      };
    default:
      return state;
  }
}
