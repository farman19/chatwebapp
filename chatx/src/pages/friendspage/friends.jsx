import React, { useEffect, useState } from "react";
import "./friendspage.css";
import { IoMdSearch } from "react-icons/io";
import { BsThreeDots } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import fetchFriends from "../../hooks/becomefriend";
import { Menu, MenuItem, IconButton, Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { RiUserForbidLine, RiUserUnfollowLine } from "react-icons/ri";
import axios from "axios";
import {  removeFriend } from "../../redux/friendSlice";
import { toast } from "react-toastify";
import useGetOtherUsers, {fetchOtherUsers} from '../../hooks/usergetotheruser'







const BASE_URL = process.env.REACT_APP_API_BASE_URL;


const YourFriends = () => {
  const dispatch = useDispatch();
    useGetOtherUsers();
  const { friends, friendsOnline } = useSelector((state) => state.friend);
 
const { socket } = useSelector((state) => state.socket);
const { authUser } = useSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState("");

  const [myaccountdrop, setMyAccountDrop] = useState(null);
  const accountopen = Boolean(myaccountdrop);

  const handlefriendsettingopen = (event) => {
    setMyAccountDrop(event.currentTarget);
  };
  const handlefriendsettingclose = () => {
    setMyAccountDrop(null);
  };

  // Unfriend Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);

  const handleOpenDialog = (friend) => {
    setSelectedFriend(friend);
    setOpenDialog(true);
    handlefriendsettingclose(); 
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedFriend(null);
  };

  // Unfriend Function
  const handleUnfriend = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      await axios.post(
        `${BASE_URL}/api/v1/friend/unfriend/${selectedFriend._id}`,  
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

       socket.emit("unfriend", {
      receiverId: selectedFriend._id,
      senderId: authUser._id,
    });

      // Redux से हटाओ
      dispatch(removeFriend(selectedFriend._id));
        
    
     await fetchFriends(dispatch);         
    await fetchOtherUsers(dispatch);            
        


      handleCloseDialog();
    } catch (error) {
      console.error("Unfriend Error", error);
      handleCloseDialog();
    }
  };


 useEffect(() => {
  fetchFriends(dispatch);

  // ✅ Listen for unfriend event
  socket.on("unfriend-update", ({ senderId }) => {
    dispatch(removeFriend(senderId));
    fetchFriends(dispatch); 
    toast.info("A user unfriended you.");
  });

 
  return () => {
    socket.off("unfriend-update");
  };
}, [dispatch]);

  const filteredFriends = friends.filter((user) =>
    user.fullname?.toLowerCase().includes(searchTerm.toLowerCase())
  );


 


  return (
    <>
      <div className="your-friend-section">
        <div className="friend-top">
          <div className="friends-search-box">
            <div className="f-search-icon">
              <IoMdSearch />
            </div>
            <div className="f-input-search">
              <input
                type="text"
                placeholder="Search friends"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="friends-become-count">
          <h5>Friends</h5>
          <span className="fx-count">{filteredFriends.length}</span>
        </div>

        {filteredFriends.length > 0 ? (
          filteredFriends.map((user) => {
           const isOnline = Array.isArray(friendsOnline) && friendsOnline.includes(user._id);

            return (
              <div key={user._id} className="friends-info-boxs">
                <div className="f-photo">
                  <div className={isOnline ? "online" : ""}></div>
                  <div className="main-profilephoto">
                    <img src={user.profilePhoto} alt="profile" />
                  </div>
                </div>

                <div className="friends-details">
                  <div className="f-name-box">
                    <p>{user.username}</p>
                  </div>
                  <div className="update-btn">
                    <IconButton
                      id="basic-button"
                      aria-controls={accountopen ? 'basic-menu' : undefined}
                      aria-haspopup="true"
                      aria-expanded={accountopen ? 'true' : undefined}
                      onClick={handlefriendsettingopen}
                    >
                      <BsThreeDots />
                    </IconButton>

                    <Menu
                      id="basic-menu"
                      anchorEl={myaccountdrop}
                      open={accountopen}
                      onClose={handlefriendsettingclose}
                      PaperProps={{
                        sx: {
                          backgroundColor: 'rgb(189, 205, 253)',
                         color: '#302929e4',
                          maxWidth: "300px",
                          borderRadius: '10px',
                          p: 1,
                        },
                      }}
                      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                      <MenuItem id="menu-item">
                        <RiUserForbidLine id="menu-item-icon" />
                        <Box>
                          <p id="menu-item-title">Block {user.username}'s Chat</p>
                          <p id="menu-item-description">
                            User won't be able to chat with or friend you on ChatX.
                          </p>
                        </Box>
                      </MenuItem>

                      <MenuItem id="menu-item-2" onClick={() => handleOpenDialog(user)}>
                        <RiUserUnfollowLine id="menu-item-icon-2" />
                        <Box>
                          <p id="menu-item-title-2">Unfriend {user.username}</p>
                          <p id="menu-item-description-2">
                            Remove {user.username} as a friend.
                          </p>
                        </Box>
                      </MenuItem>
                    </Menu>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="not-found">
            <p>No Friends Found</p>
          </div>
        )}
      </div>

      {/* Unfriend Confirmation Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Unfriend {selectedFriend?.username}?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove {selectedFriend?.username} from your friends?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleUnfriend} color="error" variant="contained">
            Unfriend
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default YourFriends;
