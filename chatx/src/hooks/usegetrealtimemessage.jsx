import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addNewMessage, updateMessageSeenStatus } from "../redux/messageSlice";

const useGetRealTimeMessage = () => {
  const { socket } = useSelector(store => store.socket);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!socket) return;

    // ✅ New Message Listener
    const handleNewMessage = (newMessage) => {
      dispatch(addNewMessage(newMessage));
    };

    // ✅ Message Seen Listener
    const handleSeenUpdate = ({ messageId }) => {
      dispatch(updateMessageSeenStatus({ messageId }));
    };

    // ✅ Add Listeners
    socket.on("newMessage", handleNewMessage);
    socket.on("message-seen-update", handleSeenUpdate);

    // ✅ Clean up listeners on unmount
    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("message-seen-update", handleSeenUpdate);
    };
  }, [socket, dispatch]);
};

export default useGetRealTimeMessage;

