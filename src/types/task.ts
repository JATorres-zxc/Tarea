export type Priority = 'low' | 'medium' | 'high';
export type Status = 'todo' | 'progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  tags: string[];
  dueDate?: Date;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
  comments: Comment[];
  recurring?: RecurringConfig;
  pomodoroCount?: number;
}

export interface Comment {
  id: string;
  content: string;
  timestamp: Date;
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