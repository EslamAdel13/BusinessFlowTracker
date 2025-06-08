import { useEffect, useState } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { Project, Phase } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useUIStore } from '@/store/uiStore';
import { getMonthsForTimeline } from '@/lib/date';
import TimelineMonths from './TimelineMonths';
import ProjectRow from './ProjectRow';
import MobileProjectList from './MobileProjectList';
import CreateProjectModal from './CreateProjectModal';

const ProjectTimeline = () => {
  const { projects, fetchProjects, isLoading } = useProjectStore();
  const { timelineStartDate, openModal } = useUIStore();
  const [projectPhases, setProjectPhases] = useState<{[key: number]: Phase[]}>({});
  const [months, setMonths] = useState<string[]>([]);
  
  useEffect(() => {
    fetchProjects();
    
    // Set up a refresh interval to catch any updates, but much less frequently
    // to avoid excessive API calls and improve performance
    const refreshInterval = setInterval(() => {
      fetchProjects();
    }, 60000); // Refresh every 60 seconds instead of every 5 seconds
    
    return () => clearInterval(refreshInterval);
  }, [fetchProjects]);
  
  useEffect(() => {
    setMonths(getMonthsForTimeline(timelineStartDate));
  }, [timelineStartDate]);
  
  const fetchPhasesForProjects = async () => {
    const phases: {[key: number]: Phase[]} = {};
    console.log('Fetching phases for projects:', projects);
    
    for (const project of projects) {
      try {
        console.log(`Fetching phases for project ${project.id}`);
        const projectPhases = await useProjectStore.getState().fetchPhases(project.id);
        console.log(`Received phases for project ${project.id}:`, projectPhases);
        
        // Ensure we have valid phases with proper dates
        const validPhases = projectPhases.map(phase => {
          // Make sure start_date and end_date are valid
          if (!phase.start_date) {
            console.warn(`Phase ${phase.id} has no start_date, using project start date`);
            phase.start_date = project.start_date;
          }
          if (!phase.end_date) {
            console.warn(`Phase ${phase.id} has no end_date, using project end date`);
            phase.end_date = project.end_date;
          }
          return phase;
        });
        
        phases[project.id] = validPhases;
      } catch (error) {
        console.error(`Failed to fetch phases for project ${project.id}:`, error);
      }
    }
    
    console.log('Setting project phases:', phases);
    setProjectPhases(phases);
  };
  
  useEffect(() => {
    if (projects.length > 0) {
      fetchPhasesForProjects();
    }
  }, [projects]);
  
  const handleCreateProject = () => {
    openModal('createProject');
  };
  
  const renderSkeletonRows = () => {
    return Array(3).fill(0).map((_, index) => (
      <div key={index} className="hover:bg-gray-50 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-64 pl-6 pr-2 py-4 whitespace-nowrap">
            <div className="flex items-center">
              <Skeleton className="h-3 w-3 rounded-full mr-3" />
              <div>
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>
          
          <div className="flex-1 relative">
            <div className="timeline-months" style={{ height: '60px' }}>
              <Skeleton className="absolute top-4 left-10 h-7 w-24" />
              <Skeleton className="absolute top-4 left-40 h-7 w-32" />
            </div>
          </div>
          
          <div className="pr-6 py-4 whitespace-nowrap text-right">
            <Skeleton className="inline-block h-5 w-5 mr-3" />
            <Skeleton className="inline-block h-5 w-5" />
          </div>
        </div>
      </div>
    ));
  };

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold text-gray-900">Project Timeline</h1>
            <p className="mt-1 text-sm text-gray-500">View and manage all your project phases in one place</p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Button onClick={handleCreateProject}>
              <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              New Project
            </Button>
          </div>
        </div>
      </div>
      
      <div className="px-4 sm:px-6 lg:px-8 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col sm:flex-row sm:space-x-4 mb-4 sm:mb-0">
            <div className="relative mb-2 sm:mb-0">
              <select className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                <option>All Projects</option>
                <option>My Projects</option>
                <option>Shared Projects</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            
            <div className="relative">
              <select className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                <option>All Statuses</option>
                <option>Not Started</option>
                <option>In Progress</option>
                <option>Completed</option>
                <option>Overdue</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
              </svg>
              Filter
            </Button>
            
            <Button variant="outline" size="sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              Search
            </Button>
          </div>
        </div>
      </div>
      
      {/* Desktop Timeline */}
      <div className="hidden md:block px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Timeline Header - Fixed to prevent scrolling with content */}
          <div className="border-b border-gray-200 sticky top-0 bg-white z-20">
            <div className="flex">
              <div className="w-64 pl-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-white z-10">
                Project
              </div>
              <div className="flex-1 overflow-x-auto custom-scrollbar">
                <TimelineMonths months={months} monthWidth={100} />
              </div>
            </div>
          </div>
          
          {/* Project Rows & Gantt Chart */}
          <div className="timeline-container relative">
            <div className="custom-scrollbar" style={{ 
              maxHeight: 'calc(100vh - 260px)', 
              overflowY: 'auto', 
              overflowX: 'auto',
              width: '100%',
              minWidth: `${months.length * 100 + 256}px` // 256px for project name column
            }}>
              {isLoading ? (
                renderSkeletonRows()
              ) : (
                projects.map((project: Project) => (
                  <ProjectRow 
                    key={project.id} 
                    project={project} 
                    phases={projectPhases[project.id] || []} 
                    timelineStartDate={timelineStartDate}
                    monthWidth={100}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Timeline */}
      <MobileProjectList 
        isLoading={isLoading} 
        projects={projects} 
        projectPhases={projectPhases} 
      />
      
      {/* Project Modal */}
      <CreateProjectModal />
    </>
  );
};

export default ProjectTimeline;
