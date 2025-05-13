import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useProjectStore } from '@/store/projectStore';
import { Project, Phase } from '@shared/schema';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDateRange } from '@/lib/date';
import { useUIStore } from '@/store/uiStore';
import CreateProjectModal from '@/components/project/CreateProjectModal';
import EditProjectModal from '@/components/project/EditProjectModal';
import CreatePhaseModal from '@/components/project/CreatePhaseModal';
import { Skeleton } from '@/components/ui/skeleton';
import StatusBadge from '@/components/ui/status-badge';

const Projects = () => {
  const { projects, fetchProjects, selectProject, isLoading, fetchPhases } = useProjectStore();
  const { openModal } = useUIStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [projectPhases, setProjectPhases] = useState<{[key: number]: Phase[]}>({});
  
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
  
  const getProjectStatus = (projectId: number) => {
    const phases = projectPhases[projectId] || [];
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
  
  const getProjectDateRange = (projectId: number) => {
    const phases = projectPhases[projectId] || [];
    if (!phases.length) return 'No phases';
    
    const startDates = phases.map(p => new Date(p.startDate).getTime());
    const endDates = phases.map(p => new Date(p.endDate).getTime());
    
    const earliestStart = new Date(Math.min(...startDates));
    const latestEnd = new Date(Math.max(...endDates));
    
    return formatDateRange(earliestStart, latestEnd);
  };
  
  const calculateProjectProgress = (projectId: number) => {
    const phases = projectPhases[projectId] || [];
    if (!phases.length) return 0;
    
    const totalProgress = phases.reduce((acc, phase) => acc + phase.progress, 0);
    return Math.round(totalProgress / phases.length);
  };

  return (
    <>
      <Helmet>
        <title>Projects - ProjectSync</title>
        <meta name="description" content="Manage all your projects with ProjectSync." />
      </Helmet>
      
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
            <p className="mt-1 text-sm text-gray-500">
              View and manage all your projects
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
        
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((_, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-5 w-24 mb-1" />
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-2 w-full" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-9 w-20 mr-2" />
                  <Skeleton className="h-9 w-20" />
                </CardFooter>
              </Card>
            ))}
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => {
              const progress = calculateProjectProgress(project.id);
              const status = getProjectStatus(project.id);
              const dateRange = getProjectDateRange(project.id);
              const phases = projectPhases[project.id] || [];
              
              return (
                <Card key={project.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: project.color || '#6366f1' }}
                        ></div>
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEditProject(project)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        <span className="sr-only">Edit project</span>
                      </Button>
                    </div>
                    <CardDescription>{project.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-700">{dateRange}</span>
                        <StatusBadge 
                          status={status.toLowerCase().replace(' ', '_')} 
                          type="phase" 
                        />
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                        <div 
                          className="bg-primary h-2.5 rounded-full" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 text-right">{progress}% complete</div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Phases ({phases.length})</h4>
                      {phases.length === 0 ? (
                        <p className="text-xs text-gray-500">No phases added yet</p>
                      ) : (
                        <ul className="space-y-1">
                          {phases.slice(0, 3).map((phase) => (
                            <li key={phase.id} className="flex justify-between items-center text-xs">
                              <span className="truncate">{phase.name}</span>
                              <StatusBadge status={phase.status} type="phase" className="text-[10px] px-1.5 py-0" />
                            </li>
                          ))}
                          {phases.length > 3 && (
                            <li className="text-xs text-gray-500">
                              +{phases.length - 3} more phases
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleAddPhase(project)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Add Phase
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      
      <CreateProjectModal />
      <EditProjectModal />
      <CreatePhaseModal />
    </>
  );
};

export default Projects;
