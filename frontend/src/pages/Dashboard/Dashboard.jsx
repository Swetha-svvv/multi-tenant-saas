import { getUser } from "../../utils/auth";
import SuperAdminDashboard from "./SuperAdminDashboard";
import TenantAdminDashboard from "./TenantAdminDashboard";
import UserDashboard from "./UserDashboard";

const Dashboard = () => {
  const user = getUser();

  if (!user) return null;

  if (user.role === "super_admin") return <SuperAdminDashboard />;
  if (user.role === "tenant_admin") return <TenantAdminDashboard />;
  return <UserDashboard />;
};

export default Dashboard;
