import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useProjectStore } from '@/store/projectStore';
import { Project, Phase } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUIStore } from '@/store/uiStore';
import CreateProjectModal from '@/components/project/CreateProjectModal';
import EditProjectModal from '@/components/project/EditProjectModal';
import CreatePhaseModal from '@/components/project/CreatePhaseModal';
import { Skeleton } from '@/components/ui/skeleton';
import RoadmapTimeline from '@/components/project/RoadmapTimeline';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Roadmap = () => {
  const { projects, fetchProjects, selectProject, isLoading, fetchPhases } = useProjectStore();
  const { openModal } = useUIStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [projectPhases, setProjectPhases] = useState<{[key: number]: Phase[]}>({});
  const [timelineStartDate, setTimelineStartDate] = useState<Date>(new Date(new Date().getFullYear(), 0, 1));
  
  useEffect(() => {
    fetchProjects();
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
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProjects(projects);
    } else {
      const filtered = projects.filter(project => 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProjects(filtered);
    }
  }, [projects, searchTerm]);
  
  const handleCreateProject = () => {
    openModal('createProject');
  };
  
  const handleEditProject = (project: Project) => {
    selectProject(project);
    openModal('editProject');
  };
  
  const handleAddPhase = (project: Project) => {
    selectProject(project);
    openModal('createPhase');
  };

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

  return (
    <>
      <Helmet>
        <title>Roadmap - ProjectSync</title>
        <meta name="description" content="View your project roadmap with ProjectSync." />
      </Helmet>
      
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold text-gray-900">Project Roadmap</h1>
            <p className="mt-1 text-sm text-gray-500">
              View all your projects in a timeline
            </p>
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
        <div className="mb-4">
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
        
        <Tabs defaultValue="roadmap" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="roadmap">Roadmap View</TabsTrigger>
            <TabsTrigger value="fiscal">Fiscal Year</TabsTrigger>
          </TabsList>
          
          <TabsContent value="roadmap" className="w-full">
            {isLoading ? (
              <div className="w-full h-64 flex items-center justify-center">
                <Skeleton className="h-48 w-full" />
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">No projects found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'Try a different search term or clear the search.' : 'Get started by creating a new project.'}
                </p>
                <div className="mt-6">
                  <Button onClick={handleCreateProject}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Create Your First Project
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <div className="max-h-[70vh] overflow-y-auto">
                  <RoadmapTimeline 
                    projects={filteredProjects} 
                    phases={projectPhases}
                    timelineStartDate={timelineStartDate}
                  />
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="fiscal">
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-900">Fiscal Year View</h3>
              <p className="mt-1 text-sm text-gray-500">
                Coming soon! This view will allow you to see projects by fiscal year.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <CreateProjectModal />
      <EditProjectModal projectPhases={selectedProject ? projectPhases[selectedProject.id] : undefined} />
      <CreatePhaseModal />
    </>
  );
};

export default Roadmap;
