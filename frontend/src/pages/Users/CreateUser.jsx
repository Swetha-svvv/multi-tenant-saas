import { useState } from "react";
import api from "../utils/api";
import { getUser } from "../utils/auth";
import { useNavigate } from "react-router-dom";

const CreateUser = () => {
  const navigate = useNavigate();
  const currentUser = getUser();

  const [form, setForm] = useState({
    email: "",
    fullName: "",
    password: "",
    role: "user"
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post(
        `/tenants/${currentUser.tenantId}/users`,
        form
      );
      alert("User created");
      navigate("/users");
    } catch (err) {
      alert("Failed to create user");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Create User</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />

        <input
          name="fullName"
          placeholder="Full Name"
          onChange={handleChange}
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />

        <select name="role" onChange={handleChange}>
          <option value="user">User</option>
          <option value="tenant_admin">Tenant Admin</option>
        </select>

        <button type="submit">Create</button>
      </form>
    </div>
  );
};

export default CreateUser;
