import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

import SuperAdminDashboard from "./pages/Dashboard/SuperAdminDashboard";
import TenantAdminDashboard from "./pages/Dashboard/TenantAdminDashboard";
import UserDashboard from "./pages/Dashboard/UserDashboard";

import ProjectList from "./pages/Projects/ProjectList";
import ProjectDetails from "./pages/Projects/ProjectDetails";

import TaskList from "./pages/Tasks/TaskList";
import CreateTask from "./pages/Tasks/CreateTask";

import ProtectedRoute from "./routes/ProtectedRoute";
import Users from "./pages/Users/Users";

/*import AdminRoute from "./routes/AdminRoute";
import SuperAdminRoute from "./routes/SuperAdminRoute";
*/
import { getUser } from "./utils/auth";

function DashboardRouter() {
  const user = getUser();

  if (!user) return <Navigate to="/login" />;

  if (user.role === "super_admin") return <SuperAdminDashboard />;
  if (user.role === "tenant_admin") return <TenantAdminDashboard />;
  return <UserDashboard />;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* ---------- PUBLIC ---------- */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ---------- DASHBOARD ---------- */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardRouter />
            </ProtectedRoute>
          }
        />

        {/* ---------- PROJECTS ---------- */}
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <ProjectList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects/:projectId"
          element={
            <ProtectedRoute>
              <ProjectDetails />
            </ProtectedRoute>
          }
        />

        {/* ---------- TASKS ---------- */}
        <Route
          path="/projects/:projectId/tasks"
          element={
            <ProtectedRoute>
              <TaskList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects/:projectId/tasks/create"
          element={
            <ProtectedRoute>
              <CreateTask />
            </ProtectedRoute>
          }
        />
        <Route
  path="/users"
  element={
    <ProtectedRoute>
      <Users />
    </ProtectedRoute>
  }

/>


        {/* ---------- FALLBACK ---------- */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
