import { useEffect } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { setMessages, clearMessagesForUser } from "../redux/messageSlice";

const useGetMessages = () => {
  const dispatch = useDispatch();
  const authUser = useSelector((store) => store.user.authUser);
  const selectedUser = useSelector((store) => store.user.selectedUser);

  useEffect(() => {
    if (!authUser?._id || !selectedUser?._id) return;

    const fetchMessages = async () => {
      try {
        axios.defaults.withCredentials = true;
        const res = await axios.get(
          `https://chatx-xilj.onrender.com/api/v1/message/${authUser._id}/${selectedUser._id}`
        );

        const fetchedMessages = Array.isArray(res.data.messages)
          ? res.data.messages
          : [];

        dispatch(setMessages(fetchedMessages));
      } catch (error) {
        console.error("Error fetching messages:", error);
        dispatch(clearMessagesForUser(selectedUser._id)); // सही तरीके से payload भेजें
      }
    };

    fetchMessages();
  }, [authUser?._id, selectedUser?._id, dispatch]); // जरूरी dependencies
};

export default useGetMessages;
