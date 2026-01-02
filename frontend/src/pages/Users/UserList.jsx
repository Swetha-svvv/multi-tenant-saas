import { useEffect, useState } from "react";
import api from "../utils/api";
import { getUser } from "../utils/auth";
import { Link } from "react-router-dom";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const currentUser = getUser();

  const loadUsers = async () => {
    try {
      const res = await api.get(
        `/tenants/${currentUser.tenantId}/users`
      );
      setUsers(res.data.data.users);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    await api.delete(`/users/${id}`);
    loadUsers();
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Users</h2>

      <Link to="/users/create">
        <button>Add User</button>
      </Link>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.fullName}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.isActive ? "Active" : "Inactive"}</td>
              <td>
                <button onClick={() => deleteUser(u.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
