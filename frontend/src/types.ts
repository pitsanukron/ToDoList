export interface Project {
  id: number;
  name: string;
  created_at: string;
}

export type Priority = 'Urgent' | 'High' | 'Medium' | 'Low' | 'None';
export type TaskStatus = 'Backlog' | 'Todo' | 'In progress' | 'Completed';

export interface Task {
  id: number;
  project_id: number;
  title: string;
  description?: string;
  due_date: string;
  priority: Priority;
  status: TaskStatus;
  created_at: string;
}
