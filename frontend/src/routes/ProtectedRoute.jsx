import { Navigate } from "react-router-dom";
import { getToken, logout } from "../utils/auth";

const ProtectedRoute = ({ children }) => {
  const token = getToken();

  if (!token) {
    logout();
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
