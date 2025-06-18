import { useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addNewMessage, updateMessageSeenStatus } from "../redux/messageSlice";

const useGetRealTimeMessage = () => {
  const { socket } = useSelector(store => store.socket);
  const { authUser } = useSelector(store => store.user); // ✅ FIXED: Added this line
  const dispatch = useDispatch();
  const receiverAudio = new Audio("/public/ring/recive.mp3")

  const handleNewMessage = useCallback((newMessage) => {
    if (!authUser?._id) return;
     if (newMessage.senderId !== authUser._id) {
      receiverAudio.currentTime = 0;
      receiverAudio.play();
    }
    dispatch(addNewMessage({ message: newMessage, authUserId: authUser._id }));
  }, [dispatch, authUser]);

  const handleSeenUpdate = useCallback(({ messageId, userId }) => {
    if (!authUser?._id || !userId) return;
    dispatch(updateMessageSeenStatus({ userId, messageId }));
  }, [dispatch, authUser]);

  useEffect(() => {
    if (!socket) return;

    // Clear existing listeners to prevent duplicates
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
