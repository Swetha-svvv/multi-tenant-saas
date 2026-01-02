import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../utils/api";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    tenantName: "",
    subdomain: "",
    adminEmail: "",
    adminFullName: "",
    adminPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.adminPassword !== form.confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      setLoading(true);
      await api.post("/auth/register-tenant", form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Register Tenant</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input name="tenantName" placeholder="Organization Name" onChange={handleChange} required />
        <input name="subdomain" placeholder="Subdomain" onChange={handleChange} required />
        <input name="adminEmail" placeholder="Admin Email" onChange={handleChange} required />
        <input name="adminFullName" placeholder="Admin Name" onChange={handleChange} required />
        <input name="adminPassword" type="password" placeholder="Password" onChange={handleChange} required />
        <input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} required />

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      <p>
        Already registered? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default Register;
