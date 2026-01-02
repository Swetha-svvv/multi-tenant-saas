import api from "../../utils/api";
import { useEffect, useState } from "react";

const SuperAdminDashboard = () => {
  const [tenants, setTenants] = useState([]);

  useEffect(() => {
    api.get("/tenants").then(res => {
      setTenants(res.data.data.tenants);
    });
  }, []);

  return (
    <div>
      <h2>Super Admin Dashboard</h2>

      <h4>Tenants</h4>
      <ul>
        {tenants.map(t => (
          <li key={t.id}>
            {t.name} ({t.subdomain})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SuperAdminDashboard;
