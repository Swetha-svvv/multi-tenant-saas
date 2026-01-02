import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../utils/api";
import { getUser } from "../../../utils/auth";

const TenantDetails = () => {
  const { tenantId } = useParams();
  const navigate = useNavigate();
  const currentUser = getUser();

  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔒 Only super admin allowed
  useEffect(() => {
    if (!currentUser || currentUser.role !== "super_admin") {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    fetchTenantDetails();
  }, []);

  const fetchTenantDetails = async () => {
    try {
      const res = await api.get(`/tenants/${tenantId}`);
      setTenant(res.data.data);
    } catch (err) {
      alert("Failed to load tenant details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading tenant...</p>;
  if (!tenant) return <p>Tenant not found</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Tenant Details</h2>

      <p><b>Name:</b> {tenant.name}</p>
      <p><b>Subdomain:</b> {tenant.subdomain}</p>
      <p><b>Status:</b> {tenant.status}</p>
      <p><b>Plan:</b> {tenant.subscriptionPlan}</p>
      <p><b>Max Users:</b> {tenant.maxUsers}</p>
      <p><b>Max Projects:</b> {tenant.maxProjects}</p>

      <h3>Statistics</h3>
      <ul>
        <li>Total Users: {tenant.stats.totalUsers}</li>
        <li>Total Projects: {tenant.stats.totalProjects}</li>
        <li>Total Tasks: {tenant.stats.totalTasks}</li>
      </ul>

      <button onClick={() => navigate("/tenants")}>
        Back
      </button>
    </div>
  );
};

export default TenantDetails;
