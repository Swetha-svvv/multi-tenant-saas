import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/projects").then(res => {
      setProjects(res.data.data.projects);
    });
  }, []);

  return (
    <div>
      <h2>Projects</h2>

      {projects.length === 0 && <p>No projects found</p>}

      <ul>
        {projects.map(p => (
          <li key={p.id}>
            <strong>{p.name}</strong> – {p.status}
            <button onClick={() => navigate(`/projects/${p.id}`)}>
              View
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectList;
