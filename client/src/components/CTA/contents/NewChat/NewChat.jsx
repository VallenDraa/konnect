import { IoChatbubbles } from "react-icons/io5";
import findUsersFromContact from "../../../../utils/apis/findUsersFromContact";
import SearchBox from "../../../template/SearchBox/SearchBox";
import { useNavigate } from "react-router-dom";

export default function NewChat() {
  const navigate = useNavigate();

  return (
    <SearchBox
      submitBtn={
        <>
          <IoChatbubbles />
          Start Chat
        </>
      }
      submitCb={(results, query, selected) => {
        console.log(selected);
        if (selected.length > 0) {
          navigate(`/chats?id=${selected[0].user._id}&type=private`);
        }
      }}
      searchCb={(query) =>
        findUsersFromContact(query, sessionStorage.getItem("token"))
      }
      multipleSelect={false}
    />
  );
}
