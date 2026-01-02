import { useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../utils/api";

const CreateTask = () => {
  const { projectId } = useParams();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const submitTask = async (e) => {
    e.preventDefault();

    try {
      await api.post(`/projects/${projectId}/tasks`, {
        title
      });
      setMessage("Task created successfully");
      setTitle("");
    } catch (err) {
      setMessage("Failed to create task");
    }
  };

  return (
    <div>
      <h3>Create Task</h3>

      {message && <p>{message}</p>}

      <form onSubmit={submitTask}>
        <input
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <button>Create</button>
      </form>
    </div>
  );
};

export default CreateTask;
