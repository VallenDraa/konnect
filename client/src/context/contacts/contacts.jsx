import {
  createContext,
  useState,
  useEffect,
  useContext,
  useReducer,
} from 'react';
import groupedContactsReducer, {
  GROUPED_CONTACTS_ACTIONS,
  GROUPED_CONTACTS_DEFAULT,
} from '../../reducer/groupedContactsReducer/groupedContactsReducer';
import api from '../../utils/apiAxios/apiAxios';
import { UserContext } from '../user/userContext';

export const ContactsContext = createContext([
  // {
  //   username: 'john',
  //   id: '1',
  //   lastMessage: {
  //     type: 'text',
  //     content: 'Lorem ipsum dolor sit',
  //     by: 'me',
  //   },
  //   activeChat: false,
  // },
]);

export default function ContactsContextProvider({ children }) {
  const [contacts, setContacts] = useState([]);
  const { userState } = useContext(UserContext);
  const [groupedContacts, dispatch] = useReducer(
    groupedContactsReducer,
    GROUPED_CONTACTS_DEFAULT
  );

  // get the contact data from the current logged in user
  useEffect(() => {
    if (!userState.user) return;
    console.log(userState.user.contacts);
    if (userState.user.contacts.length === 0) {
      return dispatch({ type: GROUPED_CONTACTS_ACTIONS.isLoaded, payload: [] });
    }

    dispatch({ type: GROUPED_CONTACTS_ACTIONS.isStarting });

    const getContacts = async () => {
      dispatch({ type: GROUPED_CONTACTS_ACTIONS.isLoading });
      const result = [];

      try {
        // fetch the contacts data
        const { data } = await api.post(
          '/query/contact/get_user_contacts_preview',
          { userId: userState.user._id }
        );

        // parse the incoming contacts data
        for (const contact of data.contacts) {
          const { username, initials, profilePicture, _id } = contact.user;
          const { messageLog } = contact;

          // assemble the parsed data into a contact object
          const ifThereAreNoMsg = { type: 'text', content: null, by: null };
          const parsedContact = {
            _id,
            username,
            initials,
            profilePicture,
            lastMessage: messageLog[0] || ifThereAreNoMsg,
            activeChat: false,
          };
          result.push(parsedContact);
        }

        // update the contacts state
        setContacts(result);
      } catch (error) {
        dispatch({ type: GROUPED_CONTACTS_ACTIONS.isError, payload: error });
        console.log(error);
      }
    };

    getContacts();
  }, [userState]);

  return (
    <ContactsContext.Provider value={{ contacts, setContacts }}>
      {children}
    </ContactsContext.Provider>
  );
}
