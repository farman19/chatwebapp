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

  let changed = false;

  const newMessages = state.messages.map(msg => {
    if (msg._id === messageId && !msg.isSeen) {
      changed = true;
      return { ...msg, isSeen: true };
    }
    return msg;
  });

  if (changed) {
    state.messages = newMessages;
  }
  // अगर कोई बदलाव नहीं हुआ, तो state वैसे का वैसा रहेगा और Redux कोई re-render नहीं करेगा
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
