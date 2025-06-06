import { useDispatch, useSelector } from "react-redux";
import { setMessages, clearMessagesForUser } from "../redux/messageSlice";
import axios from "axios";

const useGetMessages = () => {
  const dispatch = useDispatch();
  const authUser = useSelector((store) => store.user.authUser);
  const selectedUser = useSelector((store) => store.user.selectedUser);
  const socket = useSelector((store) => store.socket.socket);

  const fetchMessages = async () => {
    if (!socket || !authUser || !selectedUser) return;

    try {
      axios.defaults.withCredentials = true;

      const res = await axios.get(
        `https://chatx-xilj.onrender.com/api/v1/message/${authUser._id}/${selectedUser._id}`
      );

      const fetchedMessages = Array.isArray(res.data.messages)
        ? res.data.messages
        : [];

      console.log("***********=====>", res.data.messages); // ✅ FIXED: removed typo `fetchMessages.res`

      dispatch(setMessages(fetchedMessages));

      // ✅ Check for unseen message to emit 'message-seen'
      const unseenMsg = [...fetchedMessages].reverse().find(
        (msg) =>
          msg.senderId === selectedUser._id &&
          msg.receiverId === authUser._id &&
          !msg.isSeen
      );

      if (unseenMsg) {
        socket.emit("message-seen", {
          messageId: unseenMsg._id,
          senderId: selectedUser._id,
          receiverId: authUser._id,
        });
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      dispatch(clearMessagesForUser(selectedUser._id));
    }
  };

  return fetchMessages;
};

export default useGetMessages;
