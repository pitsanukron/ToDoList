import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import type { Project, Task, TaskStatus, Priority } from '../types';
import TaskCard from './TaskCard';
import TaskDetailModal from './TaskDetailModal';

const API_URL = 'http://localhost:5000/api/tasks';
const COLUMNS: TaskStatus[] = ['Backlog', 'Todo', 'In progress', 'Completed'];

interface Props {
  project: Project;
}

const KanbanBoard: React.FC<Props> = ({ project }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Project Edit State
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [projectName, setProjectName] = useState(project.name);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', due_date: '', priority: 'Medium' as Priority });
  
  // Detail Modal state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    fetchTasks();
    setProjectName(project.name);
  }, [project.id]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}?projectId=${project.id}`);
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProjectName = async () => {
    if (!projectName.trim() || projectName === project.name) {
      setIsEditingProject(false);
      setProjectName(project.name);
      return;
    }
    try {
      await axios.put(`http://localhost:5000/api/projects/${project.id}`, { name: projectName });
      project.name = projectName; // Update local reference
    } catch (error) {
      console.error('Failed to update project name', error);
      setProjectName(project.name);
    } finally {
      setIsEditingProject(false);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const taskId = parseInt(draggableId);
    const newStatus = destination.droppableId as TaskStatus;

    // Optimistic UI update
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: newStatus } : t
    ));

    try {
      await axios.put(`${API_URL}/${taskId}`, { status: newStatus });
    } catch (error) {
      console.error('Failed to update status', error);
      fetchTasks(); // Revert on failure
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title || !newTask.due_date || !newTask.priority) return;

    try {
      const response = await axios.post(API_URL, {
        title: newTask.title,
        description: newTask.description,
        project_id: project.id,
        due_date: newTask.due_date,
        priority: newTask.priority,
        status: 'Backlog'
      });
      setTasks([response.data, ...tasks]);
      setNewTask({ title: '', description: '', due_date: '', priority: 'Medium' });
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create task', error);
    }
  };

  const handleDeleteTask = async (id: number) => {
    // Optimistic delete
    setTasks(prev => prev.filter(t => t.id !== id));
    try {
      await axios.delete(`${API_URL}/${id}`);
      if (selectedTask?.id === id) setSelectedTask(null);
    } catch (error) {
      console.error('Failed to delete task', error);
      fetchTasks();
    }
  };

  const handleUpdateTask = async (id: number, updates: Partial<Task>) => {
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    if (selectedTask?.id === id) {
      setSelectedTask({ ...selectedTask, ...updates } as Task);
    }
    
    try {
      await axios.put(`${API_URL}/${id}`, updates);
    } catch (error) {
      console.error('Failed to update task', error);
      fetchTasks(); // Revert on failure
    }
  };

  const tasksByStatus = COLUMNS.reduce((acc, status) => {
    acc[status] = tasks.filter(t => t.status === status);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  if (loading) {
    return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-blue-600"></div></div>;
  }

  return (
    <div className="h-[calc(100vh-60px)] flex flex-col">
      <div className="px-4 md:px-6 py-4 flex items-center justify-between border-b border-gray-200 bg-white flex-shrink-0">
        <div className="flex-1 flex items-center gap-2">
          {isEditingProject ? (
            <input 
              type="text"
              autoFocus
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onBlur={handleUpdateProjectName}
              onKeyDown={(e) => e.key === 'Enter' && handleUpdateProjectName()}
              className="text-xl font-semibold text-gray-800 border-b border-blue-500 outline-none bg-transparent px-1"
            />
          ) : (
            <h2 
              onClick={() => setIsEditingProject(true)}
              className="text-xl font-semibold text-gray-800 cursor-pointer hover:bg-gray-100 px-1 rounded transition-colors group flex items-center gap-2"
              title="Click to edit project name"
            >
              {project.name}
              <span className="text-gray-400 opacity-0 group-hover:opacity-100">✎</span>
            </h2>
          )}
        </div>
        
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap"
        >
          <Plus size={16} />
          New Issue
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 border-b border-gray-200 p-6 flex-shrink-0">
          <form onSubmit={handleCreateTask} className="flex flex-col gap-3 max-w-4xl">
            <div className="flex flex-col md:flex-row md:gap-4 md:items-end gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">Issue Title</label>
                <input 
                  type="text" 
                  required
                  value={newTask.title}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                  placeholder="What needs to be done?"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div className="w-full md:w-1/3">
                <label className="block text-xs font-medium text-gray-700 mb-1">Due Date</label>
                <input 
                  type="date" 
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={newTask.due_date}
                  onChange={e => setNewTask({...newTask, due_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:gap-4 md:items-end gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">Description (Optional)</label>
                <input 
                  type="text" 
                  value={newTask.description}
                  onChange={e => setNewTask({...newTask, description: e.target.value})}
                  placeholder="Add more details..."
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div className="w-full md:w-1/3">
                <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                <select 
                  value={newTask.priority}
                  onChange={e => setNewTask({...newTask, priority: e.target.value as Priority})}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="Urgent">Urgent</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                  <option value="None">None</option>
                </select>
              </div>
              <button type="submit" className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded text-sm font-medium transition-colors h-[38px] w-full md:w-auto mt-2 md:mt-0">
                Add
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex-1 overflow-x-auto overflow-y-hidden bg-gray-50 p-6">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-6 h-full items-start">
            {COLUMNS.map(status => (
              <div key={status} className="w-[300px] flex-shrink-0 flex flex-col h-full">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    {status}
                    <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full font-normal">
                      {tasksByStatus[status].length}
                    </span>
                  </h3>
                </div>
                
                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 overflow-y-auto rounded-md min-h-[150px] transition-colors p-1 ${snapshot.isDraggingOver ? 'bg-gray-100' : ''}`}
                    >
                      {tasksByStatus[status].map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                          {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{ ...provided.draggableProps.style }}
                                className={snapshot.isDragging ? 'z-50 opacity-90' : ''}
                              >
                                <TaskCard 
                                  task={task} 
                                  onDelete={handleDeleteTask} 
                                  onClick={() => setSelectedTask(task)}
                                />
                              </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

      {selectedTask && (
        <TaskDetailModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)} 
          onUpdate={handleUpdateTask}
        />
      )}
    </div>
  );
};

export default KanbanBoard;
