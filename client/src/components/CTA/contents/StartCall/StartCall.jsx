import { useContext, useState } from "react";
import { IoCall } from "react-icons/io5";
import MINI_MODAL_ACTIONS from "../../../../context/miniModal/miniModalActions";
import { MiniModalContext } from "../../../../context/miniModal/miniModalContext";
import MODAL_ACTIONS from "../../../../context/modal/modalActions";
import { ModalContext } from "../../../../context/modal/modalContext";
import NormalConfirmation from "../../../MiniModal/content/NormalConfirmation";
import SearchBox from "../../../template/SearchBox/SearchBox";

// WIP
export default function StartCall() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState([]);
  const { miniModalState, miniModalDispatch } = useContext(MiniModalContext);
  const { modalState, modalDispatch } = useContext(ModalContext);

  return (
    <SearchBox
      title="Search For Users In Contact"
      submitBtn={
        <>
          <IoCall />
          Start Call
        </>
      }
      submitCb={() => {
        if (!miniModalState.isActive) {
          miniModalDispatch({
            type: MINI_MODAL_ACTIONS.show,
            payload: {
              content: (
                <NormalConfirmation
                  cb={() => {
                    miniModalDispatch({ type: MINI_MODAL_ACTIONS.closing });
                    miniModalDispatch({ type: MINI_MODAL_ACTIONS.closed });
                    modalDispatch({ type: MODAL_ACTIONS.close });
                  }}
                  title={`The Call Feature Is Currently WIP`}
                  caption={`Press Yes to close The Call Menu`}
                />
              ),
            },
          });
        }
      }}
      queryState={{ query, setQuery }}
      selectedState={{ selected, setSelected }}
      multipleSelect={false}
    />
  );
}
