import { useContext } from "react";
import { ActiveGroupChatContext } from "../../../../context/activeGroupChat/ActiveGroupChatContext";
import { ActivePrivateChatContext } from "../../../../context/activePrivateChat/ActivePrivateChatContext";
import PrivateLog from "./components/PrivateLog";
import GroupLog from "./components/GroupLog";
import RenderIf from "../../../../utils/React/RenderIf";

export default function Log({ messageLogRef }) {
  const { activePrivateChat } = useContext(ActivePrivateChatContext);
  const { activeGroupChat } = useContext(ActiveGroupChatContext);

  return (
    <main className="bg-gray-100 flex flex-col grow">
      <RenderIf conditionIs={activePrivateChat._id}>
        <PrivateLog messageLogRef={messageLogRef} />
      </RenderIf>
      <RenderIf conditionIs={activeGroupChat !== ""}>
        <GroupLog messageLogRef={messageLogRef} />
      </RenderIf>
    </main>
  );
}
