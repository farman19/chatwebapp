import { createSlice } from "@reduxjs/toolkit";

const friendSlice = createSlice({
  name: "friend",
  initialState: {
    friendRequests: [],
    friends: [],
    sentRequests: [],
    friendsOnline: [], // ✅ array रखो online दोस्तों की
  },
  reducers: {
    setFriendRequests: (state, action) => {
      state.friendRequests = action.payload;
    },

    setFriends: (state, action) => {
      state.friends = action.payload;
    },

    setFriendsOnline: (state, action) => {
      state.friendsOnline = action.payload;
    },

    removeFriendRequest: (state, action) => {
      state.friendRequests = state.friendRequests.filter(
        (user) => user._id !== action.payload
      );
    },

    acceptFriendRequest: (state, action) => {
      const acceptedUser = state.friendRequests.find(
        (user) => user._id === action.payload
      );
      if (acceptedUser) {
        state.friends.push(acceptedUser);
        state.friendRequests = state.friendRequests.filter(
          (user) => user._id !== action.payload
        );
      }
    },

    removeFriend: (state, action) => {
      state.friends = state.friends.filter(
        (user) => user._id !== action.payload
      );
    },

    setSentRequests: (state, action) => {
      state.sentRequests = action.payload;
    },

    removeSentRequest: (state, action) => {
      state.sentRequests = state.sentRequests.filter(
        (id) => id !== action.payload
      );
    },

    addSentRequest: (state, action) => {
      if (!state.sentRequests.includes(action.payload)) {
        state.sentRequests.push(action.payload);
      }
    },
  },
});

export const {
  setFriendRequests,
  setFriends,
  setFriendsOnline, // ✅ Export the action
  removeFriendRequest,
  acceptFriendRequest,
  removeFriend,
  setSentRequests,
  removeSentRequest,
  addSentRequest,
} = friendSlice.actions;

export default friendSlice.reducer;
