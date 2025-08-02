import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TaskCard } from './TaskCard';
import { Task, Status } from '@/types/task';
import { cn } from '@/lib/utils';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskUpdate: (id: string, updates: Partial<Task>) => void;
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (task: Task) => void;
  onAddTask: (status: Status) => void;
}

const statusConfig = {
  todo: { title: 'To Do', color: 'bg-status-todo' },
  progress: { title: 'In Progress', color: 'bg-status-progress' },
  done: { title: 'Done', color: 'bg-status-done' }
};

export const KanbanBoard = ({ 
  tasks, 
  onTaskUpdate, 
  onTaskEdit, 
  onTaskDelete, 
  onAddTask 
}: KanbanBoardProps) => {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const getTasksByStatus = (status: Status) => {
    return tasks
      .filter(task => task.status === status)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 3); // Show only latest 3 tasks
  };

  const handleDragEnd = (result: DropResult) => {
    setDraggedTask(null);
    
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) return;

    const newStatus = destination.droppableId as Status;
    onTaskUpdate(draggableId, { status: newStatus });
  };

  const handleDragStart = (start: any) => {
    const task = tasks.find(t => t.id === start.draggableId);
    setDraggedTask(task || null);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(Object.keys(statusConfig) as Status[]).map((status) => {
          const statusTasks = getTasksByStatus(status);
          const config = statusConfig[status];
          
          return (
            <div key={status} className="flex flex-col">
              {/* Column Header */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-3 h-3 rounded-full", config.color)} />
                    <h3 className="font-medium text-sm">
                      {config.title}
                    </h3>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                      {statusTasks.length}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAddTask(status)}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Drop Zone */}
              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "flex-1 rounded-lg border-2 border-dashed transition-colors",
                      snapshot.isDraggingOver
                        ? "border-primary bg-primary/5"
                        : "border-transparent"
                    )}
                  >
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-3 p-2">
                        {statusTasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={cn(
                                  "transition-transform",
                                  snapshot.isDragging && "rotate-3 scale-105"
                                )}
                              >
                                 <TaskCard
                                   task={task}
                                   onEdit={onTaskEdit}
                                   onDelete={() => onTaskDelete(task)}
                                   onStatusChange={(id, newStatus) => onTaskUpdate(id, { status: newStatus })}
                                   className={cn(
                                     "cursor-grab active:cursor-grabbing",
                                     snapshot.isDragging && "shadow-lg"
                                   )}
                                 />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        
                        {/* Empty State */}
                        {statusTasks.length === 0 && (
                          <Card className="p-8 text-center border-dashed">
                            <p className="text-sm text-muted-foreground">
                              {draggedTask && draggedTask.status !== status 
                                ? `Drop task here to move to ${config.title.toLowerCase()}`
                                : `No tasks in ${config.title.toLowerCase()}`
                              }
                            </p>
                          </Card>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};