import api from "../../utils/api";
import { useEffect, useState } from "react";

const TenantAdminDashboard = () => {
  const [projects, setProjects] = useState([]);
   useEffect(() => {
  api.get("/projects")
    .then(res => {
      setProjects(res.data.data.projects); // ✅ FIX
    })
    .catch(err => {
      console.error("Projects error:", err);
    });
}, []);
 /* useEffect(() => {
    api.get("/projects")
      .then(res => {
        setProjects(Array.isArray(res.data.projects) ? res.data.projects : []);
      })
      .catch(err => {
        console.error("Projects error:", err);
        setProjects([]);
      });
  }, []); */

  return (
    <div>
      <h2>Tenant Admin Dashboard</h2>

      <h4>Projects</h4>

      {projects.length === 0 ? (
        <p>No projects found</p>
      ) : (
        <ul>
          {projects.map(p => (
            <li key={p.id}>{p.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TenantAdminDashboard;
