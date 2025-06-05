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
    updateMessageSeenStatus: (state, action) => {
      const { messageId } = action.payload;
      state.messages = state.messages.map(msg =>
        msg._id === messageId ? { ...msg, isSeen: true } : msg
      );
    },
    addNewMessage: (state, action) => {
      state.messages = [...state.messages, action.payload];
    },

    clearMessagesForUser: (state, action) => {
      const userIdToClear = action.payload;
      if (state.messages) {
        state.messages = state.messages.filter(
          (msg) => msg.senderId !== userIdToClear && msg.receiverId !== userIdToClear
        );
      }
    },

  },
});

export const { setMessages, clearMessagesForUser, updateMessageSeenStatus, addNewMessage } = messageSlice.actions;
export default messageSlice.reducer;
