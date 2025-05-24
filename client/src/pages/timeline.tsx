import { Helmet } from 'react-helmet';
import { useEffect, useState } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { Project, Phase } from '@shared/schema';
import RoadmapTimeline from '@/components/project/RoadmapTimeline';
import TaskDrawer from '@/components/project/TaskDrawer';
import EditProjectModal from '@/components/project/EditProjectModal';
import CreateProjectModal from '@/components/project/CreateProjectModal';
import MobileProjectList from '@/components/project/MobileProjectList';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/store/uiStore';

const Timeline = () => {
  const { projects, fetchProjects, isLoading, fetchPhases } = useProjectStore();
  const { openModal } = useUIStore();
  const [projectPhases, setProjectPhases] = useState<{[key: number]: Phase[]}>({});
  const [timelineStartDate, setTimelineStartDate] = useState<Date>(new Date(new Date().getFullYear(), 0, 1));
  
  useEffect(() => {
    fetchProjects();
    
    // Set up a refresh interval to catch any updates, but much less frequently
    const refreshInterval = setInterval(() => {
      fetchProjects();
    }, 60000); // Refresh every 60 seconds
    
    return () => clearInterval(refreshInterval);
  }, [fetchProjects]);
  
  useEffect(() => {
    const fetchPhasesForProjects = async () => {
      const phases: {[key: number]: Phase[]} = {};
      
      for (const project of projects) {
        try {
          const projectPhases = await fetchPhases(project.id);
          phases[project.id] = projectPhases;
        } catch (error) {
          console.error(`Failed to fetch phases for project ${project.id}:`, error);
        }
      }
      
      setProjectPhases(phases);
    };
    
    if (projects.length > 0) {
      fetchPhasesForProjects();
    }
  }, [projects, fetchPhases]);
  
  // Find the earliest phase start date to set as timeline start if needed
  useEffect(() => {
    if (Object.keys(projectPhases).length > 0) {
      const allPhases = Object.values(projectPhases).flat();
      if (allPhases.length > 0) {
        const startDates = allPhases.map(p => new Date(p.start_date).getTime());
        const earliestDate = new Date(Math.min(...startDates));
        
        // Set to the first day of the month for the earliest phase
        setTimelineStartDate(new Date(earliestDate.getFullYear(), earliestDate.getMonth(), 1));
      }
    }
  }, [projectPhases]);
  
  const handleCreateProject = () => {
    openModal('createProject');
  };

  return (
    <>
      <Helmet>
        <title>Project Timeline - ProjectSync</title>
        <meta name="description" content="View and manage all your projects on a Gantt-style timeline with ProjectSync." />
      </Helmet>
      
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
      
      {/* Desktop Timeline */}
      <div className="hidden md:block px-4 sm:px-6 lg:px-8 pb-4">
        <div className="border rounded-md overflow-hidden">
          <div className="max-h-[70vh] overflow-y-auto">
            <RoadmapTimeline 
              projects={projects} 
              phases={projectPhases}
              timelineStartDate={timelineStartDate}
            />
          </div>
        </div>
      </div>
      
      {/* Mobile Timeline - Preserve Replit's original mobile view */}
      <div className="md:hidden">
        <MobileProjectList 
          isLoading={isLoading} 
          projects={projects} 
          projectPhases={projectPhases} 
        />
      </div>
      
      <TaskDrawer />
      <EditProjectModal />
      <CreateProjectModal />
    </>
  );
};

export default Timeline;
