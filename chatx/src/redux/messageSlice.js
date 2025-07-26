// messageSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
   messagesByUser: {},
    unseenCountByUser: {}, 
  };

const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    resetMessages: () => initialState,

    setMessages: (state, { payload: { userId, messages } }) => {
      state.messagesByUser[String(userId)] = messages || [];
    },

   addMultipleMessages: (state, { payload: { userId, messages } }) => {
  const key = String(userId);
  if (!Array.isArray(messages)) return;

  if (!state.messagesByUser[key]) state.messagesByUser[key] = [];

  const existingIds = new Set(
    state.messagesByUser[key].map((m) => String(m._id))
  );
  const uniqueMessages = messages.filter((m) => !existingIds.has(String(m._id)));

  state.messagesByUser[key].push(...uniqueMessages);

  // ✅ Unseen count update करें (सिर्फ unSeen वाले messages के लिए)
  const unseenCount = uniqueMessages.filter((msg) => !msg.isSeen).length;
  if (unseenCount > 0) {
    state.unseenCountByUser[key] =
      (state.unseenCountByUser[key] || 0) + unseenCount;
  }
},


   addNewMessage: (state, { payload }) => {
  const { message, authUserId } = payload || {};
  if (!message || !authUserId) return;

  const key =
    String(message.senderId) === String(authUserId)
      ? String(message.receiverId)
      : String(message.senderId);

  if (!state.messagesByUser[key]) state.messagesByUser[key] = [];
  if (!state.unseenCountByUser) state.unseenCountByUser = {};
  if (!state.unseenCountByUser[key]) state.unseenCountByUser[key] = 0;

  const exists = state.messagesByUser[key].some(
    (m) => String(m._id) === String(message._id)
  );

  if (!exists) {
    state.messagesByUser[key].push(message);

    if (String(message.senderId) !== String(authUserId)) {
      state.unseenCountByUser[key] += 1;
    }
  }
},

  markManySeen: (state, { payload: { userId, ids } }) => {
  const key = String(userId);
  if (!state.messagesByUser[key]) return;

  const idSet = new Set(ids.map(String));
  state.messagesByUser[key].forEach((m) => {
    if (idSet.has(String(m._id))) {
      m.isSeen = true;
    }
  });
},

  updateMessageSeenStatus: (state, { payload: { userId, messageId, seenTime } }) => {
  const key = String(userId);
  if (!state.messagesByUser[key]) state.messagesByUser[key] = [];

  const msg = state.messagesByUser[key].find(
    (m) => String(m._id) === String(messageId)
  );

  if (msg) {
    msg.isSeen = true;
    if (seenTime) msg.seenTime = seenTime;
  }
},

    clearMessagesForUser: (state, { payload: userId }) => {
      delete state.messagesByUser[String(userId)];
    },
  },
});

export const {
  setMessages,
  addMultipleMessages,
  addNewMessage,
  markManySeen,
  updateMessageSeenStatus,
  clearMessagesForUser,
  resetMessages,
} = messageSlice.actions;

export default messageSlice.reducer;
