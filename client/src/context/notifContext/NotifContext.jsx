import {
  createContext,
  useReducer,
  useEffect,
  useContext,
  useState,
} from 'react';
import api from '../../utils/apiAxios/apiAxios';
import NOTIF_CONTEXT_ACTIONS from './notifContextActions';
import notifReducer from './notifContextReducer';
import { UserContext } from '../user/userContext';
import socket from '../../utils/socketClient/socketClient';

const NOTIF_DEFAULT = {
  isStarting: false,
  isLoading: false,
  isLoaded: false,
  isStartingUpdate: false,
  isUpdateLoaded: false,
  content: {
    inbox: [],
    outbox: [],
  },
  error: null,

  // content
  //    {
  //     notifications: {
  //       inbox: [
  //         {
  //           iat: { type: Date, default: new Date() },
  //           seen: { type: Boolean, default: false },
  //           contents: { type: mongoose.Schema.Types.Mixed },
  //         },
  //       ],
  //       outbox: [
  //         {
  //           iat: { type: Date, default: new Date() },
  //           seen: { type: Boolean, default: false },
  //           contents: { type: mongoose.Schema.Types.Mixed },
  //         },
  //       ],
  //     },
  //     // this'll only contain requests notifications
  //     requests: {
  //       contacts: {
  //         inbox: [
  //           {
  //             by: { type: mongoose.Schema.ObjectId, ref: 'user' },
  //             seen: { type: Boolean, default: false },
  //             answer: { type: Boolean, default: null },
  //             iat: { type: Date, default: new Date() },
  //           },
  //         ],
  //         outbox: [
  //           {
  //             by: { type: mongoose.Schema.ObjectId, ref: 'user' },
  //             seen: { type: Boolean, default: false },
  //             answer: { type: Boolean, default: null },
  //             iat: { type: Date, default: new Date() },
  //           },
  //         ],
  //       },
  //     },
  //   },
};

export const NotifContext = createContext(NOTIF_DEFAULT);

export default function NotifContextProvider({ children }) {
  const [notifs, notifsDispatch] = useReducer(notifReducer, NOTIF_DEFAULT);
  const [unseen, setUnseen] = useState(0);
  const { userState } = useContext(UserContext);

  // get all notifications for initial loading
  useEffect(() => {
    if (
      notifs.content.outbox.length > 0 ||
      notifs.content.inbox.length > 0 ||
      !userState.user
    )
      return;

    const getAllNotifs = async () => {
      try {
        notifsDispatch({ type: NOTIF_CONTEXT_ACTIONS.start });

        notifsDispatch({ type: NOTIF_CONTEXT_ACTIONS.loading });
        const { data } = await api.get(
          '/notification/get_all_notifications?full=true',
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem('token')}`,
            },
          }
        );

        notifsDispatch({
          type: NOTIF_CONTEXT_ACTIONS.loaded,
          payload: data.notifications,
        });
      } catch (error) {
        notifsDispatch({ type: NOTIF_CONTEXT_ACTIONS.error, payload: error });
        console.error(error);
      }
    };

    getAllNotifs();
  }, [userState]);

  return (
    <NotifContext.Provider
      value={{ notifs, notifsDispatch, unseen, setUnseen }}
    >
      {children}
    </NotifContext.Provider>
  );
}

export const receiveSendAddContact = ({
  notifs,
  notifsDispatch,
  notifActions,
}) => {
  socket.off('receive-send-add-contact');
  socket.on('receive-send-add-contact', ({ success, notif, type }) => {
    if (success) {
      const updatedNotifs = {
        ...notifs.content,
        [type]: [...notifs.content[type], notif],
      };

      notifsDispatch({
        type: notifActions.updateLoaded,
        payload: updatedNotifs,
      });
    }
  });
};

export const receiveCancelAddContact = ({
  notifs,
  notifsDispatch,
  notifActions,
  userState,
}) => {
  socket.off('receive-cancel-add-contact');
  socket.on(
    'receive-cancel-add-contact',
    ({ senderId, recipientId, success, type }) => {
      if (success) {
        // check to see which id to use for removing the contact request
        const idForSearching =
          userState.user._id === senderId ? recipientId : senderId;

        // filter the notifs where the by field is not the same as idForSearching
        const updatedNotifs = {
          ...notifs.content,
          [type]: notifs.content[type].filter(
            (item) => item.by._id !== idForSearching
          ),
        };

        notifsDispatch({
          type: notifActions.updateLoaded,
          payload: updatedNotifs,
        });
      }
    }
  );
};

export const receiveContactRequestResponse = ({
  contacts,
  setContacts,
  token,
  userState,
}) => {
  socket.off('receive-contact-request-response');

  socket.on('receive-contact-request-response', async (data) => {
    if (data) {
      // fetch the user preview using the id that is different from the current userState id
      const idToFetch =
        data.recipientId !== userState.user._id
          ? data.recipientId
          : data.senderId;

      const userPreview = await api.get(
        `/query/user/get_users_preview?userIds=${idToFetch}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setContacts([...contacts, userPreview.data[0]]);
      setTimeout(() => socket.emit('refresh-msg-log'), 500);
    }
  });
};
