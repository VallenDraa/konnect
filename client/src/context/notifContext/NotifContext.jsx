import {
  createContext,
  useReducer,
  useEffect,
  useContext,
  useState,
} from "react";
import api from "../../utils/apiAxios/apiAxios";
import NOTIF_CONTEXT_ACTIONS from "./notifContextActions";
import notifReducer from "./notifContextReducer";
import { UserContext } from "../user/userContext";
import socket from "../../utils/socketClient/socketClient";
import { MdOutlineMoveToInbox, MdOutlineOutbox } from "react-icons/md";
import newNotifSfx from "../../audio/newNotifSfx.mp3";
import { playAudio } from "../../utils/AudioPlayer/audioPlayer";
const newNotifAudio = new Audio(newNotifSfx);
newNotifAudio.volume = 0.6;

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

const NOTIFICATION_TABS = [
  { name: "inbox", icon: MdOutlineMoveToInbox },
  { name: "outbox", icon: MdOutlineOutbox },
];

export const NotifContext = createContext(NOTIF_DEFAULT);

export default function NotifContextProvider({ children }) {
  const [notifs, notifsDispatch] = useReducer(notifReducer, NOTIF_DEFAULT);
  const [notifUnseen, setNotifUnseen] = useState({
    inbox: 0,
    outbox: 0,
    total: 0,
  });
  const { userState } = useContext(UserContext);
  const [activeBox, setActiveBox] = useState(NOTIFICATION_TABS[0]);

  // useEffect(() => console.log(notifs.content), [notifs.content]);
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
          "/notification/get_all_notifications?full=true",
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
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

  // determine how many notifs are not seen yet
  useEffect(() => {
    if (notifs.isLoaded) {
      let inboxUnseen = 0;
      let outboxUnseen = 0;
      const { inbox, outbox } = notifs.content;

      // determine how many notifications have not been seen
      const largestBoxLen =
        inbox.length >= outbox.length ? inbox.length : outbox.length;

      if (largestBoxLen === 0) {
        setNotifUnseen({ inbox: 0, outbox: 0, total: 0 });
      } else {
        for (let i = 0; i < largestBoxLen; i++) {
          // determine the notifUnseen for inbox
          if (inbox[i]) {
            !inbox[i].seen && inboxUnseen++;
          }

          // determine the notifUnseen for outbox
          if (outbox[i]) {
            !outbox[i].seen && outboxUnseen++;
          }
        }

        setNotifUnseen({
          inbox: inboxUnseen,
          outbox: outboxUnseen,
          total: inboxUnseen + outboxUnseen,
        });
      }
    }
  }, [notifs]);

  return (
    <NotifContext.Provider
      value={{
        NOTIFICATION_TABS,
        activeBox,
        setActiveBox,
        notifs,
        notifsDispatch,
        notifUnseen,
        setNotifUnseen,
      }}
    >
      {children}
    </NotifContext.Provider>
  );
}

export function receiveSendAddContact({
  cb,
  notifs,
  notifsDispatch,
  notifActions,
}) {
  socket.on("receive-send-add-contact", ({ success, notif, type }) => {
    if (success) {
      let updatedNotifs;
      // check if the notif is duplicate of a rejected one
      const indexExisitingReq = notifs.content[type].findIndex(
        ({ _id }) => _id === notif._id
      );

      if (indexExisitingReq === -1) {
        updatedNotifs = {
          ...notifs.content,
          [type]: [...notifs.content[type], notif],
        };
      } else {
        updatedNotifs = notifs.content;
        updatedNotifs[type][indexExisitingReq] = notif;
      }
      notifsDispatch({
        type: notifActions.updateLoaded,
        payload: updatedNotifs,
      });

      if (type === "inbox") {
        playAudio(newNotifAudio);
      }

      // execute the passed in callback if it exist
      if (cb) cb({ success, notif, type });
    }
  });
}

export function receiveCancelAddContact({
  cb,
  notifs,
  notifsDispatch,
  notifActions,
  userState,
}) {
  socket.on(
    "receive-cancel-add-contact",
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

        // execute the passed in callback if it exist
        if (cb) cb({ senderId, recipientId, success, type });
      }
    }
  );
}

export function receiveContactRequestResponse({
  cb,
  contacts,
  setContacts,
  notifs,
  notifsDispatch,
  notifActions,
  token,
  userState,
}) {
  socket.on(
    "receive-contact-request-response",
    async ({ recipientId, senderId, success, type, answer }) => {
      if (success) {
        const idToUse =
          recipientId !== userState.user._id ? recipientId : senderId;

        // add new user to contact when answer is true
        if (answer) {
          // fetch the user preview using the id that is different from the current userState id

          const userPreview = await api.get(
            `/query/user/get_users_preview?userIds=${idToUse}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          // update contacts if the recipient accepts the contact request
          setContacts([...contacts, { user: userPreview.data[0] }]);

          setTimeout(() => socket.emit("refresh-msg-log"), 500);
        }

        // execute the passed in callback if it exist
        if (cb) cb(answer, type);

        // update the notifs
        const updatedNotifs = notifs.content;
        for (let i = updatedNotifs[type].length - 1; i >= 0; i--) {
          if (updatedNotifs[type][i].type === "contact_request") {
            if (updatedNotifs[type][i].by._id !== idToUse) continue;

            updatedNotifs[type][i].answer = answer;
            break;
          }
        }
        notifsDispatch({
          type: notifActions.updateLoaded,
          payload: updatedNotifs,
        });
      }
    }
  );
}
