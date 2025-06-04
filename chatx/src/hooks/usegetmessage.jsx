import { useEffect } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { setMessages, clearMessages } from "../redux/messageSlice";

const useGetMessages = () => {
  const dispatch = useDispatch();
  const authUser = useSelector((store) => store.user.authUser);
  const selectedUser = useSelector((store) => store.user.selectedUser);

  useEffect(() => {
    if (!authUser?._id || !selectedUser?._id) {
     dispatch(setMessages([]));
     
      return;
    }

   
    const fetchMessages = async () => {
      try {
        axios.defaults.withCredentials = true;
        const res = await axios.get(
          `https://chatx-xilj.onrender.com/api/v1/message/${authUser._id}/${selectedUser._id}`
        );
        // अगर messages array है, तो set करें, नहीं तो खाली array भेजें
        dispatch(setMessages(Array.isArray(res.data.messages) ? res.data.messages : []));
      } catch (error) {
        console.log("Error fetching messages:", error);
        // error पर भी messages साफ़ करें
        dispatch(clearMessages());
      }
    };

    fetchMessages();
  }, [selectedUser?._id, authUser?._id, dispatch]);
};

export default useGetMessages;
