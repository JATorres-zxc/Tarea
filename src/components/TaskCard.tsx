import { Clock, Calendar, MessageSquare, Timer, Edit, Trash2, Tag } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Task, Priority } from '@/types/task';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: () => void;
  onStatusChange: (id: string, status: Task['status']) => void;
  className?: string;
}

const priorityColors: Record<Priority, string> = {
  low: 'bg-priority-low text-white',
  medium: 'bg-priority-medium text-white',
  high: 'bg-priority-high text-white'
};

const statusColors: Record<Task['status'], string> = {
  todo: 'bg-status-todo text-white',
  progress: 'bg-status-progress text-white',
  done: 'bg-status-done text-white'
};

export const TaskCard = ({ task, onEdit, onDelete, onStatusChange, className }: TaskCardProps) => {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
    if (diffDays > 1) return `In ${diffDays} days`;
    
    return date.toLocaleDateString();
  };

  const isOverdue = task.dueDate && task.dueDate < new Date() && task.status !== 'done';

  return (
    <Card className={cn(
      "group hover:shadow-md transition-all duration-200",
      isOverdue && "border-destructive",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-sm leading-tight line-clamp-2">
            {task.title}
          </h3>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onEdit(task)}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="py-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge 
            variant="secondary" 
            className={cn("text-xs", priorityColors[task.priority])}
          >
            {task.priority}
          </Badge>
          
          <Badge 
            variant="secondary" 
            className={cn("text-xs", statusColors[task.status])}
          >
            {task.status === 'progress' ? 'In Progress' : task.status}
          </Badge>

          {task.recurring && (
            <Badge variant="outline" className="text-xs">
              🔁 {task.recurring.interval}
            </Badge>
          )}
        </div>

        {task.tags.length > 0 && (
          <div className="flex items-center gap-1 mt-2 flex-wrap">
            <Tag className="h-3 w-3 text-muted-foreground" />
            {task.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2 pb-3">
        <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            {task.dueDate && (
              <div className={cn(
                "flex items-center gap-1",
                isOverdue && "text-destructive"
              )}>
                <Calendar className="h-3 w-3" />
                <span>{formatDate(task.dueDate)}</span>
              </div>
            )}
            
            {task.comments.length > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span>{task.comments.length}</span>
              </div>
            )}
            
            {/* {task.pomodoroCount && task.pomodoroCount > 0 && (
              <div className="flex items-center gap-1">
                <Timer className="h-3 w-3" />
                <span>{task.pomodoroCount}</span>
              </div>
            )} */}
          </div>
          
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatDate(task.updatedAt)}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};