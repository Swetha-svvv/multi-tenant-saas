// routes/SuperAdminRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { getUser } from "../utils/auth";

const SuperAdminRoute = ({ children }) => {
  const user = getUser();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== "super_admin") {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default SuperAdminRoute;
