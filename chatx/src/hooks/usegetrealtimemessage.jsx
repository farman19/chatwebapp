import { useEffect, useCallback, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addNewMessage, updateMessageSeenStatus } from "../redux/messageSlice";

const useGetRealTimeMessage = () => {
  const { socket } = useSelector((store) => store.socket);
  const { authUser } = useSelector((store) => store.user);
  const dispatch = useDispatch();

  const receiverAudioRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false); // ✅ State for mute

  useEffect(() => {
    receiverAudioRef.current = new Audio("https://chatxfrontend.onrender.com/ring/recive.mp3");
  }, []);

  const handleNewMessage = useCallback(
    (newMessage) => {
      if (!authUser?._id) return;

      // ✅ Play sound only if not muted and it's not from self
      if (!isMuted && newMessage.senderId !== authUser._id && receiverAudioRef.current) {
        const audio = receiverAudioRef.current;
        audio.currentTime = 0;
        audio
          .play()
          .then(() => console.log("🔊 Message sound played"))
          .catch((err) => console.warn("🔇 Audio blocked:", err.message));
      }

      dispatch(addNewMessage({ message: newMessage, authUserId: authUser._id }));
    },
    [dispatch, authUser, isMuted]
  );

  const handleSeenUpdate = useCallback(
    ({ messageId, userId }) => {
      if (!authUser?._id || !userId) return;
      dispatch(updateMessageSeenStatus({ userId, messageId }));
    },
    [dispatch, authUser]
  );

  useEffect(() => {
    if (!socket) return;

    socket.off("newMessage", handleNewMessage);
    socket.off("message-seen-update", handleSeenUpdate);

    socket.on("newMessage", handleNewMessage);
    socket.on("message-seen-update", handleSeenUpdate);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("message-seen-update", handleSeenUpdate);
    };
  }, [socket, handleNewMessage, handleSeenUpdate]);

  // ✅ Return mute state
  return { isMuted, setIsMuted };
};

export default useGetRealTimeMessage;
