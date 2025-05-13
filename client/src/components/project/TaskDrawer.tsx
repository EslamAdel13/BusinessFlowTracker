import { useEffect, useState } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { useTaskStore } from '@/store/taskStore';
import { useUIStore } from '@/store/uiStore';
import { Phase, Task } from '@shared/schema';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDateRange, getDaysOverdue } from '@/lib/date';
import { getProgressPercentage } from '@/lib/utils';
import TaskItem from '@/components/task/TaskItem';
import CreateTaskForm from '@/components/task/CreateTaskForm';
import StatusBadge from '@/components/ui/status-badge';

const TaskDrawer = () => {
  const { selectedPhase, updatePhase } = useProjectStore();
  const { tasks, fetchTasks, filterMode, setFilterMode, getFilteredTasks } = useTaskStore();
  const { activeModal, closeModal } = useUIStore();
  const [showAddTask, setShowAddTask] = useState(false);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  
  const isOpen = activeModal === 'taskDrawer';
  
  useEffect(() => {
    if (isOpen && selectedPhase) {
      fetchTasks(selectedPhase.id);
    } else {
      setShowAddTask(false);
    }
  }, [isOpen, selectedPhase, fetchTasks]);
  
  useEffect(() => {
    if (selectedPhase) {
      setFilteredTasks(getFilteredTasks(selectedPhase.id));
    }
  }, [tasks, filterMode, selectedPhase, getFilteredTasks]);
  
  const handleSwitchFilter = () => {
    setFilterMode(filterMode === 'all' ? 'my' : 'all');
  };
  
  if (!selectedPhase) return null;
  
  const daysOverdue = getDaysOverdue(selectedPhase.endDate);
  const isOverdue = daysOverdue > 0;
  
  return (
    <Sheet open={isOpen} onOpenChange={() => closeModal()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>{selectedPhase.name}</SheetTitle>
          <SheetDescription>
            {formatDateRange(selectedPhase.startDate, selectedPhase.endDate)}
          </SheetDescription>
        </SheetHeader>
        
        <div className="mb-6">
          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Start Date</div>
                <div className="text-sm font-medium">
                  {new Date(selectedPhase.startDate).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">End Date</div>
                <div className="text-sm font-medium">
                  {new Date(selectedPhase.endDate).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Status</div>
                <StatusBadge status={selectedPhase.status} type="phase" />
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Progress</div>
                <div className="text-sm font-medium">{getProgressPercentage(selectedPhase.progress)}%</div>
              </div>
            </div>
            
            {isOverdue && (
              <div className="mb-4 p-2 bg-red-50 text-red-700 text-sm rounded">
                <span className="font-semibold">Overdue: </span>
                {daysOverdue} {daysOverdue === 1 ? 'day' : 'days'} past deadline
              </div>
            )}
            
            <div className="mb-4">
              <div className="text-xs text-gray-500 mb-1">Responsible</div>
              <div className="text-sm font-medium">{selectedPhase.responsible}</div>
            </div>
            
            <div>
              <div className="text-xs text-gray-500 mb-1">Deliverable</div>
              <div className="text-sm">{selectedPhase.deliverable}</div>
            </div>
            
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-primary h-2.5 rounded-full" 
                  style={{ width: `${selectedPhase.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Tasks</h3>
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 p-0 rounded-full"
                onClick={() => setShowAddTask(!showAddTask)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span className="sr-only">Add task</span>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs h-8"
                onClick={handleSwitchFilter}
              >
                {filterMode === 'all' ? 'All Tasks' : 'My Tasks'}
              </Button>
            </div>
          </div>
          
          {showAddTask && (
            <div className="mb-4">
              <CreateTaskForm 
                phaseId={selectedPhase.id}
                projectId={selectedPhase.projectId}
                onSuccess={() => setShowAddTask(false)}
              />
            </div>
          )}
          
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                No tasks yet. Create your first task to get started.
              </div>
            ) : (
              filteredTasks.map(task => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  phaseId={selectedPhase.id}
                  onStatusChange={() => {
                    // Recalculate phase progress based on completed tasks
                    const completedTasks = tasks.filter(t => 
                      t.phaseId === selectedPhase.id && t.status === 'done'
                    ).length;
                    
                    const totalTasks = tasks.filter(t => t.phaseId === selectedPhase.id).length;
                    const progressPercentage = totalTasks > 0 
                      ? Math.round((completedTasks / totalTasks) * 100) 
                      : 0;
                    
                    // Update phase progress
                    updatePhase(selectedPhase.id, { progress: progressPercentage });
                  }} 
                />
              ))
            )}
          </div>
        </div>
        
        <div className="flex justify-end mt-4">
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TaskDrawer;
