import { combineReducers, configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice.js";
import messageReducer from "./messageSlice.js";
import socketReducer from "./socketSlice.js";
import friendReducer from "./friendSlice.js";

import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

// 🔒 redux-persist config
const persistConfig = {
  key: "root",
  version: 1,
  storage,
  blacklist: ["socket"], // ⛔ socket को persist मत करो
};

// 🧠 combine reducers
const rootReducer = combineReducers({
  user: userReducer,
  message: messageReducer,
  socket: socketReducer,
  friend: friendReducer,
});

// 🧠 persist wrapper
const persistedReducer = persistReducer(persistConfig, rootReducer);

// ✅ configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
          "socket/setSocket",
        ],
        ignoredPaths: ["socket.socket"],
      },
    }),
});

// ✅ export persistor
export const persistor = persistStore(store);
