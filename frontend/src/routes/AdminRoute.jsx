// routes/AdminRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { getUser } from "../utils/auth";

const AdminRoute = ({ children }) => {
  const user = getUser();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== "tenant_admin") {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default AdminRoute;
