import { FC } from 'react';
import { Project, Phase } from '@shared/schema';
import { formatDateRange } from '@/lib/date';
import { Button } from '@/components/ui/button';
import { useProjectStore } from '@/store/projectStore';
import { useUIStore } from '@/store/uiStore';
import { Skeleton } from '@/components/ui/skeleton';
import { getProgressPercentage } from '@/lib/utils';

interface MobileProjectListProps {
  isLoading: boolean;
  projects: Project[];
  projectPhases: {[key: number]: Phase[]};
}

const MobileProjectList: FC<MobileProjectListProps> = ({ isLoading, projects, projectPhases }) => {
  const { selectProject, selectPhase } = useProjectStore();
  const { openModal } = useUIStore();
  
  const getProjectStatus = (phases: Phase[] = []) => {
    if (!phases.length) return 'Not Started';
    
    const totalPhases = phases.length;
    const completedPhases = phases.filter(p => p.status === 'completed').length;
    const inProgressPhases = phases.filter(p => p.status === 'in_progress').length;
    const overduePhases = phases.filter(p => p.status === 'overdue').length;
    
    if (overduePhases > 0) return 'At Risk';
    if (completedPhases === totalPhases) return 'Completed';
    if (inProgressPhases > 0) return 'In Progress';
    return 'Not Started';
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'At Risk':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getProjectDateRange = (phases: Phase[] = []) => {
    if (!phases.length) return 'No phases';
    
    const startDates = phases.map(p => new Date(p.startDate).getTime());
    const endDates = phases.map(p => new Date(p.endDate).getTime());
    
    const earliestStart = new Date(Math.min(...startDates));
    const latestEnd = new Date(Math.max(...endDates));
    
    return formatDateRange(earliestStart, latestEnd);
  };
  
  const renderSkeletonItems = () => {
    return Array(2).fill(0).map((_, index) => (
      <li key={index}>
        <div className="block">
          <div className="px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Skeleton className="h-3 w-3 rounded-full mr-3" />
                <Skeleton className="h-5 w-32" />
              </div>
              <Skeleton className="w-20 h-5 rounded-full" />
            </div>
            <div className="mt-2 sm:flex sm:justify-between">
              <Skeleton className="h-4 w-24 mt-2" />
              <Skeleton className="h-4 w-32 mt-2" />
            </div>
            <div className="mt-4">
              <Skeleton className="h-4 w-full mb-2" />
              <div className="space-y-2">
                <Skeleton className="h-16 w-full rounded-md" />
                <Skeleton className="h-16 w-full rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </li>
    ));
  };

  return (
    <div className="md:hidden px-4 sm:px-6">
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {isLoading ? (
            renderSkeletonItems()
          ) : (
            projects.map((project) => {
              const phases = projectPhases[project.id] || [];
              const projectStatus = getProjectStatus(phases);
              const dateRange = getProjectDateRange(phases);
              
              return (
                <li key={project.id}>
                  <div className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div 
                            className="h-3 w-3 rounded-full mr-3"
                            style={{ backgroundColor: project.color || '#6366f1' }}
                          ></div>
                          <p className="text-sm font-medium text-primary-600 truncate">{project.name}</p>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(projectStatus)}`}>
                            {projectStatus}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <p className="flex items-center text-sm text-gray-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          {project.description}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          {dateRange}
                        </p>
                      </div>
                      
                      {phases.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Phases</h4>
                          <div className="space-y-2">
                            {phases.slice(0, 3).map((phase) => (
                              <div 
                                key={phase.id} 
                                className="bg-gray-100 rounded-md p-2"
                                onClick={() => {
                                  selectPhase(phase);
                                  openModal('taskDrawer');
                                }}
                              >
                                <div className="flex justify-between">
                                  <span className="text-sm font-medium">{phase.name}</span>
                                  <span className={`text-xs ${getStatusColor(phase.status.replace('_', ' '))}`}>
                                    {phase.status.replace('_', ' ')}
                                  </span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                  <span>{formatDateRange(phase.startDate, phase.endDate)}</span>
                                  <span>{getProgressPercentage(phase.progress)}%</span>
                                </div>
                                {phase.progress > 0 && (
                                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                                    <div 
                                      className="bg-primary h-1.5 rounded-full" 
                                      style={{ width: `${getProgressPercentage(phase.progress)}%` }}
                                    ></div>
                                  </div>
                                )}
                              </div>
                            ))}
                            
                            {phases.length > 3 && (
                              <p className="text-xs text-gray-500 text-center">
                                {phases.length - 3} more phases...
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-4 flex space-x-2">
                        <Button variant="outline" size="sm" className="text-primary-700 bg-primary-100 hover:bg-primary-200 border-primary-200"
                          onClick={() => {
                            selectProject(project);
                            openModal('projectDetails');
                          }}
                        >
                          View Details
                        </Button>
                        <Button variant="outline" size="sm"
                          onClick={() => {
                            selectProject(project);
                            openModal('createPhase');
                          }}
                        >
                          Add Phase
                        </Button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
};

export default MobileProjectList;
