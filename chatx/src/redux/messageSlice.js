import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({
  name: "message",
  initialState: {
    messages: [],
  },
  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload || [];
    },
     addNewMessage: (state, action) => {
      state.messages = [...state.messages, action.payload];
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    clearMessagesForUser: (state, action) => {
      const userIdToClear = action.payload; // the userId you want to clear messages for
      if (state.messages) {
        state.messages = state.messages.filter(
          (msg) => msg.senderId !== userIdToClear && msg.receiverId !== userIdToClear
        );
      }
    },
   
  },
});

export const { setMessages, clearMessages, clearMessagesForUser, addNewMessage } = messageSlice.actions;
export default messageSlice.reducer;
