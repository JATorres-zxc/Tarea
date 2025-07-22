import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PomodoroTimer } from './PomodoroTimer';

interface PomodoroModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId?: string;
}

export const PomodoroModal = ({ open, onOpenChange, taskId }: PomodoroModalProps) => {
  const handlePomodoroComplete = (type: 'focus' | 'break') => {
    // You could integrate this with task management
    console.log(`${type} session completed!`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pomodoro Timer</DialogTitle>
        </DialogHeader>
        <PomodoroTimer onPomodoroComplete={handlePomodoroComplete} taskId={taskId} />
      </DialogContent>
    </Dialog>
  );
};