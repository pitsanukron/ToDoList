import React from 'react';
import { format } from 'date-fns';
import { Calendar, Trash2 } from 'lucide-react';
import type { Task } from '../types';

interface Props {
  task: Task;
  onDelete: (id: number) => void;
  onClick: () => void;
}

const priorityColors = {
  Urgent: 'text-red-600 bg-red-50 border-red-200',
  High: 'text-orange-600 bg-orange-50 border-orange-200',
  Medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  Low: 'text-blue-600 bg-blue-50 border-blue-200',
  None: 'text-gray-500 bg-gray-50 border-gray-200'
};

const TaskCard: React.FC<Props> = ({ task, onDelete, onClick }) => {
  const isOverdue = new Date(task.due_date).setHours(0,0,0,0) < new Date().setHours(0,0,0,0);

  return (
    <div 
      onClick={onClick}
      className="group bg-white p-3 rounded-md border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all cursor-pointer mb-2 relative"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="pr-6">
          <h3 className="text-sm font-medium text-gray-800 break-words">{task.title}</h3>
          {task.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
          )}
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
          className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-all"
          title="Delete task"
        >
          <Trash2 size={14} />
        </button>
      </div>
      
      <div className="flex items-center justify-between mt-3">
        <div className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${priorityColors[task.priority]}`}>
          {task.priority}
        </div>
        
        <div className={`flex items-center gap-1 text-[11px] ${isOverdue && task.status !== 'Completed' ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
          <Calendar size={12} />
          <span>{format(new Date(task.due_date), 'MMM d, yyyy')}</span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
