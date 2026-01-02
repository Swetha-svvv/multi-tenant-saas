/*
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../utils/api";

const TaskList = () => {
  const { projectId } = useParams();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    api.get(`/projects/${projectId}/tasks`)
      .then(res => setTasks(res.data.data.tasks));
  }, [projectId]);

  return (
    <div>
      <h3>Tasks</h3>

      {tasks.length === 0 && <p>No tasks found</p>}

      <ul>
        {tasks.map(task => (
          <li key={task.id}>
            <b>{task.title}</b> – {task.status} – {task.priority}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;
*/
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../utils/api";

const TaskList = () => {
  const { projectId } = useParams();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    api.get(`/projects/${projectId}/tasks`)
      .then(res => setTasks(res.data.data.tasks))
      .catch(err => console.error(err));
  }, [projectId]);

  return (
    <div>
      <h2>Tasks</h2>
      {tasks.length === 0 && <p>No tasks found</p>}
      <ul>
        {tasks.map(t => (
          <li key={t.id}>{t.title} – {t.status}</li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;
