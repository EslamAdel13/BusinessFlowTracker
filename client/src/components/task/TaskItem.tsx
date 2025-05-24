import { useState } from 'react';
import { Task } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { formatShortDate, isOverdue, isWithinDays } from '@/lib/utils';
import { useTaskStore } from '@/store/taskStore';
import { useToast } from '@/hooks/use-toast';
import StatusBadge from '@/components/ui/status-badge';
import AvatarWithInitials from '@/components/ui/avatar-with-initials';

interface TaskItemProps {
  task: Task;
  phaseId: number;
  onStatusChange?: () => void;
}

const TaskItem = ({ task, phaseId, onStatusChange }: TaskItemProps) => {
  const { updateTask, deleteTask, toggleTaskStatus } = useTaskStore();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [taskName, setTaskName] = useState(task.name);
  
  const isDue = isWithinDays(task.due_date, 3);
  const isTaskOverdue = isOverdue(task.due_date);
  
  const handleToggleStatus = async () => {
    try {
      await toggleTaskStatus(task);
      onStatusChange?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update task status',
        variant: 'destructive',
      });
    }
  };
  
  const handleSave = async () => {
    if (taskName.trim() === '') {
      toast({
        title: 'Error',
        description: 'Task name cannot be empty',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      await updateTask(task.id, { name: taskName });
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update task name',
        variant: 'destructive',
      });
    }
  };
  
  const handleDelete = async () => {
    try {
      await deleteTask(task.id);
      onStatusChange?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete task',
        variant: 'destructive',
      });
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setTaskName(task.name);
    }
  };

  return (
    <div className={`bg-white border rounded-md p-3 shadow-sm ${isTaskOverdue ? 'border-red-300' : 'border-gray-200'}`}>
      <div className="flex items-start space-x-3">
        <div className="pt-1">
          <Checkbox 
            id={`task-${task.id}`} 
            checked={task.status === 'done'} 
            onCheckedChange={handleToggleStatus}
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            {isEditing ? (
              <input
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                className="w-full text-sm font-medium p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                autoFocus
              />
            ) : (
              <h4 
                className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-gray-500' : 'text-gray-900'}`}
                onDoubleClick={() => setIsEditing(true)}
              >
                {task.name}
              </h4>
            )}
            <StatusBadge status={task.status} type="task" />
          </div>
          
          <div className={`text-xs mb-2 ${isTaskOverdue ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
            Due: {formatShortDate(task.dueDate)}
            {isTaskOverdue && ` (${getDaysOverdueText(task.dueDate)})`}
            {isDue && !isTaskOverdue && ' (Coming soon)'}
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center">
              <AvatarWithInitials name={task.assignee} size="sm" />
              <span className="text-gray-500 ml-1">{task.assignee}</span>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-gray-400 hover:text-gray-500"
                onClick={() => setIsEditing(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                <span className="sr-only">Edit task</span>
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-gray-400 hover:text-gray-500"
                onClick={handleDelete}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="sr-only">Delete task</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function getDaysOverdueText(dueDate: string | Date): string {
  const days = Math.abs(
    Math.floor(
      (new Date().getTime() - new Date(dueDate).getTime()) / (1000 * 60 * 60 * 24)
    )
  );
  
  return `${days} ${days === 1 ? 'day' : 'days'} overdue`;
}

export default TaskItem;
