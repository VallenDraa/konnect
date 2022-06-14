import { useState, useEffect, useCallback } from 'react';
export const ContactList = ({ setActiveChat, setIsSidebarOn }) => {
  const [contacts, setContacts] = useState([
    {
      username: 'john',
      id: '1',
      lastMessage: {
        type: 'text',
        content: 'Lorem ipsum dolor sit',
        by: 'me',
      },
      activeChat: false,
    },
    {
      username: 'steve',
      id: '2',
      lastMessage: {
        type: 'call',
        content: 'Call Lasted For 4:20:00',
        by: 'steve',
      },
      activeChat: false,
    },
    {
      username: 'jake',
      id: '3',
      lastMessage: {
        type: 'image',
        content: 'Image',
        by: 'me',
      },
      activeChat: false,
    },
    {
      username: 'david',
      id: '4',
      lastMessage: {
        type: 'video',
        content: 'Video',
        by: 'david',
      },
      activeChat: false,
    },
  ]);
  const [groupedContacts, setGroupedContacts] = useState([]);
  const getGroupedContacts = useCallback(() => {
    const temp = {};
    const sortedContacts = contacts.sort((a, b) =>
      a.username < b.username ? -1 : 1
    );

    sortedContacts.forEach((contact) => {
      const alphabet = contact.username.substring(0, 1);

      // setting the object keys
      if (!temp[alphabet]) temp[alphabet] = [];

      // pushing the contact name to the respective first letter alphabet object
      temp[alphabet].push(contact);
    });

    // return as an array of key value pairs array
    const result = Object.entries(temp);

    /**
     * return as an array of objects
      const result = tempEntries.map(([letter, nameList]) => ({
        [letter]: nameList,
      }));
    */

    setGroupedContacts(result);
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

  useEffect(getGroupedContacts, [getGroupedContacts]);

  return (
    <>
      {groupedContacts.map(([letter, nameList], i) => {
        return (
          <div key={i} className="space-y-3 mb-3">
            <span className="block sticky top-0 bg-gray-200 px-2 font-bold uppercase text-gray-600">
              {letter}
            </span>
            {nameList.map((contact) => (
              <div
                key={contact.id}
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
    </>
  );
};
