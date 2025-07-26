import { useEffect, useCallback, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addNewMessage, updateMessageSeenStatus,  markManySeen  } from "../redux/messageSlice";
import { setChatUsers } from "../redux/userSlice";
import { store } from "../redux/store";


const useGetRealTimeMessage = () => {
  const { socket } = useSelector((store) => store.socket);
  const { authUser } = useSelector((store) => store.user);
  const dispatch = useDispatch();

   const receiverAudioRef = useRef(null);
  const isMutedRef = useRef(false);
  const [isMuted, setIsMuted] = useState(false);

  // Keep ref in sync with state
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    receiverAudioRef.current = new Audio("/ring/recive.wav");
  }, []);

  useEffect(() => {
  const unlockAudio = () => {
    if (receiverAudioRef.current) {
      receiverAudioRef.current
        .play()
        .then(() => {
          receiverAudioRef.current.pause();
          receiverAudioRef.current.currentTime = 0;
          // console.log("🔓 Audio unlocked");
          document.removeEventListener("click", unlockAudio);
        })
        .catch((err) => {
          console.warn("🔐 Audio unlock failed:", err.message);
        });
    }
  };

  document.addEventListener("click", unlockAudio);
  return () => {
    document.removeEventListener("click", unlockAudio);
  };
}, []);

  const handleNewMessage = useCallback(
    (newMessage) => {
      if (!authUser?._id) return;
      
    // console.log("📩 नया मैसेज मिला:", newMessage);
    // console.log("🔇 क्या म्यूट है? :", isMutedRef.current);

      // ✅ Play sound only if not muted and it's not from self
      if (!isMutedRef.current && newMessage.senderId !== authUser._id && receiverAudioRef.current)
 {
        const audio = receiverAudioRef.current;
        audio.currentTime = 0;
        audio
          .play()
          .then(() => console.log("🔊 Message sound played"))
          .catch((err) => console.warn("🔇 Audio blocked:", err.message));
      }

      dispatch(addNewMessage({ message: newMessage, authUserId: authUser._id }));
      dispatch(setChatUsers(Object.keys(store.getState().message.messagesByUser)));
    },
    [dispatch, authUser, isMuted]
  );

  const onSeenUpd = useCallback((data) => {
  console.log("🟢 message-seen-update:", data);

  const { messageIds = [], messageId, senderId, receiverId, seenTime } = data;
  const otherId = senderId === authUser._id ? receiverId : senderId;

  // ✅ Step 1: Mark all seen
  dispatch(markManySeen({ userId: String(otherId), ids: messageIds }));

  // ✅ Step 2: Add seenTime to each message
  if (messageIds.length) {
    messageIds.forEach(id => {
      dispatch(updateMessageSeenStatus({ userId: otherId, messageId: id, seenTime }));
    });
  }
}, [authUser, dispatch]);


 const handleSeenUpdate = useCallback(
  ({ messageIds, messageId, userId, seenTime }) => {
    if (!authUser?._id || !userId) return;

      console.log("📥 [handleSeenUpdate] Data received:", {
      messageIds,
      messageId,
      userId,
      seenTime,
    });

    if (Array.isArray(messageIds)) {
      console.log("📥 Seen Update Triggered:", messageIds || messageId);

      messageIds.forEach((id) => {
        dispatch(updateMessageSeenStatus({ userId, messageId: id, seenTime }));
      });
    } else if (messageId) {
      console.log("🔁 Updating Seen for:", messageId);
      dispatch(updateMessageSeenStatus({ userId, messageId, seenTime }));
    }
  },
  [dispatch, authUser]
);

useEffect(() => {
  if (!socket || !socket.connected || !authUser) return;

  // console.log("🧲 Socket connected:", socket.id);

  const onNewMsg = handleNewMessage;

  // 🔄 यहां ऊपर वाला onSeenUpd यूज़ करें जिसमें seenTime है
  socket.off("newMessage", onNewMsg).on("newMessage", onNewMsg);
  socket.off("message-seen-update", onSeenUpd).on("message-seen-update", onSeenUpd);

  return () => {
    socket.off("newMessage", onNewMsg);
    socket.off("message-seen-update", onSeenUpd);
  };
}, [socket?.id, authUser?._id, handleNewMessage]); // 🔕 isMuted हटाया

 return { isMuted, setIsMuted, isMutedRef };
}

 

export default useGetRealTimeMessage;
