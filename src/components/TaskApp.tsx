import { useState } from 'react';
import { Plus, LayoutGrid, List, Timer, Settings, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from './ThemeToggle';
import { TaskFilters } from './TaskFilters';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';
import { KanbanBoard } from './KanbanBoard';
import { PomodoroModal } from './PomodoroModal';
import { NotesSection } from './NotesSection';
import { useTasks } from '@/hooks/useTasks';
import { Task, Filter, Status } from '@/types/task';

export const TaskApp = () => {
  const { tasks, loading, addTask, updateTask, deleteTask, addComment, filterTasks, getAllTags } = useTasks();
  const [filter, setFilter] = useState<Filter>({
    search: '',
    tags: [],
    status: [],
    priority: [],
    dueDate: null
  });
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<Status>('todo');
  const [view, setView] = useState<'list' | 'kanban' | 'notes'>('kanban');
  const [showPomodoroModal, setShowPomodoroModal] = useState(false);

  const filteredTasks = filterTasks(tasks, filter);
  const availableTags = getAllTags();

  const handleTaskSubmit = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments'>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      addTask(taskData);
    }
    setEditingTask(null);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleAddTask = (status?: Status) => {
    setEditingTask(null);
    setDefaultStatus(status || 'todo');
    setShowTaskForm(true);
  };

  const handlePomodoroComplete = (type: 'focus' | 'break') => {
    console.log(`${type} session completed!`);
    // Here you could update task pomodoro counts, show notifications, etc.
  };

  const getTaskCounts = () => {
    return {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'todo').length,
      progress: tasks.filter(t => t.status === 'progress').length,
      done: tasks.filter(t => t.status === 'done').length,
      overdue: tasks.filter(t => t.dueDate && t.dueDate < new Date() && t.status !== 'done').length
    };
  };

  const counts = getTaskCounts();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-2xl font-bold">Tarea</h1>
                <p className="text-sm text-muted-foreground">Stay focused and productive</p>
              </div>
              
              <div className="hidden md:flex items-center gap-2">
                <Badge variant="secondary">Total: {counts.total}</Badge>
                <Badge variant="outline" className="bg-status-todo text-white">
                  Todo: {counts.todo}
                </Badge>
                <Badge variant="outline" className="bg-status-progress text-white">
                  Progress: {counts.progress}
                </Badge>
                <Badge variant="outline" className="bg-status-done text-white">
                  Done: {counts.done}
                </Badge>
                {counts.overdue > 0 && (
                  <Badge variant="destructive">
                    Overdue: {counts.overdue}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={() => handleAddTask()} className="gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Task</span>
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={view} onValueChange={(value) => setView(value as 'list' | 'kanban' | 'notes')} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="kanban" className="gap-2">
                <LayoutGrid className="h-4 w-4" />
                Kanban Board
              </TabsTrigger>
              <TabsTrigger value="list" className="gap-2">
                <List className="h-4 w-4" />
                List View
              </TabsTrigger>
              <TabsTrigger value="notes" className="gap-2">
                <FileText className="h-4 w-4" />
                Notes
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => setShowPomodoroModal(true)}
              >
                <Timer className="h-4 w-4" />
                <span className="hidden sm:inline">Pomodoro</span>
              </Button>
            </div>
          </div>

          {/* Filters - Only show in list view */}
          {view === 'list' && (
            <TaskFilters 
              filter={filter}
              onFilterChange={setFilter}
              availableTags={availableTags}
            />
          )}

          <TabsContent value="list" className="space-y-4">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="mb-4">
                  {tasks.length === 0 ? (
                    <div className="text-6xl mb-4">📝</div>
                  ) : (
                    <div className="text-6xl mb-4">🔍</div>
                  )}
                </div>
                <h3 className="text-lg font-medium mb-2">
                  {tasks.length === 0 ? 'No tasks yet' : 'No tasks match your filters'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {tasks.length === 0 
                    ? 'Create your first task to get started with your productivity journey'
                    : 'Try adjusting your search or filter criteria'
                  }
                </p>
                {tasks.length === 0 && (
                  <Button onClick={() => handleAddTask()} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Your First Task
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={handleEditTask}
                    onDelete={deleteTask}
                    onStatusChange={(id, status) => updateTask(id, { status })}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="kanban">
            <KanbanBoard
              tasks={filteredTasks}
              onTaskUpdate={updateTask}
              onTaskEdit={handleEditTask}
              onTaskDelete={deleteTask}
              onAddTask={handleAddTask}
            />
          </TabsContent>

          <TabsContent value="notes" className="h-[calc(100vh-16rem)]">
            <NotesSection />
          </TabsContent>
        </Tabs>

        {/* Pomodoro Timer - Fixed Position */}
        <div className="fixed bottom-6 right-6 z-30">
          <div className="relative">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowPomodoroModal(true)}
              className="h-14 w-14 rounded-full shadow-lg bg-background border-4"
            >
              <Timer className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </main>

      {/* Task Form Dialog */}
      <TaskForm
        open={showTaskForm}
        onOpenChange={(open) => {
          setShowTaskForm(open);
          if (!open) setEditingTask(null);
        }}
        onSubmit={handleTaskSubmit}
        task={editingTask}
      />

      {/* Pomodoro Modal */}
      <PomodoroModal
        open={showPomodoroModal}
        onOpenChange={setShowPomodoroModal}
      />

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Tarea © 2025 — All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};