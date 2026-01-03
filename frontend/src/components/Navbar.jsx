import { Link, useNavigate } from "react-router-dom";
import { getUser, logout } from "../utils/auth";

const Navbar = () => {
  const user = getUser();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
      <strong>Multi-Tenant SaaS</strong>

      <span style={{ marginLeft: "20px" }}>
        <Link to="/dashboard">Dashboard</Link>{" | "}
        <Link to="/projects">Projects</Link>{" | "}

        {user.role !== "user" && <Link to="/tasks">Tasks | </Link>}
        {user.role === "tenant_admin" && <Link to="/users">Users | </Link>}
        {user.role === "super_admin" && <Link to="/tenants">Tenants | </Link>}
      </span>

      <span style={{ float: "right" }}>
        {user.fullName} ({user.role}){" "}
        <button onClick={handleLogout}>Logout</button>
      </span>
    </nav>
  );
};

export default Navbar;
