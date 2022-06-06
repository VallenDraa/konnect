import MODAL_ACTIONS from './modalActions';
export default function modalReducer(state, action) {
  switch (action.type) {
    case MODAL_ACTIONS.show:
      return {
        isActive: true,
        content: action.content,
      };
    case MODAL_ACTIONS.close:
      return {
        isActive: false,
        content: null,
      };
    default:
      return state;
  }
}
