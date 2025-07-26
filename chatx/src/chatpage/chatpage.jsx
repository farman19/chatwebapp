import React, { useState, useMemo, useRef, useEffect } from 'react';
import './chatpage.css'

import { IoMdSearch } from "react-icons/io";
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { Avatar,  IconButton } from "@mui/material";

import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { setSelectedUser, setChatUsers } from '../redux/userSlice';
import { useDispatch } from 'react-redux';
import useGetMessages from '../hooks/usegetmessage';
import { MdGroups } from "react-icons/md";
import { IoMenu } from "react-icons/io5";
import { setFriendsOnline } from '../redux/friendSlice';


import { store } from "../redux/store";

import { BsThreeDotsVertical } from "react-icons/bs";
import NewUserList from '../pages/newuserlist/newuserlist';
import { MdLogout } from "react-icons/md";




import { FaArrowLeft } from "react-icons/fa6";
import { persistor } from "../redux/store";
import { setAuthUser } from '../redux/userSlice';
import { clearMessagesForUser } from '../redux/messageSlice';
// import { Picker } from 'emoji-mart';
import { setSocket } from "../redux/socketSlice";
import ListItemIcon from '@mui/material/ListItemIcon';

import { BsCheck2All, BsCheck2 } from "react-icons/bs";
import { Menu, MenuItem } from "@mui/material";
import dayjs from 'dayjs';




import { IoVolumeMute } from "react-icons/io5";
import { GoUnmute } from "react-icons/go";
import { PiUserListBold } from "react-icons/pi";
import { IoPersonAddSharp } from "react-icons/io5";
import { BsChatSquareTextFill } from "react-icons/bs";
import { addMultipleMessages, markManySeen, addNewMessage } from '../redux/messageSlice';
import { IoMdSend } from "react-icons/io";
import { IoCloseSharp } from "react-icons/io5";

import { formatChatDate } from '../components/utils/datehelper';


import useGetRealTimeMessage from '../hooks/usegetrealtimemessage';
import YourFriends from '../pages/friendspage/friends';
import Groups from '../pages/groups/groups';

// adjust path as needed
const BASE_URL = process.env.REACT_APP_API_BASE_URL
// console.log(BASE_URL)

const Chatpage = () => {


    const dispatch = useDispatch();
    const navigate = useNavigate();



    const messageEndRef = useRef(null);
    const { isMuted, setIsMuted, isMutedRef } = useGetRealTimeMessage();

    const sendAudio = new Audio("/ring/sendmsg.mp3");



    // Redux state

    const { selectedUser } = useSelector(store => store.user);
    const authUser = useSelector((state) => state.user.authUser);

    const { friends, friendsOnline } = useSelector((state) => state.friend);
    const { socket } = useSelector(store => store.socket);
    const messagesByUser = useSelector((state) => state.message.messagesByUser);


    // const [lastValidUserId, setLastValidUserId] = useState(null);
    const chatUsers = friends?.filter((user) => user._id !== authUser?._id);
    const isOnline = selectedUser?._id && friendsOnline?.includes(selectedUser?._id);



    // console.log("authuserid", authUser?._id)


    // socket check 




    // useEffect(() => {
    //     if (selectedUser && messagesByUser?.[selectedUser?._id]) {
    //         setLastValidUserId(selectedUser?._id);
    //     }
    // }, [selectedUser, messagesByUser]);

    const messages = useMemo(() => (
        selectedUser ? messagesByUser[selectedUser._id] || [] : []
    ), [messagesByUser, selectedUser]);




    // emoji
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    // Emoji select handler
    const handleEmojiSelect = (emoji) => {
        setAllMessage(prev => ({
            ...prev,
            message: prev.message + emoji.native
        }));
    };






    // Component state
    const [searchTerm, setSearchTerm] = useState('');
    const [allmessage, setAllMessage] = useState({
        message: '',
        files: [],
    });

    // Custom hooks

    const fetchMessages = useGetMessages();
    useEffect(() => {
        if (!selectedUser || !selectedUser._id) return;
        fetchMessages();
    }, [selectedUser?._id, fetchMessages]);

    // Clean up blob URLs on unmount
    useEffect(() => {
        return () => {
            if (Array.isArray(allmessage.files)) {
                allmessage.files.forEach((file) => {
                    if (file?.previewURL) {
                        URL.revokeObjectURL(file.previewURL);
                    }
                });
            }
        };
    }, [allmessage.files]);

    // No additional filtering needed anymore
    const filteredMessages = useMemo(() => {
        if (!Array.isArray(messages)) return [];
        return messages;
    }, [messages]);

    // Auto scroll
    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [filteredMessages]);

    // User selection

    // 2️⃣  ────────────────────────────────────────────────────────────────
    // selectuserhandle: chat खुलने पर पुराना डेटा fetch + unseen emit
    // ────────────────────────────────────────────────────────────────────
    const selectuserhandle = async (user) => {
        if (!authUser?._id) {
            console.warn("🚫 selectuserhandle called but authUser._id missing");
            return;
        }

        console.log("➡️ Selecting user:", { userId: user._id, authUserId: authUser._id });

        try {
            /* Loader ON */
            console.log("🌐 Fetching messages API:",
                `${BASE_URL}/api/v1/message/${authUser._id}/${user._id}`
            );

            const { data } = await axios.get(
                `${BASE_URL}/api/v1/message/${authUser._id}/${user._id}`,
                { withCredentials: true }
            );

            const messages = data.messages || [];
            console.log(`📦 Received ${messages.length} messages from server`);

            // 1️⃣  कौन‑सा user खोला?
            dispatch(addMultipleMessages({ userId: String(user._id), messages }));

            // ✅ Step 2: Select user after messages exist in Redux
            dispatch(setSelectedUser(user));

            // ✅ Step 3: Update chat user list
            dispatch(setChatUsers(Object.keys(store.getState().message.messagesByUser)));



            /* unseen निकालें */
            const unseenIds = messages
                .filter(
                    (m) =>
                        String(m.senderId) === String(user._id) &&
                        String(m.receiverId) === String(authUser._id) &&
                        !m.isSeen
                )
                .map((m) => String(m._id));

            console.log("🔍 Unseen IDs after fetch:", unseenIds);

            if (unseenIds.length) {
                if (socket?.connected) {
                    console.log("📤 Emitting message-seen (bulk) for:", unseenIds);
                    socket.emit("message-seen", {
                        messageIds: unseenIds,
                        senderId: user._id,
                        receiverId: authUser._id,
                    });
                } else {
                    console.warn("⚠️ Socket not connected, cannot emit message-seen");
                }

                dispatch(markManySeen({ userId: String(user._id), ids: unseenIds }));
            } else {
                console.log("✅ No unseen messages to mark");
            }
        } catch (err) {
            console.error("❌ Failed to load messages:", err.message);
            // यहाँ error banner/Toast भी दिखा सकते हैं
        } finally {
            /* Loader OFF */
            console.log("⏹️ selectuserhandle finished for user:", user._id);
        }
    };



    // useEffect(() => {
    //     if (!selectedUser || !messagesByUser[selectedUser._id]) {
    //         // console.warn("⚠️ Messages not ready yet for selectedUser");
    //     } else {
    //         console.log("✅ Messages for selected user ready:", messagesByUser[selectedUser._id]);
    //     }
    // }, [selectedUser, messagesByUser]);




    // Submit message
    const onsubmithandler = async (e) => {
        e.preventDefault();

        const isMessageEmpty = !allmessage.message.trim();
        const areFilesEmpty = !allmessage.files || allmessage.files.length === 0;

        if (isMessageEmpty && areFilesEmpty) {

            console.warn("Empty message. Type something or attach a file.");
            return;
        }

        const formData = new FormData();
        formData.append("message", allmessage.message.trim());

        allmessage.files.forEach((fileWrapper) => {
            formData.append("files", fileWrapper.file);
        });

        try {
            const response = await axios.post(
                `${BASE_URL}/api/v1/message/send/${selectedUser?._id}`,
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    withCredentials: true,
                }
            );

            const newMessage = response.data.newMessage;
            console.log("New message:", newMessage);

            dispatch(addNewMessage({ message: newMessage, authUserId: authUser._id }));

            if (!isMutedRef.current) {
                sendAudio.currentTime = 0;
                sendAudio.play().catch(() => { });
            }

            setAllMessage({ message: '', files: [] });
        } catch (error) {
            console.error('Message send error:', error);
        }
    };

    // Delete chat
    const handleDeleteChat = async () => {
        if (!selectedUser) return;

        const isFriend = friends.some(friend => friend._id === selectedUser?._id);
        if (!isFriend) {
            toast.error("You can delete chat only with friends.");
            return;
        }

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this conversation?"
        );
        if (!confirmDelete) return;

        try {
            const response = await axios.delete(
                `${BASE_URL}/api/v1/message/chat/${selectedUser?._id}`,
                { withCredentials: true }
            );

            toast.success(response.data.message || "Chat deleted successfully");
            dispatch(clearMessagesForUser(selectedUser?._id));
            dispatch(setSelectedUser(null)); // ✅ Deselect user
        } catch (error) {
            console.error("Error deleting chat:", error);
            toast.error("Failed to delete chat");
        }
    };

    // Logout
    const handlelogout = async () => {
        try {
            if (socket) {
                socket.disconnect();
                dispatch(setSocket(null));
            }

            await axios.get(`${BASE_URL}/api/v1/user/logout`, {
                withCredentials: true,
            });

            dispatch(setAuthUser(null));
            await persistor.purge();
            localStorage.removeItem("persist:root");

            toast.success("Logout successful");
            navigate("/loginpage");
        } catch (error) {
            console.error("Logout error:", error);
            toast.error("Logout failed");
        }
    };





    const lastSeenMessageId = useRef("");

    const unseenMsg = useMemo(() => {
        if (!filteredMessages || !selectedUser || !authUser) return [];

        return filteredMessages.filter(
            (msg) =>
                msg.senderId === selectedUser?._id &&
                !msg.isSeen &&
                !msg.isDeletedForEveryone &&
                !(msg.deletedFor || []).includes(authUser._id)
        );
    }, [filteredMessages, selectedUser, authUser]);



    // 1️⃣  ────────────────────────────────────────────────────────────────
    // useEffect: unseen messages को "seen" mark करने वाला हिस्सा
    // ────────────────────────────────────────────────────────────────────
    useEffect(() => {
        // console.log("🛎️ useEffect fired",
        //     { socketConnected: socket?.connected, selectedUser, authUser, unseenMsgLen: unseenMsg.length }
        // );

        // if (!socket || !socket.connected || !selectedUser || !authUser) {
        //     console.log("⏳ Waiting for socket/auth/selectedUser...");
        //     return;
        // }

        const unseenIds = unseenMsg.map((msg) => msg._id).sort().join(",");
        // console.log("📝 Calculated unseenIds:", unseenIds || "— none —");

        if (lastSeenMessageId.current === unseenIds) {
            // console.log("🔁 Same unseenIds as last time, skipping emit.");
            return; // Prevent loop
        }

        lastSeenMessageId.current = unseenIds;

        if (unseenMsg.length > 0) {
            console.log("📤 Emitting message-seen for:", unseenIds);
            socket.emit("message-seen", {
                senderId: selectedUser._id,
                receiverId: authUser._id,
                messageIds: unseenMsg.map((msg) => msg._id),
            });
        } else {
            console.log("✅ No unseen messages to emit.");
        }
    }, [socket?.connected, unseenMsg, selectedUser?._id, authUser?._id]);







    useEffect(() => {
        // console.log("🧪 useEffect socket is change:", socket);
    }, [socket]);


    const authUserId = useSelector((state) => state.user.authUser?._id?.toString());

    const totalUnseenMessagesCount = useMemo(() => {
        //   console.log("🔁 unseen message count calculating...");
        return Object.values(messagesByUser).reduce((total, messages) => {
            return (
                total +
                messages.filter(
                    (msg) =>
                        msg.senderId?.toString() !== authUserId &&
                        !msg.isSeen &&
                        !msg.isDeletedForEveryone &&
                        !(msg.deletedFor || []).includes(authUserId)
                ).length
            );
        }, 0);
    }, [messagesByUser, authUserId]);




    const getUnseenMessagesCount = (userId) => {
        const userMessages = messagesByUser[userId] || [];

        const result = userMessages.filter((msg) => {
            const senderMatch = String(msg.senderId) === String(userId);
            const notSeen = !msg.isSeen;
            const notDeleted = !msg.isDeletedForEveryone;
            const notHidden = !(msg.deletedFor || []).includes(authUser._id);

            return senderMatch && notSeen && notDeleted && notHidden;
        });

        return result.length;
    };

    // Account dropdown handlers
    const [myaccountdrop, setMyAccountDrop] = useState(null);
    const accountopen = Boolean(myaccountdrop);

    const handleMyAccountopen = (event) => {
        setMyAccountDrop(event.currentTarget);
    };
    const handleMyAccountclose = () => {
        setMyAccountDrop(null);
    };


    // handlemute delete chat dropdown menu
    const [anchormute, setAnchorMute] = useState(null);
    const open = Boolean(anchormute);

    const handleClickmute = (event) => {
        setAnchorMute(event.currentTarget);
    };

    const handleClosemute = () => {
        setAnchorMute(null);
    };

    const toggleMute = () => {
        setIsMuted(prev => !prev);
        handleClosemute();
    };


    useEffect(() => {
        // console.log("Redux messages:", messages);
    }, [messages]);


    const [activeLeftTab, setActiveLeftTab] = useState("chat"); // default: chat user list

    useEffect(() => {
        if (!socket) return;

        const handleOnlineUsers = (onlineUsers) => {
            const onlineFriends = friends
                ?.filter((friend) => onlineUsers.includes(friend._id))
                .map((friend) => friend._id);

            dispatch(setFriendsOnline(onlineFriends));
        };

        socket.on('get-online-users', handleOnlineUsers);

        return () => {
            socket.off('get-online-users', handleOnlineUsers);
        };
    }, [socket, friends, dispatch]);

    const groupedMessages = useMemo(() => {
        return messages.reduce((groups, message) => {
            const dateKey = dayjs(message.createdAt).startOf("day").toISOString();
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(message);
            return groups;
        }, {});
    }, [messages]);
    // message info 
    let timer = null;
    const [selectedMessageId, setSelectedMessageId] = useState(null);

    const handleLongPress = (id) => {
        // Start timer for long press
        timer = setTimeout(() => {
            setSelectedMessageId(id); // Show tooltip only for this message
        }, 600);
    };

    const cancelLongPress = () => {
        clearTimeout(timer);
        setSelectedMessageId(null); // Hide tooltip
    };





    return (
        <>
            <div className="chat-section">
                <div className="chat-header">
                    <div className="chat-top">
                        <div className="chat-heading">
                            <div className='logo-chat'>
                                <img src='./images/fixlogo.png' alt='' />
                            </div>
                            <h1>chat</h1><span>X</span>
                        </div>
                        <div className="my-account-box">

                            <IconButton
                                id="basic-button"
                                aria-controls={accountopen ? 'basic-menu' : undefined}
                                aria-haspopup="true"
                                aria-expanded={accountopen ? 'true' : undefined}
                                onClick={handleMyAccountopen}
                                className="my-account-button"

                            >

                                <IoMenu />
                            </IconButton>

                            <Menu
                                id="basic-menu"
                                anchorEl={myaccountdrop}
                                open={accountopen}
                                onClose={handleMyAccountclose}
                                PaperProps={{
                                    sx: {
                                        backgroundColor: 'rgb(189, 205, 253)',  // Background color
                                        color: '#302929e4',
                                        minWidth: "220px"                     // Text color
                                    },
                                }}

                                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                            >
                                <MenuItem sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}  >
                                    <Avatar src={authUser?.profilePhoto} />

                                    <h5 id="top-auth-name">{authUser?.username}</h5>
                                </MenuItem>
                                <MenuItem onClick={handlelogout}>
                                    <ListItemIcon>
                                        <MdLogout fontSize="1.5em" color='#302929e4' />
                                    </ListItemIcon>
                                    Logout
                                </MenuItem>

                            </Menu>
                        </div>

                    </div>
                    <div className="chat-box">

                        <div className={`chat-left ${selectedUser?._id ? 'left-sub' : ''} ${activeLeftTab === 'friends' ? 'full-height' : ''}`} >
                            {activeLeftTab === "chat" ? (
                                <>
                                    <div className="chat-left-top">
                                        <div className="chat-search-box">
                                            <div className="chat-search-icon">
                                                <IoMdSearch />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Search users..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="chat-user-name-box">
                                        {Array.isArray(chatUsers) &&
                                            chatUsers
                                                .filter((user) =>
                                                    user?.fullname?.toLowerCase().includes(searchTerm.toLowerCase())
                                                )
                                                .map((user) => {
                                                    const isOnline = Array.isArray(friendsOnline) && friendsOnline.includes(user._id);


                                                    return (
                                                        <div
                                                            onClick={() => selectuserhandle(user)}
                                                            key={user._id}
                                                            className={`chat-conversation-list ${selectedUser?._id === user._id ? 'color-change' : ''
                                                                }`}
                                                        >
                                                            <div className="chat-img-box">
                                                                <div className={isOnline ? "online" : ""}></div>
                                                                <div className="chat-user-img">
                                                                    <img src={user?.profilePhoto} alt="profile" />
                                                                </div>
                                                            </div>
                                                            <div className="chat-user-info-box">
                                                                <div className="chat-user-name-time">
                                                                    <p>{user.fullname}</p>
                                                                </div>
                                                                {getUnseenMessagesCount(user._id) > 0 && (
                                                                    <div className='friend-msg-count'>
                                                                        <p>{getUnseenMessagesCount(user._id)}</p>
                                                                    </div>
                                                                )}

                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                    </div>
                                </>
                            ) : activeLeftTab === "allUsers" ? (
                                <NewUserList />
                            ) : activeLeftTab === "friends" ? (
                                <YourFriends />
                            ) : activeLeftTab === "groups" ? (
                                <Groups />
                            ) : null}

                            <div className='add-new-friend-box'>
                                <div onClick={() => setActiveLeftTab("groups")} className={`new-group-box ${activeLeftTab === "groups" ? "active-tab" : ""}`}>

                                    <div className='group-icon'>
                                        <MdGroups />

                                    </div>


                                    <div className='group-name'>
                                        <p>Groups</p>
                                    </div>

                                </div>
                                <div onClick={() => setActiveLeftTab("allUsers")} className={`all-friend-list-page ${activeLeftTab === "allUsers" ? "active-tab" : ""}`}>
                                    <div className='friend-list-icon'>
                                        <PiUserListBold />
                                    </div>
                                    <div className='friend-list-name'>
                                        <p>All-User</p>
                                    </div>
                                </div>
                                <div onClick={() => setActiveLeftTab("friends")} className={`invite-friend-page ${activeLeftTab === "friends" ? "active-tab" : ""}`}>
                                    <div className='invite-icon'>
                                        <IoPersonAddSharp />
                                    </div>
                                    <div className='invite-name'>
                                        <p>Friends</p>
                                    </div>
                                </div>
                                <div onClick={() => setActiveLeftTab("chat")} className={`chats-page ${activeLeftTab === "chat" ? "active-tab" : ""}`}>
                                    {totalUnseenMessagesCount > 0 && (
                                        <div className='count-all-msg'>
                                            <p>{totalUnseenMessagesCount}</p>
                                        </div>
                                    )}

                                    <div className='chats-icon'>
                                        <BsChatSquareTextFill />
                                    </div>
                                    <div className='chats-name'>
                                        <p>Chats</p>
                                    </div>
                                </div>
                            </div>
                        </div>


                        <div className={`chat-right ${selectedUser?._id ? 'right-add' : ''}`}>
                            {!selectedUser ? (
                                <div className="no-chat-selected">
                                    <div className="no-chat-content">
                                        <img src="./images/fixlogo.png" alt="Start chatting" className="no-chat-image" />
                                        <h2>Welcome to ChatX!</h2>
                                        <p>Select a contact from the left to start a conversation.</p>
                                        <p>Your chats will appear here.</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="chat-right-top">
                                        <div className="chat-right-heading">
                                            <div className={`arrow-left ${selectedUser?._id ? 'right-sub' : ''}`} onClick={() => dispatch(setSelectedUser(null))}>
                                                <FaArrowLeft />
                                            </div>
                                            <div className="chat-right-top-img-box">
                                                <div className={isOnline ? "online" : ""}></div>
                                                <div className="chat-right-img">
                                                    <img src={selectedUser?.profilePhoto} alt="" />
                                                </div>
                                            </div>
                                            <div className="chat-right-img-detail">
                                                <div className="chat-right-name">
                                                    <p>{selectedUser?.username}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='btnmute'>


                                            <IconButton
                                                id="demo-customized-button"
                                                aria-controls={open ? 'demo-customized-menu' : undefined}
                                                aria-haspopup="true"
                                                aria-expanded={open ? 'true' : undefined}
                                                variant="contained"
                                                disableElevation
                                                onClick={handleClickmute}


                                            >
                                                <BsThreeDotsVertical />
                                            </IconButton>

                                            <Menu
                                                id="demo-customized-menu"
                                                anchorEl={anchormute}
                                                open={open}
                                                onClose={handleClosemute}
                                                PaperProps={{
                                                    sx: {
                                                        backgroundColor: 'rgb(189, 205, 253)',
                                                        color: '#302929e4',
                                                    },
                                                }}
                                                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                            >
                                                <MenuItem onClick={toggleMute}>
                                                    {isMuted ? (
                                                        <>
                                                            <GoUnmute style={{ marginRight: "10px" }} /> Unmute Notification
                                                        </>
                                                    ) : (
                                                        <>
                                                            <IoVolumeMute style={{ marginRight: "10px" }} /> Mute Notification
                                                        </>
                                                    )}
                                                </MenuItem>
                                                {selectedUser?._id && (
                                                    <MenuItem onClick={() => { handleDeleteChat(); handleClosemute(); }}>
                                                        Delete Chat
                                                    </MenuItem>
                                                )}

                                            </Menu>
                                        </div>

                                    </div>

                                    <div className="chat-right-conversation">
                                        <div className="chat-container">
                                            {/* ------------ Right‑pane messages ------------ */}
                                            <div className="chat-right-communication" key={selectedUser?._id}>

                                                {/* ②  user चुना है लेकिन messages अभी 0 हैं */}
                                                {selectedUser && messages.length === 0 && (
                                                    <div className="no-message">
                                                        <p>No messages</p>
                                                    </div>
                                                )}

                                                {/* ③  user + messages दोनों मौजूद */}
                                                {selectedUser && messages.length > 0 && (
                                                    Object.entries(groupedMessages).map(([dateKey, msgsOnDate]) => (
                                                        <React.Fragment key={dateKey}>
                                                            <div className="date-separator">
                                                                <span>{formatChatDate(msgsOnDate[0].createdAt)}</span>
                                                            </div>

                                                            {msgsOnDate.map((msg, idx) => {
                                                                const isSender = authUser._id === msg.senderId;
                                                                const isDeletedForMe = msg.deletedFor?.includes(authUser._id);
                                                                const isDeletedForEveryone = msg.isDeletedForEveryone;
                                                                if (isDeletedForMe) return null;

                                                                return (
                                                                    <div
                                                                        key={msg._id}
                                                                        ref={idx === msgsOnDate.length - 1 ? messageEndRef : null}
                                                                        className={`message ${isSender ? "send" : "recive"} ${isDeletedForEveryone ? "deleted-message" : ""}`}
                                                                        onMouseDown={() => handleLongPress(msg._id)}
                                                                        onMouseUp={cancelLongPress}
                                                                        onMouseLeave={cancelLongPress}
                                                                        onTouchStart={() => handleLongPress(msg._id)}
                                                                        onTouchEnd={cancelLongPress}
                                                                        onTouchCancel={cancelLongPress}
                                                                    >
                                                                        {/* Deleted message */}
                                                                        {isDeletedForEveryone ? (
                                                                            <i>This message was deleted</i>
                                                                        ) : (
                                                                            <>
                                                                                {/* File rendering (if any) */}

                                                                                {/* Text */}
                                                                                {msg.message && <p>{msg.message}</p>}
                                                                                {msg.fileurl && msg.fileurl.length > 0 && (
                                                                                    <div className="message-files">
                                                                                        {msg.fileurl.map((fileUrl, index) => {
                                                                                            const isImage = /\.(png|jpg|jpeg|gif)$/i.test(fileUrl);
                                                                                            return (
                                                                                                <div key={index} className="file-preview">
                                                                                                    {isImage ? (
                                                                                                        <img src={fileUrl} alt="uploaded" className="chat-img" />
                                                                                                    ) : (
                                                                                                        <a href={fileUrl} target="_blank" rel="noopener noreferrer" download>
                                                                                                            📄 {fileUrl.split('/').pop()}
                                                                                                        </a>
                                                                                                    )}
                                                                                                </div>
                                                                                            );
                                                                                        })}
                                                                                    </div>
                                                                                )}

                                                                                {/* ✅ Sender view: Sent + Seen icons */}
                                                                                {isSender && (
                                                                                    <div className="message-status">
                                                                                        {msg.createdAt && (
                                                                                            <span className="timestamp">
                                                                                                {dayjs(msg.createdAt).format("h:mm A")}
                                                                                            </span>
                                                                                        )}
                                                                                        {msg.isSeen ? (
                                                                                            <BsCheck2All color="blue" className="inline-block ml-1" />
                                                                                        ) : (
                                                                                            <BsCheck2 className="inline-block ml-1" />
                                                                                        )}
                                                                                    </div>
                                                                                )}

                                                                                {/* ✅ Tooltip on long press (only sender) */}
                                                                                {isSender && selectedMessageId === msg._id && (
                                                                                    <div className="absolute-info">
                                                                                        <div>Delivered: {dayjs(msg.createdAt).format("h:mm A")}</div>
                                                                                        {msg.isSeen && msg.seenTime && (
                                                                                            <div>Read: {dayjs(msg.seenTime).format("h:mm A")}</div>
                                                                                        )}
                                                                                    </div>
                                                                                )}

                                                                                {/* ✅ Receiver view: only seen time (no icon) */}
                                                                                {!isSender && msg.seenTime && (
                                                                                    <div className="message-status">
                                                                                        <span className="timestamp">
                                                                                            {dayjs(msg.seenTime).format("h:mm A")}
                                                                                        </span>
                                                                                    </div>
                                                                                )}
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </React.Fragment>
                                                    ))
                                                )}
                                            </div>




                                            {/* Input Area */}
                                            < div className="input-area" >
                                                <form onSubmit={onsubmithandler}>
                                                    <div className="input-wrapper" style={{ position: "relative" }}>
                                                        <label htmlFor="file-upload" className="file-icon">📎</label>

                                                        {/* Emoji Button */}
                                                        <span
                                                            className="emoji-icon"
                                                            style={{ cursor: 'pointer', marginLeft: '8px' }}
                                                            onClick={() => setShowEmojiPicker(prev => !prev)}
                                                        >
                                                            😄
                                                        </span>

                                                        {/* Emoji Picker */}
                                                        {showEmojiPicker && (
                                                            <div style={{
                                                                position: 'absolute',
                                                                bottom: '60px',
                                                                left: '0',
                                                                zIndex: 999,
                                                                backgroundColor: 'white',
                                                                border: '1px solid #ccc',
                                                                borderRadius: '8px',
                                                                padding: '4px',
                                                            }}>
                                                                {/* ❌ Black Close Button */}
                                                                <div style={{ textAlign: 'right' }}>
                                                                    <IconButton
                                                                        style={{
                                                                            border: 'none',
                                                                            background: 'transparent',
                                                                            fontSize: '16px',
                                                                            color: 'black', // 🔥 Black color added here
                                                                            cursor: 'pointer',
                                                                            marginBottom: '5px'
                                                                        }}
                                                                        onClick={() => setShowEmojiPicker(false)}

                                                                    >
                                                                        <IoCloseSharp />
                                                                    </IconButton>
                                                                </div>

                                                                <Picker data={data} onEmojiSelect={handleEmojiSelect} />
                                                            </div>
                                                        )}



                                                        <input
                                                            id="file-upload"
                                                            type="file"
                                                            multiple
                                                            onChange={(e) => {
                                                                const selectedFiles = Array.from(e.target.files).map(file => {
                                                                    const timestamp = Date.now();
                                                                    const ext = file.name.substring(file.name.lastIndexOf('.'));
                                                                    const uniqueName = `${file.name.split('.')[0]}-${timestamp}${ext}`;
                                                                    const renamedFile = new File([file], uniqueName, { type: file.type });

                                                                    return {
                                                                        file: renamedFile,
                                                                        type: file.type,
                                                                        name: uniqueName,
                                                                        previewURL: URL.createObjectURL(renamedFile),
                                                                    };
                                                                });

                                                                setAllMessage({ ...allmessage, files: selectedFiles });
                                                            }}
                                                            style={{ display: 'none' }}
                                                        />

                                                        {Array.isArray(allmessage.files) && allmessage.files.length > 0 && (
                                                            <div className="selected-file-list">
                                                                {allmessage.files.map((file, index) => {
                                                                    const isImage = file?.type?.startsWith("image/");
                                                                    return (
                                                                        <div key={index} className="selected-file-preview">
                                                                            {isImage ? (
                                                                                <div className="image-preview-container">
                                                                                    <img src={file.previewURL} alt="preview" className="image-preview" />
                                                                                    <span
                                                                                        className="remove-image-btn"
                                                                                        title="Remove file"
                                                                                        onClick={() => {
                                                                                            const updatedFiles = allmessage.files.filter((_, i) => i !== index);
                                                                                            setAllMessage({ ...allmessage, files: updatedFiles });
                                                                                            URL.revokeObjectURL(file.previewURL);
                                                                                        }}
                                                                                    >
                                                                                        ❌
                                                                                    </span>
                                                                                </div>
                                                                            ) : (
                                                                                <div className="file-name-container">
                                                                                    📄 {file.name}
                                                                                    <span
                                                                                        className="remove-file-btn"
                                                                                        onClick={() => {
                                                                                            const updatedFiles = allmessage.files.filter((_, i) => i !== index);
                                                                                            setAllMessage({ ...allmessage, files: updatedFiles });
                                                                                            URL.revokeObjectURL(file.previewURL);
                                                                                        }}
                                                                                    >
                                                                                        ❌
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}

                                                        <input
                                                            className="text-input"
                                                            value={allmessage.message}
                                                            onChange={(e) => setAllMessage({ ...allmessage, message: e.target.value })}
                                                            placeholder="Type your message..."
                                                        />
                                                    </div>
                                                    <IconButton type='submit'>
                                                        <IoMdSend />
                                                    </IconButton>

                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>


                    </div>
                </div>
            </div >
        </>
    )
}

export default Chatpage;