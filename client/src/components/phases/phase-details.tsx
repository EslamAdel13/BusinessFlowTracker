import React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Phase, Task } from "@shared/schema";
import { formatDate } from "@/lib/dateUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/lib/store";
import { TaskList } from "@/components/tasks/task-list";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PlusIcon, XIcon, PenIcon, TrashIcon } from "lucide-react";
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

interface PhaseDetailsProps {
  phase: Phase;
  onClose: () => void;
}

export function PhaseDetails({ phase, onClose }: PhaseDetailsProps) {
  const { toast } = useToast();
  const { openCreateTaskModal, setSelectedPhase } = useAppStore();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [taskFilter, setTaskFilter] = React.useState<'all' | 'my'>('all');

  // Fetch tasks for this phase
  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery({
    queryKey: ['/api/phases', phase.id, 'tasks'],
    queryFn: async () => {
      const res = await fetch(`/api/phases/${phase.id}/tasks`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch tasks');
      return res.json();
    },
  });

  // Mutation to delete phase
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/phases/${phase.id}`, undefined);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', phase.projectId, 'phases'] });
      toast({
        title: "Phase deleted",
        description: "The phase has been deleted successfully.",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete phase. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEditPhase = () => {
    setSelectedPhase(phase);
    useAppStore.getState().openCreatePhaseModal();
  };

  const handleAddTask = () => {
    setSelectedPhase(phase);
    openCreateTaskModal();
  };

  const handleDeletePhase = () => {
    deleteMutation.mutateAsync();
  };

  // Get status badge color
  const getStatusBadge = () => {
    switch (phase.status) {
      case "not_started":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Not Started</span>;
      case "in_progress":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">In Progress</span>;
      case "completed":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Completed</span>;
      case "overdue":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Overdue</span>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">{phase.name}</h2>
        <button 
          onClick={onClose} 
          className="text-gray-400 hover:text-gray-500"
        >
          <XIcon className="h-6 w-6" />
        </button>
      </div>
      
      <div className="mb-6">
        <div className="bg-gray-100 p-4 rounded-lg mb-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Start Date</div>
              <div className="text-sm font-medium">{formatDate(phase.startDate)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">End Date</div>
              <div className="text-sm font-medium">{formatDate(phase.endDate)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Status</div>
              <div>{getStatusBadge()}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Progress</div>
              <div className="flex items-center space-x-2">
                <div className="text-sm font-medium">{phase.progress}%</div>
                <div className="w-24">
                  <Progress value={phase.progress} className="h-2" />
                </div>
              </div>
            </div>
          </div>
          
          {phase.responsible && (
            <div className="mb-4">
              <div className="text-xs text-gray-500 mb-1">Responsible</div>
              <div className="text-sm font-medium">{phase.responsible}</div>
            </div>
          )}
          
          {phase.deliverable && (
            <div>
              <div className="text-xs text-gray-500 mb-1">Deliverable</div>
              <div className="text-sm">{phase.deliverable}</div>
            </div>
          )}

          <div className="flex space-x-2 mt-4">
            <Button
              size="sm"
              variant="outline"
              className="flex items-center text-xs"
              onClick={handleEditPhase}
            >
              <PenIcon className="h-3 w-3 mr-1" />
              Edit Phase
            </Button>
            
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center text-xs text-red-500 border-red-200 hover:bg-red-50"
                >
                  <TrashIcon className="h-3 w-3 mr-1" />
                  Delete Phase
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the phase "{phase.name}" and all of its tasks.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeletePhase}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    {deleteMutation.isPending ? "Deleting..." : "Delete Phase"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900">Tasks</h3>
          <div className="flex space-x-2">
            <Button
              size="icon"
              variant="default"
              className="h-6 w-6"
              onClick={handleAddTask}
            >
              <PlusIcon className="h-4 w-4" />
            </Button>
            
            <select
              className="text-xs border-gray-300 rounded-md shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
              value={taskFilter}
              onChange={(e) => setTaskFilter(e.target.value as 'all' | 'my')}
            >
              <option value="all">All Tasks</option>
              <option value="my">My Tasks</option>
            </select>
          </div>
        </div>
        
        <TaskList
          tasks={tasks as Task[]}
          isLoading={isLoadingTasks}
          filter={taskFilter}
          phaseId={phase.id}
        />
      </div>
    </div>
  );
}

export default PhaseDetails;
