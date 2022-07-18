import {
  createContext,
  useState,
  useEffect,
  useContext,
  useReducer,
  useCallback,
} from 'react';
import groupedContactsReducer, {
  GROUPED_CONTACTS_ACTIONS,
  GROUPED_CONTACTS_DEFAULT,
} from '../../reducer/groupedContactsReducer/groupedContactsReducer';
import api from '../../utils/apiAxios/apiAxios';
import getUsersContactsPreview from '../../utils/apis/getUserContactsPreview';
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
  const [groupedContacts, gcDispatch] = useReducer(
    groupedContactsReducer,
    GROUPED_CONTACTS_DEFAULT
  );

  // get all the contact data from the current logged in user initial load
  useEffect(() => {
    const getAllContacts = async () => {
      try {
        const result = [];
        const data = await getUsersContactsPreview(
          sessionStorage.getItem('token')
        );

        if (data.contacts.length > 0) {
          for (const contact of data.contacts) {
            const { username, initials, profilePicture, _id } = contact.user;
            // assemble the parsed data into a contact object

            const parsedContact = {
              _id,
              username,
              initials,
              profilePicture,
            };
            result.push(parsedContact);
          }
          setContacts(result);
        } else {
          setContacts([]);
        }
      } catch (error) {
        console.error(error);
      }
    };
    getAllContacts();
  }, []);

  //  group the contacts
  useEffect(() => {
    if (groupedContacts.length > 0) {
      gcDispatch({ type: GROUPED_CONTACTS_ACTIONS.isStartingUpdate });
    } else {
      gcDispatch({ type: GROUPED_CONTACTS_ACTIONS.isStarting });
    }

    const groupContact = () => {
      if (contacts.length !== 0) return [];

      const temp = {};
      const sortedContacts = contacts.sort((a, b) =>
        a.username < b.username ? -1 : 1
      );

      for (const contact of sortedContacts) {
        const alphabet = contact.username.substring(0, 1);

        // setting the object keys
        if (!temp[alphabet]) temp[alphabet] = [];

        // pushing the contact name to the respective first letter alphabet object
        temp[alphabet].push(contact);
      }

      // return as an array of key value pairs array
      const result = Object.entries(temp);

      return result;
    };

    gcDispatch({ type: GROUPED_CONTACTS_ACTIONS.isLoading });

    gcDispatch({
      type: GROUPED_CONTACTS_ACTIONS.isLoaded,
      payload: groupContact(),
    });
  }, [contacts]);

  useEffect(() => {
    console.log(groupedContacts);
  }, [groupedContacts]);

  return (
    <ContactsContext.Provider
      value={{
        contactState: { contacts, setContacts },
        gcReducer: { groupedContacts, gcDispatch },
      }}
    >
      {children}
    </ContactsContext.Provider>
  );
}
