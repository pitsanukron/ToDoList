import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Folder } from 'lucide-react';
import type { Project } from '../types';

const API_URL = 'http://localhost:5000/api/projects';

interface Props {
  onSelectProject: (project: Project) => void;
}

const ProjectSelector: React.FC<Props> = ({ onSelectProject }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [newProjectName, setNewProjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(API_URL);
      setProjects(response.data);
    } catch (err) {
      console.error('Failed to fetch projects', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    setIsCreating(true);
    try {
      const response = await axios.post(API_URL, { name: newProjectName });
      setProjects([response.data, ...projects]);
      setNewProjectName('');
      onSelectProject(response.data);
    } catch (err) {
      console.error('Failed to create project', err);
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12 text-gray-400">Loading projects...</div>;
  }

  return (
    <div className="max-w-xl mx-auto mt-20 p-6">
      <h1 className="text-2xl font-semibold mb-6">Select or Create Project</h1>
      
      <form onSubmit={handleCreateProject} className="mb-8 relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Plus size={16} className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
        </div>
        <input
          type="text"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          placeholder="New project name..."
          className="block w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-shadow shadow-sm"
          disabled={isCreating}
        />
        {newProjectName.trim() && (
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
            <button
              type="submit"
              disabled={isCreating}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2.5 py-1 rounded transition-colors font-medium"
            >
              Create
            </button>
          </div>
        )}
      </form>

      <div className="space-y-2">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Your Projects</h2>
        {projects.length === 0 ? (
          <div className="text-sm text-gray-500 p-4 border border-dashed border-gray-200 rounded-md text-center">
            No projects found. Create one above.
          </div>
        ) : (
          projects.map(project => (
            <button
              key={project.id}
              onClick={() => onSelectProject(project)}
              className="w-full flex items-center gap-3 p-3 text-left bg-white border border-gray-100 rounded-md hover:border-gray-300 hover:shadow-sm transition-all group"
            >
              <div className="w-8 h-8 rounded bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                <Folder size={16} className="text-gray-400 group-hover:text-blue-500" />
              </div>
              <span className="font-medium text-gray-700">{project.name}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default ProjectSelector;
