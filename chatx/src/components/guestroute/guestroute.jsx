// src/components/GuestRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const GuestRoute = ({ children }) => {
const authUser = useSelector(store => store.user.authUser);


  // अगर पहले से लॉगिन है तो ChatPage ("/") पर रिडायरेक्ट कर दो
  if (authUser) {
    return <Navigate to="/" replace />;
  }
  // वरना चाइल्ड कंपोनेंट (LoginPage या RegisterPage) रेंडर करो
  return children;
};

export default GuestRoute;
