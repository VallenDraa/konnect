import { useContext, useState } from "react";
import { IoPersonAdd } from "react-icons/io5";
import { ActiveGroupChatContext } from "../../../../../context/activeGroupChat/ActiveGroupChatContext";
import { MessageLogsContext } from "../../../../../context/messageLogs/MessageLogsContext";
import MINI_MODAL_ACTIONS from "../../../../../context/miniModal/miniModalActions";
import { MiniModalContext } from "../../../../../context/miniModal/miniModalContext";
import api from "../../../../../utils/apiAxios/apiAxios";
import socket from "../../../../../utils/socketClient/socketClient";
import PasswordConfirmation from "../../../../MiniModal/content/AccountOpt/PasswordConfirmation";
import SearchBox from "../../../../template/SearchBox/SearchBox";

export default function AddNewParticipants() {
  const { miniModalState, miniModalDispatch } = useContext(MiniModalContext);
  const { activeGroupChat } = useContext(ActiveGroupChatContext);
  const { msgLogs } = useContext(MessageLogsContext);
  const [selected, setSelected] = useState([]);

  const handleAddNewMembers = () => {
    // GIVE ADMIN STATUS
    const payload = {
      invitedIds: selected,
      groupId: activeGroupChat,
      token: sessionStorage.getItem("token"),
    };

    if (!miniModalState.isActive && selected?.length > 0) {
      miniModalDispatch({
        type: MINI_MODAL_ACTIONS.show,
        payload: {
          content: (
            <PasswordConfirmation
              proceedText="Invite"
              cb={(userPw, payload) => {
                console.log(payload);
                socket.emit("invite-to-group", { ...payload, userPw });

                // close the mini modal and disable edit mode
                miniModalDispatch({ type: MINI_MODAL_ACTIONS.closing });
                miniModalDispatch({ type: MINI_MODAL_ACTIONS.closed });
              }}
              title={`Enter Password To Invite ${selected.length} New ${
                selected.length > 1 ? "Participants" : "Participant"
              }`}
              caption={`${selected.length} new ${
                selected.length > 1 ? "participants" : "participant"
              } will be able to receive or send new messages`}
              payload={payload}
            />
          ),
        },
      });
    }
  };

  return (
    <SearchBox
      submitCb={handleAddNewMembers}
      selectedCb={(newSelected) => {
        setSelected(newSelected.map((n) => n.user._id));
      }}
      submitBtn={
        <>
          <IoPersonAdd />
          Add Participants
        </>
      }
      searchCb={async (query) => {
        if (query !== "") {
          const { data } = await api.get(
            `/query/user/find_users?query=${query}`,
            {
              headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
              },
            }
          );

          const result = data
            .filter((u) =>
              msgLogs.content[activeGroupChat].admins.every((a) => a !== u._id)
            )
            .filter((u) =>
              msgLogs.content[activeGroupChat].members.every((m) => m !== u._id)
            );

          return result;
        }
      }}
      multipleSelect={true}
    />
  );
}
