import React, { useState, useRef, useEffect } from 'react';
import './chatpage.css'

import { IoMdSearch } from "react-icons/io";
// import EmojiPicker from "emoji-picker-react";
import { Button } from "@mui/material";
import useGetOtherUsers from '../hooks/usergetotheruser';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { setSelectedUser } from '../redux/userSlice';
import { useDispatch } from 'react-redux';
import useGetMessages from '../hooks/usegetmessage';
// import {selectedUser} from '../redux/userSlice'
import { FaComments } from 'react-icons/fa';
import { FaArrowLeft } from "react-icons/fa6";

import { clearMessagesForUser, setMessages } from '../redux/messageSlice';
// import { Picker } from 'emoji-mart';
import { setSocket } from "../redux/socketSlice";
import { v4 as uuidv4 } from 'uuid';





import { resetUserState } from "../redux/userSlice"; // adjust path as needed
import useGetRealTimeMessage from '../hooks/usegetrealtimemessage';
// adjust path as needed



const Chatpage = () => {



    const dispatch = useDispatch();
    const navigate = useNavigate();
    useGetRealTimeMessage();

    const messageEndRef = useRef(null);

    // Redux state
    const { authUser, selectedUser, onlineUsers, otherUsers } = useSelector(store => store.user);
    const { socket } = useSelector(store => store.socket);
    const isOnline = selectedUser?._id && onlineUsers?.includes(selectedUser._id); // ✅

    // console.log(isOnline)
    const messages = useSelector(store => store.message.messages) ?? [];



    // Component state
    const [searchTerm, setSearchTerm] = useState('');
    const [allmessage, setAllMessage] = useState({
        message: '',
        files: [],
    });

    // Custom hooks for socket/user/messages

    useGetOtherUsers();
    useGetMessages();

    // Clear messages on mount (once)
    useEffect(() => {
        dispatch(clearMessagesForUser());
    }, [dispatch]);

    // Scroll to latest message
    // useEffect(() => {
    //     messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    // }, [messages]);

    // Cleanup object URLs on unmount
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


    const filteredMessages = Array.isArray(messages) && selectedUser && authUser
        ? messages.filter(
            (msg) =>
                (msg.senderId === authUser._id && msg.receiverId === selectedUser._id) ||
                (msg.senderId === selectedUser._id && msg.receiverId === authUser._id)
        )
        : [];



    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [filteredMessages]);
    // Select chat user
    const selectuserhandle = (user) => {
        dispatch(setSelectedUser(user));
    };

    // Send message
    const onsubmithandler = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("message", allmessage.message);

        allmessage.files.forEach((fileWrapper) => {
            formData.append("files", fileWrapper.file);
        });

        try {
            const response = await axios.post(
                `https://chatx-xilj.onrender.com/api/v1/message/send/${selectedUser?._id}`,
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    withCredentials: true,
                }
            );

            const newMessage = response.data.newMessage;

            // ✅ Check if messages is an array
            if (Array.isArray(messages)) {
                dispatch(setMessages([...messages, newMessage]));
            } else {
                dispatch(setMessages([newMessage])); // fallback if messages is not initialized
            }

            setAllMessage({ message: '', files: [] });
        } catch (error) {
            console.error('Message send error:', error);
        }
    };

    // Delete chat
    const handleDeleteChat = async () => {
        if (!selectedUser) return;

        const confirmDelete = window.confirm("Are you sure you want to delete this conversation?");
        if (!confirmDelete) return;

        try {
            const response = await axios.delete(
                `https://chatx-xilj.onrender.com/api/v1/message/chat/${selectedUser._id}`,
                { withCredentials: true }
            );

            toast.success(response.data.message || "Chat deleted successfully");
            dispatch(clearMessagesForUser(selectedUser._id));
        } catch (error) {
            console.error("Error deleting chat:", error);
            toast.error("Failed to delete chat");
        }
    };

    // Logout handler
    const handlelogout = async () => {
        try {

              if (socket) {
                socket.disconnect();
                dispatch(setSocket(null));
            }
            await axios.get("https://chatx-xilj.onrender.com/api/v1/user/logout", { withCredentials: true });

          



            toast.success("Logout successful");
            navigate("/loginpage");
        } catch (error) {
            console.error("Logout error:", error);
            toast.error("Logout failed");
        }
    };





    return (
        <>
            <div className="chat-section">
                <div className="chat-header">
                    <div className="chat-top">
                        <div className="chat-heading">
                            <FaComments style={{ fontSize: '24px', color: '#fff', marginRight: '10px' }} />
                            <h1>chat</h1><span>X</span>
                        </div>
                        <div className='logout-btnbox'>
                            <Button onClick={handlelogout}>Logout</Button>
                        </div>
                    </div>
                    <div className="chat-box">
                        <div className={`chat-left ${selectedUser?._id ? 'left-sub' : ''} `}>
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
                                {
                                    otherUsers
                                        ?.filter((user) =>
                                            user.fullname.toLowerCase().includes(searchTerm.toLowerCase())
                                        )
                                        .map((user) => {
                                            const isOnline = onlineUsers?.includes(user._id); 

                                            return (
                                                <div
                                                    onClick={() => selectuserhandle(user)}
                                                    key={user._id}
                                                    className={`chat-conversation-list ${selectedUser?._id === user?._id ? 'color-change' : ''}`}
                                                >
                                                    <>
                                                        <div className="chat-img-box">
                                                            <div className={isOnline ? "online" : ""}></div> 
                                                            <div className="chat-user-img">
                                                                <img src={user?.profilePhoto} alt="" />
                                                            </div>
                                                        </div>

                                                        <div className="chat-user-info-box">
                                                            <div className="chat-user-name-time">
                                                                <p>{user?.fullname}</p>

                                                            </div>
                                                        </div>
                                                    </>
                                                </div>
                                            );
                                        })
                                }



                            </div>
                        </div>

                        <div className={`chat-right ${selectedUser?._id ? 'right-add' : ''}`}>
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
                                <div className='del-top-btn'>
                                    {selectedUser?._id && (
                                        <Button onClick={handleDeleteChat}>Delete Chat</Button>
                                    )}
                                </div>
                            </div>

                            <div className="chat-right-conversation">
                                <div className="chat-container">
                                    <div className="chat-right-communication">
                                        {selectedUser ? (
                                            filteredMessages && filteredMessages.length > 0 ? (
                                                filteredMessages
                                                    .filter((msg) => msg.message || (msg.fileurl && msg.fileurl.length > 0))
                                                    .map((msg) => {
                                                        const isDeletedForMe = msg.deletedFor?.includes(authUser?._id);
                                                        const isDeletedForEveryone = msg.isDeletedForEveryone;

                                                        if (isDeletedForEveryone) {
                                                            return (
                                                                <div
                                                                    key={msg._id}
                                                                    ref={messageEndRef}
                                                                    className={`message ${authUser?._id === msg.senderId ? "send" : "recive"} deleted-message`}
                                                                >
                                                                    <i>This message was deleted</i>
                                                                </div>
                                                            );
                                                        }

                                                        if (isDeletedForMe) return null;

                                                        return (
                                                            <div
                                                                key={msg._id}
                                                                ref={messageEndRef}
                                                                className={`message ${authUser?._id === msg.senderId ? "send" : "recive"}`}
                                                            >
                                                                {/* Array of Files */}
                                                                {Array.isArray(msg.fileurl) && msg.fileurl.length > 0 &&
                                                                    msg.fileurl.map((url, index) => {
                                                                        if (typeof url !== "string") return null;
                                                                        const isImage = url.match(/\.(jpeg|jpg|png|gif|webp)$/i);
                                                                        return isImage ? (
                                                                            <img
                                                                                key={`${msg._id}-${index}`}
                                                                                src={url}
                                                                                alt="sent file"
                                                                                className="sent-image"
                                                                            />
                                                                        ) : (
                                                                            <a
                                                                                key={`${msg._id}-${index}`}
                                                                                href={url}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="file-link"
                                                                            >
                                                                                {url.split("/").pop()}
                                                                            </a>
                                                                        );
                                                                    })}

                                                                {/* Single fileurl */}
                                                                {!Array.isArray(msg.fileurl) && msg.fileurl && (
                                                                    msg.fileurl.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
                                                                        <img src={msg.fileurl} className="sent-image" alt="sent file" />
                                                                    ) : (
                                                                        <a
                                                                            href={msg.fileurl}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="file-link"
                                                                        >
                                                                            {msg.fileurl.split("/").pop()}
                                                                        </a>
                                                                    )
                                                                )}

                                                                {msg.message && <p>{msg.message}</p>}
                                                            </div>
                                                        );
                                                    })
                                            ) : (
                                                <div className="no-message">
                                                    <p>No messages</p>
                                                </div>
                                            )
                                        ) : (
                                            <div className="no-message">
                                                <p>Please select a user to start chatting.</p>
                                            </div>
                                        )}

                                    </div>

                                    {/* Input Area */}
                                    <div className="input-area">
                                        <form onSubmit={onsubmithandler}>
                                            <div className="input-wrapper">
                                                <label htmlFor="file-upload" className="file-icon">📎</label>
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
                                            <Button type='submit'>Send</Button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>


                    </div>
                </div>
            </div >
        </>
    )
}

export default Chatpage;