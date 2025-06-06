import { useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addNewMessage, updateMessageSeenStatus } from "../redux/messageSlice";

const useGetRealTimeMessage = () => {
  const { socket } = useSelector(store => store.socket);
  const dispatch = useDispatch();

  // 🧠 useCallback से stable reference
  const handleNewMessage = useCallback((newMessage) => {
    dispatch(addNewMessage(newMessage));
  }, [dispatch]);

  const handleSeenUpdate = useCallback(({ messageId }) => {
    dispatch(updateMessageSeenStatus({ messageId }));
  }, [dispatch]);

  useEffect(() => {
    if (!socket) return;

    // ❗ पहले remove करो, फिर add करो (double listener रोकने के लिए)
    socket.off("newMessage", handleNewMessage);
    socket.off("message-seen-update", handleSeenUpdate);

    socket.on("newMessage", handleNewMessage);
    socket.on("message-seen-update", handleSeenUpdate);

    // ✅ Clean up
    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("message-seen-update", handleSeenUpdate);
    };
  }, [socket, handleNewMessage, handleSeenUpdate]);
};

export default useGetRealTimeMessage;


