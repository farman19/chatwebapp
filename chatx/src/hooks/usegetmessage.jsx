import { useDispatch, useSelector } from "react-redux";
import { addMultipleMessages, updateMessageSeenStatus } from "../redux/messageSlice";
import { setChatUsers } from "../redux/userSlice";
import { store } from "../redux/store";
import axios from "axios";

const useGetMessages = () => {
  const dispatch = useDispatch();
  const authUser = useSelector((store) => store.user.authUser);
  const selectedUser = useSelector((store) => store.user.selectedUser);
  const socket = useSelector((store) => store.socket.socket);
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const fetchMessages = async () => {
    if (!socket || !authUser || !selectedUser) return;

    try {
      axios.defaults.withCredentials = true;

      const res = await axios.get(
        `${BASE_URL}/api/v1/message/${authUser._id}/${selectedUser._id}`
      );

      const fetchedMessages = Array.isArray(res.data)
        ? res.data
        : [];

      // ✅ Add messages to Redux
      dispatch(addMultipleMessages({ userId: selectedUser._id, messages: fetchedMessages }));
      dispatch(setChatUsers(Object.keys(store.getState().message.messagesByUser)));

      // ✅ Handle unseen messages
      const unseenMessages = fetchedMessages.filter(
        (msg) =>
          msg.senderId === selectedUser._id &&
          msg.receiverId === authUser._id &&
          !msg.isSeen
      );

      if (unseenMessages.length > 0) {
        const messageIds = unseenMessages.map((msg) => msg._id);

        // ✅ Emit message-seen socket event
        socket.emit("message-seen", {
          messageIds,
          senderId: selectedUser._id,
          receiverId: authUser._id,
        });

        // ✅ Also update in Redux immediately
        messageIds.forEach((id) => {
          dispatch(updateMessageSeenStatus({ userId: selectedUser._id, messageId: id }));
        });
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  return fetchMessages;
};

export default useGetMessages;
