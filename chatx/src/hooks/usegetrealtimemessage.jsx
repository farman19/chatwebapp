import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setMessages } from "../redux/messageSlice";

const useGetRealTimeMessage = () => {
    const { socket } = useSelector(store => store.socket);
    const messages = useSelector((store) => store.message.messages) ?? [];

    const dispatch = useDispatch();

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
        dispatch(setMessages((prevMessages) => [...prevMessages, newMessage]));
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
        socket.off("newMessage", handleNewMessage);
    };
}, [socket, dispatch,messages]);
};

export default useGetRealTimeMessage;
