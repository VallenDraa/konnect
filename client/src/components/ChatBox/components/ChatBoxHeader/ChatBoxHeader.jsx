import { useContext } from "react";
import { ActiveGroupChatContext } from "../../../../context/activeGroupChat/ActiveGroupChatContext";
import { ActivePrivateChatContext } from "../../../../context/activePrivateChat/ActivePrivateChatContext";
import RenderIf from "../../../../utils/React/RenderIf";
import GroupChatHeader from "./components/GroupChatHeader";
import PrivateChatHeader from "./components/PrivateChatHeader";

export default function ChatBoxHeader({ invisibleWallRef }) {
  const { activePrivateChat } = useContext(ActivePrivateChatContext);
  const { activeGroupChat } = useContext(ActiveGroupChatContext);

  return (
    <>
      <RenderIf conditionIs={activePrivateChat._id}>
        <PrivateChatHeader invisibleWallRef={invisibleWallRef} />
      </RenderIf>
      <RenderIf conditionIs={activeGroupChat !== ""}>
        <GroupChatHeader invisibleWallRef={invisibleWallRef} />
      </RenderIf>
    </>
  );
}
