import { useContext } from "react";
import { Link } from "react-router-dom";
import RenderIf from "../../../../utils/React/RenderIf";
import { ContactsContext } from "../../../../context/contactContext/ContactContext";
import { SettingsContext } from "../../../../context/settingsContext/SettingsContext";

const ContactList = () => {
  const { groupedContacts } = useContext(ContactsContext);
  const { settings } = useContext(SettingsContext);
  const { general } = settings;
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
          groupedContacts.contents?.length === 0 &&
          !groupedContacts.isLoading &&
          !groupedContacts.isStarting
        }
      >
        <div className="text-center space-y-10 mt-10 p-3">
          <span className="block font-semibold text-xl lg:text-lg text-gray-500">
            Contact List Is Empty
          </span>
          <span className="text-gray-400 text-xs">
            Find others and add them to your contact !
          </span>
        </div>
      </RenderIf>

      {/* if contact is not empty */}
      <RenderIf
        conditionIs={
          groupedContacts.contents?.length !== 0 &&
          !groupedContacts.isLoading &&
          !groupedContacts.isStarting
        }
      >
        {groupedContacts.contents?.map(([letter, nameList], i) => {
          return (
            <div key={i} className="space-y-3 mb-3 p-3">
              <span className="block sticky top-0 bg-gray-100 px-2 font-bold uppercase text-blue-400">
                {letter}
              </span>
              {nameList.map((contact) => (
                <Link
                  to={`/user/${contact.user.username}`}
                  key={contact}
                  className={`group cursor-pointer flex items-center gap-2 hover:bg-pink-100 bg-gray-200 p-2 mx-2 rounded shadow
                            ${general?.animation ? "duration-200" : ""}`}
                >
                  <img
                    src="https://picsum.photos/200/200"
                    alt=""
                    className="rounded-full h-8 w-8"
                  />

                  <span className="group-hover:text-pink-700">
                    {contact.user.username}
                  </span>
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
