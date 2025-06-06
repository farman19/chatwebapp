import { useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addNewMessage, updateMessageSeenStatus } from "../redux/messageSlice";

const useGetRealTimeMessage = () => {
  const { socket } = useSelector(store => store.socket);
  const dispatch = useDispatch();

  const handleNewMessage = useCallback((newMessage) => {
    dispatch(addNewMessage(newMessage));
  }, [dispatch]);

  const handleSeenUpdate = useCallback(({ messageId }) => {
    console.log("👁️ Seen update received:", messageId); // Debug log
    dispatch(updateMessageSeenStatus({ messageId }));
  }, [dispatch]);

  useEffect(() => {
    if (!socket) return;

    // Prevent duplicate listeners
    socket.off("newMessage", handleNewMessage);
    socket.off("message-seen-update", handleSeenUpdate);

    socket.on("newMessage", handleNewMessage);
    socket.on("message-seen-update", handleSeenUpdate);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("message-seen-update", handleSeenUpdate);
    };
  }, [socket, handleNewMessage, handleSeenUpdate]);
};

export default useGetRealTimeMessage;
