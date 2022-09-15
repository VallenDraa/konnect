import { useContext, useState } from "react";
import PP from "../../../PP/PP";
import ContactsSwiperCard from "../../../../utils/ContactsSwiperCard/ContactsSwiperCard";
import { useEffect } from "react";
import { BiHappyHeartEyes } from "react-icons/bi";
import { CachedUserContext } from "../../../../context/cachedUser/CachedUserContext";

export default function GroupProfileModalContent({ data }) {
  const { fetchCachedUsers } = useContext(CachedUserContext);
  const [adminsData, setAdminsData] = useState([]);
  const [membersData, setMembersData] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const admins = await fetchCachedUsers(data.admins);

        setAdminsData(admins.map((admin) => ({ user: { ...admin } })));
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const members = await fetchCachedUsers(data.members);
        setMembersData(members.map((member) => ({ user: { ...member } })));
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  return (
    <section
      aria-label="Group Profile"
      className="w-screen lg:w-[40rem] h-full flex flex-col"
    >
      <div className="grow shadow-md lg:shadow-inner">
        <div className="w-full min-h-full h-0 bg-white overflow-y-auto flex flex-col container max-w-screen-sm mx-auto">
          {/* profile pic */}
          <header className="bg-gradient-to-br from-blue-200 via-blue-400 to-pink-400 py-4">
            <PP
              src={data.profilePicture || null}
              alt={data.name}
              type="group"
              className="rounded-full h-44 mx-auto"
            />
          </header>
          {/* user data */}
          <footer className="py-3 space-y-8">
            <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 px-5">
              {/* username */}
              <div className="flex gap-x-2 items-center self-center">
                <span className="text-3xl font-semibold mt-2">{data.name}</span>
                {/* date joined */}
                <span className="text-xxs text-gray-400 font-medium">
                  EST. {new Date(data?.createdAt).toLocaleDateString()}
                </span>
              </div>
              {/* buttons */}
            </header>
            <main className="space-y-5">
              {/* user status */}
              <div className="px-5">
                <h3 className="flex items-center gap-x-1 mb-2 text-xs font-semibold text-gray-400 relative -left-[2px]">
                  <BiHappyHeartEyes className="text-sm" />
                  Group Description :
                </h3>
                <span className="text-base text-gray-600 font-semibold px-2">
                  {data?.description || "unset"}
                </span>
              </div>

              {/* Participants */}
              <div className="space-y-3 border-t-2 pt-3">
                <span className="text-lg font-medium text-gray-400 px-5">
                  Admins:
                </span>

                <ContactsSwiperCard contacts={adminsData} />
              </div>
              <div className="space-y-3 border-t-2 pt-3">
                <span className="text-lg font-medium text-gray-400 px-5">
                  Members:
                </span>

                <ContactsSwiperCard contacts={membersData} />
              </div>
            </main>
          </footer>
        </div>
      </div>
    </section>
  );
}
