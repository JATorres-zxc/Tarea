import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Task, Filter, Priority, Status, Comment } from '@/types/task';
import { useAuth } from './useAuth';

// Define API response types that match your Django backend
interface ApiTask {
  id: number;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  due_date?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  comments?: ApiComment[];
  pomodoro_count?: number;
  recurring?: {
    interval: string;
    last_created: string;
  };
}

interface ApiComment {
  id: number;
  content: string;
  created_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export const useTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to transform API response to Task type
  const transformTask = (task: ApiTask): Task => {
    return {
      id: task.id.toString(),
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.due_date ? new Date(task.due_date) : undefined,
      tags: task.tags || [],
      createdAt: new Date(task.created_at),
      updatedAt: new Date(task.updated_at),
      comments: task.comments?.map(transformComment) || [],
      pomodoroCount: task.pomodoro_count || 0,
      recurring: task.recurring ? {
        interval: task.recurring.interval,
        lastCreated: new Date(task.recurring.last_created)
      } : undefined
    };
  };

  // Helper function to transform API comment to Comment type
  const transformComment = (comment: ApiComment): Comment => {
    return {
      id: comment.id.toString(),
      content: comment.content,
      timestamp: new Date(comment.created_at),
      user: comment.user ? {
        id: comment.user.id.toString(),
        name: comment.user.name,
        email: comment.user.email
      } : undefined
    };
  };

  // Fetch tasks from API
  const fetchTasks = useCallback(async () => {
    if (!user) return;
  
    try {
      setLoading(true);
      const response = await axios.get('/api/tasks/');
      
      // Handle case where response.data is not an array
      const tasksData = Array.isArray(response.data) ? response.data : [];
      
      const transformedTasks = tasksData.map(transformTask);
      setTasks(transformedTasks);
    } catch (err) {
      setError('Failed to fetch tasks');
      console.error('Error fetching tasks:', err);
      
      // Set empty array if error occurs (optional)
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load tasks on mount and when user changes
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Add a new task
  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments'>) => {
    try {
      const payload = {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        due_date: taskData.dueDate?.toISOString(),
        tags: taskData.tags || []
      };

      const response = await axios.post<ApiTask>('/api/tasks/', payload);
      const newTask = transformTask(response.data);
      setTasks(prev => [newTask, ...prev]);
      return newTask;
    } catch (err) {
      setError('Failed to add task');
      console.error('Error adding task:', err);
      throw err;
    }
  };

  // Update an existing task
  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const payload = {
        title: updates.title,
        description: updates.description,
        status: updates.status,
        priority: updates.priority,
        due_date: updates.dueDate?.toISOString(),
        tags: updates.tags
      };

      const response = await axios.patch<ApiTask>(`/api/tasks/${id}/`, payload);
      const updatedTask = transformTask(response.data);
      setTasks(prev => prev.map(task => 
        task.id === id ? updatedTask : task
      ));
      return updatedTask;
    } catch (err) {
      setError('Failed to update task');
      console.error('Error updating task:', err);
      throw err;
    }
  };

  // Delete a task
  const deleteTask = async (id: string) => {
    try {
      await axios.delete(`/api/tasks/${id}/`);
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (err) {
      setError('Failed to delete task');
      console.error('Error deleting task:', err);
      throw err;
    }
  };

  // Add a comment to a task
  const addComment = async (taskId: string, content: string) => {
    try {
      const response = await axios.post<ApiComment>(`/api/tasks/${taskId}/comments/`, { content });
      const newComment = transformComment(response.data);
      
      setTasks(prev => prev.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            comments: [...task.comments, newComment]
          };
        }
        return task;
      }));

      return newComment;
    } catch (err) {
      setError('Failed to add comment');
      console.error('Error adding comment:', err);
      throw err;
    }
  };

  // Filter tasks based on filter criteria
  const filterTasks = (tasks: Task[], filter: Filter): Task[] => {
    return tasks.filter(task => {
      // Search filter
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        const matchesSearch = 
          task.title.toLowerCase().includes(searchLower) ||
          (task.description && task.description.toLowerCase().includes(searchLower)) ||
          task.tags.some(tag => tag.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Tags filter
      if (filter.tags && filter.tags.length > 0) {
        const hasMatchingTag = filter.tags.some(tag => 
          task.tags.some(taskTag => taskTag.toLowerCase().includes(tag.toLowerCase()))
        );
        if (!hasMatchingTag) return false;
      }

      // Status filter
      if (filter.status && filter.status.length > 0 && !filter.status.includes(task.status)) {
        return false;
      }

      // Priority filter
      if (filter.priority && filter.priority.length > 0 && !filter.priority.includes(task.priority)) {
        return false;
      }

      // Due date filter
      if (filter.dueDate && task.dueDate) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const taskDate = new Date(task.dueDate.getFullYear(), task.dueDate.getMonth(), task.dueDate.getDate());
        
        switch (filter.dueDate) {
          case 'today':
            if (taskDate.getTime() !== today.getTime()) return false;
            break;
          case 'week':
            const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
            if (taskDate < today || taskDate > weekFromNow) return false;
            break;
          case 'month':
            const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
            if (taskDate < today || taskDate > monthFromNow) return false;
            break;
          case 'overdue':
            if (taskDate >= today) return false;
            break;
        }
      }

      return true;
    });
  };

  // Get all unique tags from tasks
  const getAllTags = (): string[] => {
    const allTags = tasks.flatMap(task => task.tags);
    return Array.from(new Set(allTags)).sort();
  };

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    addComment,
    filterTasks,
    getAllTags,
    refreshTasks: fetchTasks
  };
};