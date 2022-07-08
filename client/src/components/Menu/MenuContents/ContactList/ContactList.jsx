import { useState, useEffect, useContext, useReducer } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../../../../context/user/userContext';
import { ActiveChatContext } from '../../../../context/activeChat/ActiveChatContext';
import groupedContactsReducer, {
  GROUPED_CONTACTS_DEFAULT,
  GROUPED_CONTACTS_ACTIONS,
} from '../../../../reducer/groupedContactsReducer/groupedContactsReducer';
import emptyContactList from '../../../../svg/searchList/contactList/InitialSvg.svg';
import api from '../../../../utils/apiAxios/apiAxios';
import RenderIf from '../../../../utils/React/RenderIf';
import { MessageLogsContext } from '../../../../context/messageLogs/MessageLogsContext';
import MESSAGE_LOGS_ACTIONS from '../../../../context/messageLogs/messageLogsActions';

const ContactList = ({ setIsSidebarOn }) => {
  const { activeChat, setActiveChat } = useContext(ActiveChatContext);
  const { msgLogs, msgLogsDispatch } = useContext(MessageLogsContext);
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
          const { chat } = contact;
          // assemble the parsed data into a contact object

          const parsedContact = {
            _id,
            username,
            initials,
            profilePicture,
            lastMessage: chat[0] || null,
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
    // initiate the update
    msgLogsDispatch({ type: MESSAGE_LOGS_ACTIONS.startUpdate });
    const updatedLogs = msgLogs;

    // deactive all chat
    for (const id in updatedLogs.content) {
      updatedLogs.content[id].activeChat = false;
    }

    updatedLogs.content[target._id].activeChat = true;

    msgLogsDispatch({
      type: MESSAGE_LOGS_ACTIONS.updateLoaded,
      payload: updatedLogs.content,
    });

    setActiveChat(target);
    // close sidebar for smaller screen
    setIsSidebarOn(false);
  };

  // useEffect(() => {
  //   console.log(groupedContacts);
  // }, [groupedContacts]);

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
                <Link
                  to={`/chats?id=${contact._id}&type=user`}
                  key={contact}
                  onClick={() => handleActiveContact(contact)}
                  className={`pl-3 cursor-pointer flex items-center gap-2 hover:bg-pink-100 p-2 duration-200 rounded-md`}
                >
                  <img
                    src="https://picsum.photos/200/200"
                    alt=""
                    className="rounded-full h-8 w-8"
                  />

                  <span className="text-sm">{contact.username}</span>
                </Link>
              ))}
            </div>
          );
        })}
      </RenderIf>
    </>
  );
};

export default ContactList;
