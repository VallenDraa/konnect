import { useContext } from "react";
import { useState } from "react";
import { IoPeopleSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { ActiveChatHandlerContext } from "../../../../context/activeChatHandler/ActiveChatHandler";
import MESSAGE_LOGS_ACTIONS from "../../../../context/messageLogs/messageLogsActions";
import { MessageLogsContext } from "../../../../context/messageLogs/MessageLogsContext";
import MINI_MODAL_ACTIONS from "../../../../context/miniModal/miniModalActions";
import { MiniModalContext } from "../../../../context/miniModal/miniModalContext";
import { UserContext } from "../../../../context/user/userContext";
import findUsersFromContact from "../../../../utils/apis/findUsersFromContact";
import socket from "../../../../utils/socketClient/socketClient";
import NewGroupConfirmation from "../../../MiniModal/content/NewGroup/NewGroupConfirmation";
import SearchBox from "../../../template/SearchBox/SearchBox";

export default function NewGroup() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState([]);
  const { msgLogsDispatch } = useContext(MessageLogsContext);
  const { userState } = useContext(UserContext);
  const { miniModalState, miniModalDispatch } = useContext(MiniModalContext);

  const handleMakeGroup = (results, query, selected) => {
    if (selected.length === 0) return;

    if (!miniModalState.isActive) {
      miniModalDispatch({
        type: MINI_MODAL_ACTIONS.show,
        payload: {
          content: (
            <NewGroupConfirmation
              selected={selected}
              cb={(name) => {
                socket.emit(
                  "make-new-group",
                  name,
                  {
                    admins: [userState.user._id],
                    members: selected.map((s) => s.user._id),
                  },
                  sessionStorage.getItem("token")
                );
                msgLogsDispatch({ type: MESSAGE_LOGS_ACTIONS.startUpdate });
              }}
            />
          ),
        },
      });
    }
  };

  return (
    <SearchBox
      submitBtn={
        <>
          <IoPeopleSharp />
          Start Group
        </>
      }
      submitCb={handleMakeGroup}
      searchCb={(query) =>
        findUsersFromContact(query, sessionStorage.getItem("token"))
      }
      queryState={{ query, setQuery }}
      selectedState={{ selected, setSelected }}
      multipleSelect={true}
    />
  );
}
