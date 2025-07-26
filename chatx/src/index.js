// src/index.js  (React 18+)

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import { Provider } from "react-redux";
import { store, persistor } from "./redux/store";  
    // ⬅️  named imports ✔️

import { PersistGate } from "redux-persist/integration/react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Loading from "./components/loadings";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={<Loading />} persistor={persistor}>
        <App />
        <ToastContainer />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
