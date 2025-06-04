import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addNewMessage } from "../redux/messageSlice";

const useGetRealTimeMessage = () => {
  const { socket } = useSelector(store => store.socket);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      dispatch(addNewMessage(newMessage));
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, dispatch]);
};

export default useGetRealTimeMessage;
