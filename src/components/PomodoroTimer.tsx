import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Focus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import alarmSound from '@/assets/alarm.mp3';

interface PomodoroTimerProps {
  onPomodoroComplete?: (type: 'focus' | 'break') => void;
  taskId?: string;
}

export const PomodoroTimer = ({ onPomodoroComplete, taskId }: PomodoroTimerProps) => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState<'focus' | 'break'>('focus');
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [focusDuration, setFocusDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio for notifications
  useEffect(() => {
    audioRef.current = new Audio(alarmSound);
    // Allow audio to be played on user interaction
    const unlockAudio = () => {
      if (audioRef.current) {
        audioRef.current.play().catch(() => {});
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('keydown', unlockAudio);
    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  // Helper to set duration in minutes (can be fractional)
  const setDuration = (type: 'focus' | 'break', value: string) => {
    const floatVal = parseFloat(value);
    if (type === 'focus') {
      setFocusDuration(floatVal);
      if (sessionType === 'focus' && !isActive) {
        setMinutes(Math.floor(floatVal));
        setSeconds(Math.round((floatVal - Math.floor(floatVal)) * 60));
      }
    } else {
      setBreakDuration(floatVal);
      if (sessionType === 'break' && !isActive) {
        setMinutes(Math.floor(floatVal));
        setSeconds(Math.round((floatVal - Math.floor(floatVal)) * 60));
      }
    }
  };

  // Set initial timer values on mount and when session type changes
  useEffect(() => {
    if (sessionType === 'focus') {
      setMinutes(Math.floor(focusDuration));
      setSeconds(Math.round((focusDuration - Math.floor(focusDuration)) * 60));
    } else {
      setMinutes(Math.floor(breakDuration));
      setSeconds(Math.round((breakDuration - Math.floor(breakDuration)) * 60));
    }
  }, [sessionType, focusDuration, breakDuration]);

  const totalSeconds = sessionType === 'focus' ? focusDuration * 60 : breakDuration * 60;
  const currentSeconds = minutes * 60 + seconds;
  const progress = ((totalSeconds - currentSeconds) / totalSeconds) * 100;

  useEffect(() => {
    if (isActive && (minutes > 0 || seconds > 0)) {
      intervalRef.current = setInterval(() => {
        setSeconds(prevSeconds => {
          if (prevSeconds > 0) {
            return prevSeconds - 1;
          } else if (minutes > 0) {
            setMinutes(prevMinutes => prevMinutes - 1);
            return 59;
          } else {
            return 0;
          }
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (isActive && minutes === 0 && seconds === 0) {
        handleTimerComplete();
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, minutes, seconds]);

  const handleTimerComplete = () => {
    setIsActive(false);
    // Play notification sound if possible
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
    if (sessionType === 'focus') {
      setCompletedPomodoros(prev => prev + 1);
      onPomodoroComplete?.('focus');
      setSessionType('break');
      setMinutes(Math.floor(breakDuration));
      setSeconds(Math.round((breakDuration - Math.floor(breakDuration)) * 60));
    } else {
      onPomodoroComplete?.('break');
      setSessionType('focus');
      setMinutes(Math.floor(focusDuration));
      setSeconds(Math.round((focusDuration - Math.floor(focusDuration)) * 60));
    }
  };

  const toggleTimer = () => {
    // Stop alarm sound if it's playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    if (sessionType === 'focus') {
      setMinutes(Math.floor(focusDuration));
      setSeconds(Math.round((focusDuration - Math.floor(focusDuration)) * 60));
    } else {
      setMinutes(Math.floor(breakDuration));
      setSeconds(Math.round((breakDuration - Math.floor(breakDuration)) * 60));
    }
  };

  const switchSession = (type: 'focus' | 'break') => {
    setIsActive(false);
    setSessionType(type);
    if (type === 'focus') {
      setMinutes(Math.floor(focusDuration));
      setSeconds(Math.round((focusDuration - Math.floor(focusDuration)) * 60));
    } else {
      setMinutes(Math.floor(breakDuration));
      setSeconds(Math.round((breakDuration - Math.floor(breakDuration)) * 60));
    }
  };

  const formatTime = (mins: number, secs: number) => {
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {sessionType === 'focus' ? (
              <Focus className="h-5 w-5 text-pomodoro-focus" />
            ) : (
              <Coffee className="h-5 w-5 text-pomodoro-break" />
            )}
            <span>Pomodoro Timer</span>
          </div>
          <Badge variant="secondary">
            🍅 {completedPomodoros}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Session Type Toggle */}
        <div className="flex gap-2">
          <Button
            variant={sessionType === 'focus' ? 'default' : 'outline'}
            size="sm"
            onClick={() => switchSession('focus')}
            className="flex-1"
            disabled={isActive}
          >
            <Focus className="h-4 w-4 mr-2" />
            Focus
          </Button>
          <Button
            variant={sessionType === 'break' ? 'default' : 'outline'}
            size="sm"
            onClick={() => switchSession('break')}
            className="flex-1"
            disabled={isActive}
          >
            <Coffee className="h-4 w-4 mr-2" />
            Break
          </Button>
        </div>

        {/* Timer Display */}
        <div className="text-center space-y-4">
          <div className={cn(
            "text-6xl font-mono font-bold",
            sessionType === 'focus' ? 'text-pomodoro-focus' : 'text-pomodoro-break'
          )}>
            {formatTime(minutes, seconds)}
          </div>
          
          <Progress 
            value={progress} 
            className="h-2"
          />
          
          <div className="text-sm text-muted-foreground">
            {sessionType === 'focus' ? 'Focus Session' : 'Break Time'}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <Button
            onClick={toggleTimer}
            size="lg"
            className={cn(
              "h-12 w-12 rounded-full",
              sessionType === 'focus' ? 'bg-pomodoro-focus hover:bg-pomodoro-focus/90' : 'bg-pomodoro-break hover:bg-pomodoro-break/90'
            )}
          >
            {isActive ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>
          
          <Button
            onClick={resetTimer}
            variant="outline"
            size="lg"
            className="h-12 w-12 rounded-full"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
        </div>

        {/* Duration Settings */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="space-y-2">
            <label className="text-sm font-medium">Focus Duration</label>
            <Select 
              value={focusDuration.toString()} 
              onValueChange={(value) => setDuration('focus', value)}
              disabled={isActive}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.05">3 sec (test)</SelectItem>
                <SelectItem value="15">15 min</SelectItem>
                <SelectItem value="25">25 min</SelectItem>
                <SelectItem value="30">30 min</SelectItem>
                <SelectItem value="45">45 min</SelectItem>
                <SelectItem value="60">60 min</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Break Duration</label>
            <Select 
              value={breakDuration.toString()} 
              onValueChange={(value) => setDuration('break', value)}
              disabled={isActive}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.05">3 sec (test)</SelectItem>
                <SelectItem value="5">5 min</SelectItem>
                <SelectItem value="10">10 min</SelectItem>
                <SelectItem value="15">15 min</SelectItem>
                <SelectItem value="20">20 min</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};