import {
  useState,
  useEffect,
  useCallback,
  useContext,
  useReducer,
} from 'react';
import { UserContext } from '../../../../context/user/userContext';
import groupedContactsReducer, {
  GROUPED_CONTACTS_DEFAULT,
  GROUPED_CONTACTS_ACTIONS,
} from '../../../../reducer/groupedContactsReducer/groupedContactsReducer';
import emptyContactList from '../../../../svg/searchList/contactList/InitialSvg.svg';
import api from '../../../../utils/apiAxios/apiAxios';
import RenderIf from '../../../../utils/React/RenderIf';

const ContactList = ({ setActiveChat, setIsSidebarOn }) => {
  const { userState } = useContext(UserContext);
  const [contacts, setContacts] = useState([
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

  const [groupedContacts, dispatch] = useReducer(
    groupedContactsReducer,
    GROUPED_CONTACTS_DEFAULT
  );

  // get the contact data from the current logged in user
  useEffect(() => {
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
          const ifThereAreNoMsg = {
            type: 'text',
            content: null,
            by: null,
          };
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

  // sort the contact
  useEffect(() => {
    if (contacts.length === 0) return;

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

    dispatch({ type: GROUPED_CONTACTS_ACTIONS.isLoaded, payload: result });
  }, [contacts]);

  const handleActiveContact = (target) => {
    const updatedChat = contacts.map((contact) => {
      if (contact !== target) {
        return { ...contact, activeChat: false }; //innactive chat
      } else {
        const { username, lastMessage } = contact;
        setActiveChat({ username, lastMessage }); //active chat
        return { ...contact, activeChat: true };
      }
    });

    setContacts(updatedChat);
    // close sidebar for smaller screen
    setIsSidebarOn(false);
  };

  return (
    <>
      {/* if the contacts are still loading */}
      <RenderIf
        conditionIs={groupedContacts.isLoading || groupedContacts.isStarting}
      >
        Loading
      </RenderIf>

      {/* if contact is empty */}
      <RenderIf
        conditionIs={
          groupedContacts.contents.length === 0 &&
          !groupedContacts.isLoading &&
          !groupedContacts.isStarting
        }
      >
        <div className="text-center space-y-10 mt-10">
          <img
            src={emptyContactList}
            alt=""
            className="max-w-[300px] mx-auto"
          />
          <span className="block font-semibold text-xl md:text-lg text-gray-500">
            Your contacts list is still empty
          </span>
          <span className="font-light text-gray-400 text-xs">
            Go find another user and add them to your contact !
          </span>
        </div>
      </RenderIf>

      {/* if contact is not empty */}
      <RenderIf
        conditionIs={
          groupedContacts.contents.length !== 0 &&
          !groupedContacts.isLoading &&
          !groupedContacts.isStarting
        }
      >
        {groupedContacts.contents.map(([letter, nameList], i) => {
          return (
            <div key={i} className="space-y-3 mb-3">
              <span className="block sticky top-0 bg-gray-200 px-2 font-bold uppercase text-gray-600">
                {letter}
              </span>
              {nameList.map((contact) => (
                <div
                  key={contact}
                  onClick={() => handleActiveContact(contact)}
                  className={`pl-3 cursor-pointer flex items-center gap-2 ${
                    contact.activeChat
                      ? 'bg-pink-100 font-semibold'
                      : 'hover:bg-pink-100'
                  } p-2 duration-200 rounded-md`}
                >
                  <img
                    src="https://picsum.photos/200/200"
                    alt=""
                    className="rounded-full h-8 w-8"
                  />

                  <span className="text-sm">{contact.username}</span>
                </div>
              ))}
            </div>
          );
        })}
      </RenderIf>
    </>
  );
};

export default ContactList;
