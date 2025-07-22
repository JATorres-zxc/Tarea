import { TaskApp } from '@/components/TaskApp';
import { ThemeProvider } from '@/components/ThemeProvider';

const Index = () => {
  return (
    <ThemeProvider>
      <TaskApp />
    </ThemeProvider>
  );
};

export default Index;
