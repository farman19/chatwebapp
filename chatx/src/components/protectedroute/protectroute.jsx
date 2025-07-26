// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Loader from "../loadings";   // अपना spinner / skeleton component
import { store } from "../../redux/store";

const ProtectedRoute = ({ children }) => {
 const {authUser} = useSelector(store=> store.user) 
 const {socket}= useSelector(store=> store.socket) // slice के हिसाब से path adjust करें

  /* 1️⃣ यूज़र लॉग‑इन नहीं है → LoginPage भेजो */
  if (!authUser) {
    return <Navigate to="/loginpage" replace />;
  }

  /* 2️⃣ लॉग‑इन है, पर socket अभी null या disconnected है → Loader दिखाओ */
  if (!socket || !socket.connected) {
    return <Loader text="Connecting to chat…" />;
  }

  /* 3️⃣ दोनों ready हैं → असली पेज रेंडर करो */
  return children;
};

export default ProtectedRoute;
