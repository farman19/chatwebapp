// userSlice.js
import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    authUser: null,
    otherUsers: null,
    selectedUser: null,
    onlineUsers: null,
    chatUsers: null,

  },
  reducers: {
    setAuthUser: (state, action) => {
      state.authUser = action.payload;
      // console.log("Auth User in userslice====:", state.authUser);
    },
    setOtherUsers: (state, action) => {
      state.otherUsers = action.payload;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
      // console.log("Online Users:", state.onlineUsers); 
    },

    setChatUsers: (state, action) => {
      state.chatUsers = action.payload;
    },

    resetUserState: (state) => {
      state.authUser = null;
      state.otherUsers = null;
      state.selectedUser = null;
     
      state.onlineUsers = null;

    },
  },
});

export const {
  setAuthUser,
  setOtherUsers,
  setSelectedUser,
  setOnlineUsers,
  setChatUsers, 
  resetUserState,

} = userSlice.actions;

export default userSlice.reducer;
