import React from "react";
import { useMutation } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { formatDate, isOverdue } from "@/lib/dateUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { AvatarWithInitials } from "@/components/ui/avatar-with-initials";
import { Checkbox } from "@/components/ui/checkbox";
import { PenIcon, TrashIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export function TaskItem({ task, onEdit }: TaskItemProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const isMyTask = task.assignee === user?.fullName || task.assigneeId === user?.id;
  const isTaskOverdue = task.dueDate ? isOverdue(task.dueDate) : false;

  // Status badge styling
  const getStatusBadge = () => {
    switch (task.status) {
      case "todo":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Todo</span>;
      case "doing":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Doing</span>;
      case "done":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Done</span>;
      default:
        return null;
    }
  };

  // Priority badge styling
  const getPriorityBadge = () => {
    switch (task.priority) {
      case "low":
        return <span className="text-xs text-blue-600">Low</span>;
      case "medium":
        return <span className="text-xs text-amber-600">Medium</span>;
      case "high":
        return <span className="text-xs text-red-600">High</span>;
      default:
        return null;
    }
  };

  // Toggle task completion
  const toggleTaskMutation = useMutation({
    mutationFn: async (newStatus: 'todo' | 'doing' | 'done') => {
      const response = await apiRequest("PATCH", `/api/tasks/${task.id}`, {
        status: newStatus
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/phases', task.phaseId, 'tasks'] });
      toast({
        title: task.status === 'done' ? "Task marked as incomplete" : "Task marked as complete",
        description: `"${task.name}" has been updated.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update task status.",
        variant: "destructive",
      });
    },
  });

  // Delete task
  const deleteTaskMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/tasks/${task.id}`, undefined);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/phases', task.phaseId, 'tasks'] });
      toast({
        title: "Task deleted",
        description: `"${task.name}" has been deleted.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete task.",
        variant: "destructive",
      });
    },
  });

  const handleToggleTask = () => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    toggleTaskMutation.mutateAsync(newStatus);
  };

  const handleDeleteTask = () => {
    deleteTaskMutation.mutateAsync();
  };

  return (
    <div className={cn(
      "bg-white border rounded-md p-3 shadow-sm",
      task.status === 'done' ? "border-gray-200" : "",
      isTaskOverdue && task.status !== 'done' ? "border-red-300" : "",
    )}>
      <div className="flex items-start space-x-3">
        <div className="pt-1">
          <Checkbox 
            checked={task.status === 'done'} 
            onCheckedChange={handleToggleTask}
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className={cn(
              "text-sm font-medium",
              task.status === 'done' ? "line-through text-gray-500" : "text-gray-900"
            )}>
              {task.name}
            </h4>
            {getStatusBadge()}
          </div>
          
          <div className={cn(
            "text-xs mb-2",
            isTaskOverdue && task.status !== 'done' ? "text-red-500 font-medium" : "text-gray-500"
          )}>
            {task.dueDate ? (
              <>
                Due: {formatDate(task.dueDate)}
                {isTaskOverdue && task.status !== 'done' && (
                  <span className="ml-1">(overdue)</span>
                )}
              </>
            ) : (
              "No due date"
            )}
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center">
              {task.assignee ? (
                <>
                  <AvatarWithInitials
                    name={task.assignee}
                    className="w-6 h-6 mr-1"
                    bgColorClass={isMyTask ? "bg-primary-200" : "bg-gray-200"}
                  />
                  <span className="text-gray-500">{task.assignee}</span>
                </>
              ) : (
                <span className="text-gray-400">Unassigned</span>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              {getPriorityBadge()}
              
              <div className="flex space-x-2">
                <button 
                  type="button" 
                  className="text-gray-400 hover:text-gray-500"
                  onClick={() => onEdit(task)}
                >
                  <PenIcon className="h-4 w-4" />
                </button>
                
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <button type="button" className="text-gray-400 hover:text-gray-500">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Task</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete the task "{task.name}"?
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDeleteTask}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        {deleteTaskMutation.isPending ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskItem;
