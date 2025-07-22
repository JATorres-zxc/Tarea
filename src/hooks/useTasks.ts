import { useState, useEffect } from 'react';
import { Task, Filter, Priority, Status } from '@/types/task';

const STORAGE_KEY = 'task-app-tasks';

// Sample data for demo
const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Design new landing page',
    description: 'Create wireframes and mockups for the new product landing page',
    priority: 'high',
    tags: ['Design', 'Web'],
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    status: 'progress',
    createdAt: new Date(),
    updatedAt: new Date(),
    comments: [
      {
        id: '1',
        content: 'Started working on the wireframes',
        timestamp: new Date()
      }
    ],
    pomodoroCount: 3
  },
  {
    id: '2',
    title: 'Review code submissions',
    description: 'Go through the recent pull requests and provide feedback',
    priority: 'medium',
    tags: ['Code Review', 'Development'],
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    status: 'todo',
    createdAt: new Date(),
    updatedAt: new Date(),
    comments: [],
    recurring: {
      interval: 'weekly',
      lastCreated: new Date()
    }
  },
  {
    id: '3',
    title: 'Update documentation',
    description: 'Update the API documentation with recent changes',
    priority: 'low',
    tags: ['Documentation'],
    status: 'done',
    createdAt: new Date(),
    updatedAt: new Date(),
    comments: [],
    pomodoroCount: 2
  }
];

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Load tasks from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsedTasks = JSON.parse(stored).map((task: any) => ({
          ...task,
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
          comments: task.comments.map((comment: any) => ({
            ...comment,
            timestamp: new Date(comment.timestamp)
          }))
        }));
        setTasks(parsedTasks);
      } catch (error) {
        console.error('Error loading tasks:', error);
        setTasks(sampleTasks);
      }
    } else {
      setTasks(sampleTasks);
    }
    setLoading(false);
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [tasks, loading]);

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments'>) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      comments: []
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id 
        ? { ...task, ...updates, updatedAt: new Date() }
        : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const addComment = (taskId: string, content: string) => {
    const newComment = {
      id: crypto.randomUUID(),
      content,
      timestamp: new Date()
    };
    
    updateTask(taskId, {
      comments: [...(tasks.find(t => t.id === taskId)?.comments || []), newComment]
    });
  };

  const filterTasks = (tasks: Task[], filter: Filter): Task[] => {
    return tasks.filter(task => {
      // Search filter
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        const matchesSearch = 
          task.title.toLowerCase().includes(searchLower) ||
          task.description.toLowerCase().includes(searchLower) ||
          task.tags.some(tag => tag.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Tags filter
      if (filter.tags.length > 0) {
        const hasMatchingTag = filter.tags.some(tag => 
          task.tags.some(taskTag => taskTag.toLowerCase().includes(tag.toLowerCase()))
        );
        if (!hasMatchingTag) return false;
      }

      // Status filter
      if (filter.status.length > 0 && !filter.status.includes(task.status)) {
        return false;
      }

      // Priority filter
      if (filter.priority.length > 0 && !filter.priority.includes(task.priority)) {
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

  const getAllTags = (): string[] => {
    const allTags = tasks.flatMap(task => task.tags);
    return Array.from(new Set(allTags)).sort();
  };

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    addComment,
    filterTasks,
    getAllTags
  };
};