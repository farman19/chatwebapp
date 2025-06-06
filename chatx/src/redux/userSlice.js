// userSlice.js
import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    authUser: null,
    otherUsers: null,
    selectedUser: null,
    onlineUsers: null,
   
  },
  reducers: {
    setAuthUser: (state, action) => {
      state.authUser = action.payload;
      // console.log("Auth User:", state.authUser);
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
  resetUserState,
 
} = userSlice.actions;

export default userSlice.reducer;
