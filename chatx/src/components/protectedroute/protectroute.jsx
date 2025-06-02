// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthUser } from "../hooks/useAuthUser";

const ProtectedRoute = ({ children }) => {
  const authUser = useAuthUser();

  // अगर लॉगिन नहीं है तो LoginPage पर चले जाओ
  if (!authUser) {
    return <Navigate to="/loginpage" replace />;
  }
  // वरना चाइल्ड कंपोनेंट (ChatPage) रेंडर करो
  return children;
};

export default ProtectedRoute;
