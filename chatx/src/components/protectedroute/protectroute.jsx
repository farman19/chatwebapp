// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children }) => {
  const authUser = useSelector(store => store.user.authUser);

  if (!authUser) {
    return <Navigate to="/loginpage" replace />;
  }

  return children;
};

export default ProtectedRoute;
