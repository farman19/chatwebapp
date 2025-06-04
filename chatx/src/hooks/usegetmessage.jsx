import { useEffect } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { setMessages } from "../redux/messageSlice";

const useGetMessages = () => {
  const dispatch = useDispatch();
  const authUser = useSelector((store) => store.user.authUser);
  const selectedUser = useSelector((store) => store.user.selectedUser);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!authUser?._id || !selectedUser?._id) {
        dispatch(setMessages([])); // Clear if no chat selected
        return;
      }

      try {
        axios.defaults.withCredentials = true;
       const res = await axios.get(
  `https://chatx-xilj.onrender.com/api/v1/message/${authUser._id}/${selectedUser._id}`
);
   
console.log("========", res.data)

        // Make sure res.data.messages exists
  dispatch(setMessages(Array.isArray(res.data.messages) ? res.data.messages : []));


      } catch (error) {
        console.log("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [selectedUser?._id, authUser?._id, dispatch]);
};

export default useGetMessages;
