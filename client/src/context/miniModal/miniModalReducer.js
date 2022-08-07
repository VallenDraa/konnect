import MINI_MODAL_ACTIONS from "./miniModalActions";

export default function miniModalReducer(state, { type, payload }) {
  switch (type) {
    case MINI_MODAL_ACTIONS.show:
      return {
        isActive: true,
        isClosing: false,
        title: payload.title,
        closeButton: payload.closeButton,
        content: payload.content,
      };
    case MINI_MODAL_ACTIONS.close:
      return {
        isActive: false,
        isClosing: false,
        title: null,
        closeButton: false,
        content: null,
      };
    case MINI_MODAL_ACTIONS.closing:
      return {
        ...state,
        isActive: true,
        isClosing: true,
      };
    default:
      return state;
  }
}
