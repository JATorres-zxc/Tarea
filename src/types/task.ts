export type Priority = 'low' | 'medium' | 'high';
export type Status = 'todo' | 'progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  dueDate?: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  comments: Comment[];
  pomodoroCount?: number;
  position?: number; 
  recurring?: {
    interval: string;
    lastCreated: Date;
  };
}

export interface Comment {
  id: string;
  content: string;
  timestamp: Date;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface RecurringConfig {
  interval: 'daily' | 'weekly' | 'monthly' | 'custom';
  customDays?: number;
  lastCreated: Date;
}

export interface Filter {
  search: string;
  tags: string[];
  status: Status[];
  priority: Priority[];
  dueDate: 'today' | 'week' | 'month' | 'overdue' | null;
}

export interface PomodoroSession {
  id: string;
  taskId?: string;
  type: 'focus' | 'break';
  duration: number; // in minutes
  startTime: Date;
  endTime?: Date;
  completed: boolean;
}