import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import './newuserlist.css';
import { Button } from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';
import { IoMdSearch } from "react-icons/io";
import fetchFriendRequests from '../../hooks/usegetfriend';

import { acceptFriendRequest, removeSentRequest, addSentRequest } from "../../redux/friendSlice";
import { removeFriendRequest } from "../../redux/friendSlice";
import fetchFriends from '../../hooks/becomefriend';
import fetchSentRequests from '../../hooks/sentrequest';
import useGetOtherUsers from '../../hooks/usergetotheruser';




const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const NewUserList = () => {
  const dispatch = useDispatch();
    useGetOtherUsers();
  const { otherUsers, onlineUsers, authUser,  chatUsers } = useSelector((state) => state.user);
  const { friendRequests, friends } = useSelector((state) => state.friend);
  const { sentRequests } = useSelector((state) => state.friend);
  const { socket } = useSelector((state) => state.socket);

  


  const [searchTerm, setSearchTerm] = useState('');
  

  useEffect(() => {
    fetchFriendRequests(dispatch);
    fetchFriends(dispatch); // 🔥 Friends भी लाओ
  }, [dispatch]);

  const filteredUsers = otherUsers?.filter((user) => {
    const isNotMe = user._id !== authUser?._id;
    const isNotChatted = !chatUsers?.some((cu) => cu._id === user._id);
    const isNotFriend = !friends?.some((f) => f._id === user._id);
    const isNotInFriendRequests = !friendRequests?.some((f) => f._id === user._id);
    const matchesSearch = user?.fullname?.toLowerCase().includes(searchTerm.toLowerCase());

    return isNotMe && isNotChatted && isNotFriend &&  isNotInFriendRequests && matchesSearch;
  });
const isRequested = (userId) => sentRequests?.includes(userId);



  // 🚀 Send Friend Request
  const handleSendRequest = async (receiverId) => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      toast.error("Token missing. Please login again.");
      return;
    }

    try {
      const res = await axios.post(
        `${BASE_URL}/api/v1/friend/send-request/${receiverId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      toast.success(res.data.message || 'Friend request sent');
    dispatch(addSentRequest(receiverId));
     fetchSentRequests(dispatch);
    } catch (error) {
      console.error("Friend request error:", error);
      toast.error(error.response?.data?.message || "Failed to send friend request");
    }
  };

  // 🚀 Accept Friend Request
  const handleAccept = async (user) => {
    const token = localStorage.getItem("accessToken");

    try {
      const res = await axios.post(
        `${BASE_URL}/api/v1/friend/accept-request/${user._id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      toast.success(res.data.message || "Friend request accepted");

      // ✅ Update Redux
      dispatch(acceptFriendRequest(user._id));
      fetchFriends();

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to accept friend request");
    }
  };

  // 🚀 Delete/Cancel Friend Request is work process
  const handleDeleteFriendRequest = async (user) => {
    const token = localStorage.getItem("accessToken");

    try {
      const res = await axios.post(
        `${BASE_URL}/api/v1/friend/delete-request/${user._id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      toast.success(res.data.message || "Friend request deleted");

      // ✅ Update Redux
      dispatch(removeFriendRequest(user._id));

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete friend request");
    }
  };

  // cancel sent request is run

  const handleCancelRequest = async (userId) => {
  try {
    const token = localStorage.getItem('accessToken');

    await axios.post(
      `${BASE_URL}/api/v1/friend/cancel-friend-request/${userId}`,
      {}, // 👈 Empty body
      {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      }
    );

    dispatch(removeSentRequest(userId));
    toast.info('Friend request cancelled');
     fetchSentRequests(dispatch);
  } catch (error) {
    console.error(error);
    toast.error('Failed to cancel friend request');
  }
};


 useEffect(() => {
  fetchFriendRequests(dispatch);
  fetchFriends(dispatch);
  fetchSentRequests(dispatch); // 🔥 यह बहुत जरूरी है
}, [dispatch]);

useEffect(() => {
  socket.on('new-friend-request', ({ sender }) => {
    // Update Redux -> Add in friendRequests
    toast.info(`${sender.fullname} sent you a friend request.`);
  });

  socket.on('cancel-friend-request-update', ({ senderId }) => {
    // Remove from friendRequests
    toast.info('A friend request was cancelled.');
  });

  socket.on('friend-request-accepted', ({ sender }) => {
    // Update -> Add in friends list
    toast.success(`${sender.fullname} accepted your friend request.`);
  });
return () => {
    socket.off('new-friend-request');
    socket.off('cancel-friend-request-update');
    socket.off('friend-request-accepted');
    socket.off('unfriend-update');
  };
}, []);

useEffect(() => {
  // console.log("👀 People You May Know:", filteredUsers.map(user => ({
  //   id: user._id,
  //   name: user.fullname
  // })));
}, [filteredUsers]);





  return (
    <>
      <div className='new-user-list-section'>
        {/* 🔍 Search Bar */}
        <div className="new-list-top">

          <div className="user-search-box">
            <div className='user-search-icon'>
              <IoMdSearch />
            </div>
            <input
              type="text"
              placeholder="Search new users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* 👤 New User List */}

        <div className="new-user-name-box">
          <div className='friend-request-count'>
            <h5>Friend requests</h5>
            <span className='friends-count'>{friendRequests.length}</span>
          </div>

          {friendRequests.length > 0 ? (
            friendRequests.map((user) => {
              const isOnline = onlineUsers.includes(user._id);

              return (
                <div key={user._id} className="without-chat-list">
                  <div className="chat-img-box">
                    <div className={isOnline ? "online" : ""}></div>
                    <div className="chat-user-img">
                      <img src={user?.profilePhoto} alt="profile" />
                    </div>
                  </div>

                  <div className="chat-user-info-box">
                    <div className="chat-user-name-time">
                      <p>{user?.fullname}</p>
                    </div>

                    <div className='request-btn-box'>
                      <div className='add-and-remove-btn'>
                        <div className='request-add-btn'>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleAccept(user)}
                          >
                            Accept
                          </Button>
                        </div>
                        <div className='request-remove-btn'>
                          <Button
                            color="error"
                            onClick={() => handleDeleteFriendRequest(user)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className='not-found'>
              <p className="no-user-msg">No Friend Request </p>
            </div>
          )}
        </div>

        <div className='people-you-may-know'>
          <div className='people-you-count'>
            <h5>People you may know</h5>
          </div>

          {filteredUsers?.length > 0 ? (
            filteredUsers.map((user) => {
              const isOnline = onlineUsers?.includes(user._id);
              const isReq = isRequested(user._id); // 🔥 Check from Redux

              return (
                <div key={user._id} className="without-friend-list">
                  <div className="chat-img-box">
                    <div className={isOnline ? "online" : ""}></div>
                    <div className="chat-user-img">
                      <img src={user?.profilePhoto} alt="profile" />
                    </div>
                  </div>

                  <div className="friend-user-info-box">
                    <div className="chat-user-name-time">
                      <p>{user?.fullname}</p>
                    </div>

                    <div className='request-btn-box'>
                      <div className='add-and-remove-btn'>
                        {isReq ? (
                          <div className='cancel-btn'>
                            <Button
                              onClick={() => handleCancelRequest(user._id)}
                             
                            >
                              Cancel Request
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className='request-add-btn'>
                              <Button
                                onClick={() => handleSendRequest(user._id)}
                                variant="contained"
                                color="primary"
                              >
                                Add Friend
                              </Button>
                            </div>

                            {/* <div className='request-remove-btn'>
                              <Button disabled>Remove</Button>
                            </div> */}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className='not-found'>
              <p className="no-user-msg">New User Not Found</p>
            </div>
          )}
        </div>




      </div>
    </>
  );
};

export default NewUserList;
