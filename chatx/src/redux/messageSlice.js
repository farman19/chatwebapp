import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messagesByUser: {},
};

const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    resetMessages: () => initialState,

    // ✅ Completely replace messages for a user
    setMessages: (state, action) => {
      const { userId, messages } = action.payload;
      state.messagesByUser[userId] = messages || [];
    },

    // ✅ Add new messages uniquely (doesn't remove old ones)
    addMultipleMessages: (state, action) => {
      const { userId, messages } = action.payload;
      if (!Array.isArray(messages)) return;

      if (!state.messagesByUser[userId]) {
        state.messagesByUser[userId] = [];
      }

      const existingIds = new Set(state.messagesByUser[userId].map(msg => msg._id));
      const newUniqueMessages = messages.filter(msg => !existingIds.has(msg._id));

      state.messagesByUser[userId] = [...state.messagesByUser[userId], ...newUniqueMessages];
    },

    // ✅ Add single message
    addNewMessage: (state, action) => {
      const { message, authUserId } = action.payload || {};

      if (
        !message ||
        !authUserId ||
        !message.senderId ||
        !message.receiverId
      ) {
        console.warn("❌ Invalid payload to addNewMessage", action.payload);
        return;
      }

      const userId =
        message.senderId === authUserId ? message.receiverId : message.senderId;

      if (!state.messagesByUser[userId]) {
        state.messagesByUser[userId] = [];
      }

      // Prevent duplicate
      const alreadyExists = state.messagesByUser[userId].some(msg => msg._id === message._id);
      if (!alreadyExists) {
        state.messagesByUser[userId].push(message);
      }
    },

    // ✅ Update seen status
    updateMessageSeenStatus: (state, action) => {
      const { messageId } = action.payload;

      for (const userId in state.messagesByUser) {
        const index = state.messagesByUser[userId].findIndex(
          (msg) => msg._id === messageId
        );
        if (index !== -1) {
          state.messagesByUser[userId][index].isSeen = true;
          break;
        }
      }
    },

    // ✅ Clear messages for specific user
    clearMessagesForUser: (state, action) => {
      const userId = action.payload;
      delete state.messagesByUser[userId];
    },
  },
});

export const {
  setMessages,
  addMultipleMessages,
  addNewMessage,
  clearMessagesForUser,
  updateMessageSeenStatus,
  resetMessages,
} = messageSlice.actions;

export default messageSlice.reducer;
