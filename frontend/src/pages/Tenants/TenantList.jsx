import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../utils/api";
import { getUser } from "../../../utils/auth";

const TenantList = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const currentUser = getUser();

  // Only super admin allowed
  useEffect(() => {
    if (!currentUser || currentUser.role !== "super_admin") {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const res = await api.get("/tenants");
      setTenants(res.data.data.tenants);
    } catch (err) {
      alert("Failed to load tenants");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading tenants...</p>;

  return (
    <div>
      <h2>Tenants</h2>

      {tenants.length === 0 ? (
        <p>No tenants found</p>
      ) : (
        <ul>
          {tenants.map((tenant) => (
            <li
              key={tenant.id}
              style={{ cursor: "pointer", marginBottom: "10px" }}
              onClick={() => navigate(`/tenants/${tenant.id}`)}
            >
              <strong>{tenant.name}</strong> — {tenant.subdomain}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TenantList;
