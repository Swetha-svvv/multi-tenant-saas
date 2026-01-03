import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../utils/api";

const ProjectDetails = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    api.get(`/projects/${projectId}`).then(res => {
      setProject(res.data.data);
    });

    api.get(`/projects/${projectId}/tasks`).then(res => {
      setTasks(res.data.data.tasks);
    });
  }, [projectId]);

  if (!project) return <p>Loading...</p>;

  return (
    <div>
      <h2>{project.name}</h2>
      <p>{project.description}</p>

      <h3>Tasks</h3>
      {tasks.length === 0 && <p>No tasks</p>}

      <ul>
        {tasks.map(t => (
          <li key={t.id}>
            {t.title} – {t.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectDetails;
