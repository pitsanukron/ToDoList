import React, { useState } from 'react';
import { format } from 'date-fns';
import { X, Calendar, Flag, AlignLeft, Pencil, Check } from 'lucide-react';
import type { Task, Priority } from '../types';

interface Props {
  task: Task;
  onClose: () => void;
  onUpdate: (id: number, updates: Partial<Task>) => void;
}

const priorityColors = {
  Urgent: 'text-red-600 bg-red-50 border-red-200',
  High: 'text-orange-600 bg-orange-50 border-orange-200',
  Medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  Low: 'text-blue-600 bg-blue-50 border-blue-200',
  None: 'text-gray-500 bg-gray-50 border-gray-200'
};

const TaskDetailModal: React.FC<Props> = ({ task, onClose, onUpdate }) => {
  const isOverdue = new Date(task.due_date).setHours(0,0,0,0) < new Date().setHours(0,0,0,0);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState({
    title: task.title,
    description: task.description || '',
    due_date: task.due_date,
    priority: task.priority
  });

  const handleSave = () => {
    onUpdate(task.id, editedTask);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
              {task.status}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <button 
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium"
              >
                <Check size={14} />
                Save
              </button>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition-colors text-sm font-medium border border-gray-200"
              >
                <Pencil size={14} />
                Edit
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto">
          {isEditing ? (
            <div className="mb-6">
              <label className="block text-xs font-medium text-gray-700 mb-1">Issue Title</label>
              <input 
                type="text" 
                value={editedTask.title}
                onChange={e => setEditedTask({...editedTask, title: e.target.value})}
                className="w-full text-xl font-semibold text-gray-900 border border-gray-300 rounded px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          ) : (
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">{task.title}</h2>
          )}
          
          <div className="flex flex-wrap gap-4 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                <Flag size={14} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Priority</p>
                {isEditing ? (
                  <select 
                    value={editedTask.priority}
                    onChange={e => setEditedTask({...editedTask, priority: e.target.value as Priority})}
                    className="mt-0.5 text-xs font-semibold px-2 py-1 rounded border border-gray-300 outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                    <option value="None">None</option>
                  </select>
                ) : (
                  <div className={`mt-0.5 text-xs font-semibold px-2 py-0.5 rounded border inline-block ${priorityColors[task.priority]}`}>
                    {task.priority}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                <Calendar size={14} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Due Date</p>
                {isEditing ? (
                  <input 
                    type="date" 
                    value={editedTask.due_date}
                    onChange={e => setEditedTask({...editedTask, due_date: e.target.value})}
                    className="mt-0.5 text-sm font-medium border border-gray-300 rounded px-2 py-0.5 outline-none focus:ring-1 focus:ring-blue-500"
                  />
                ) : (
                  <p className={`mt-0.5 text-sm font-medium ${isOverdue && task.status !== 'Completed' ? 'text-red-600' : 'text-gray-900'}`}>
                    {format(new Date(task.due_date), 'MMMM d, yyyy')}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlignLeft size={16} className="text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900">Description</h3>
            </div>
            {isEditing ? (
              <textarea 
                value={editedTask.description}
                onChange={e => setEditedTask({...editedTask, description: e.target.value})}
                placeholder="Add more details..."
                className="w-full text-sm text-gray-700 bg-white p-4 rounded-md border border-gray-300 min-h-[120px] outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-y"
              />
            ) : task.description ? (
              <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-md border border-gray-100 min-h-[100px]">
                {task.description}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic bg-gray-50 p-4 rounded-md border border-gray-100 border-dashed">
                No description provided.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
