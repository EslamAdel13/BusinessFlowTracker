import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useProjectStore } from '@/store/projectStore';
import { useTaskStore } from '@/store/taskStore';
import { Task, Phase, Project } from '@shared/schema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import TaskItem from '@/components/task/TaskItem';
import { isOverdue, isWithinDays } from '@/lib/utils';

const Tasks = () => {
  const { projects, fetchProjects, isLoading: projectsLoading } = useProjectStore();
  const { tasks, fetchTasks, isLoading: tasksLoading } = useTaskStore();
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [phaseMap, setPhaseMap] = useState<{[key: number]: Phase}>({});
  const [projectMap, setProjectMap] = useState<{[key: number]: Project}>({});
  
  // Fetch projects first
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);
  
  // Create a map of projects by ID for easy lookup
  useEffect(() => {
    if (projects.length > 0) {
      const map: {[key: number]: Project} = {};
      projects.forEach(project => {
        map[project.id] = project;
      });
      setProjectMap(map);
    }
  }, [projects]);
  
  // Fetch all phases and tasks for each project
  useEffect(() => {
    const fetchAllPhasesAndTasks = async () => {
      const phasesMap: {[key: number]: Phase} = {};
      const tasksArray: Task[] = [];
      
      for (const project of projects) {
        try {
          const phases = await useProjectStore.getState().fetchPhases(project.id);
          
          // Add phases to map
          phases.forEach(phase => {
            phasesMap[phase.id] = phase;
          });
          
          // Fetch tasks for each phase
          for (const phase of phases) {
            const phaseTasks = await fetchTasks(phase.id);
            tasksArray.push(...phaseTasks);
          }
        } catch (error) {
          console.error(`Failed to fetch phases/tasks for project ${project.id}:`, error);
        }
      }
      
      setPhaseMap(phasesMap);
      setAllTasks(tasksArray);
      setFilteredTasks(tasksArray);
    };
    
    if (projects.length > 0) {
      fetchAllPhasesAndTasks();
    }
  }, [projects, fetchTasks]);
  
  // Filter tasks based on search term and active tab
  useEffect(() => {
    let filtered = [...allTasks];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(task => 
        task.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply tab filter
    switch (activeTab) {
      case 'upcoming':
        filtered = filtered.filter(task => 
          !isOverdue(task.dueDate) && 
          isWithinDays(task.dueDate, 7) && 
          task.status !== 'done'
        );
        break;
      case 'overdue':
        filtered = filtered.filter(task => 
          isOverdue(task.dueDate) && task.status !== 'done'
        );
        break;
      case 'completed':
        filtered = filtered.filter(task => task.status === 'done');
        break;
    }
    
    setFilteredTasks(filtered);
  }, [allTasks, searchTerm, activeTab]);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  // Count tasks for badges
  const upcomingCount = allTasks.filter(task => 
    !isOverdue(task.dueDate) && 
    isWithinDays(task.dueDate, 7) && 
    task.status !== 'done'
  ).length;
  
  const overdueCount = allTasks.filter(task => 
    isOverdue(task.dueDate) && task.status !== 'done'
  ).length;
  
  const completedCount = allTasks.filter(task => 
    task.status === 'done'
  ).length;

  return (
    <>
      <Helmet>
        <title>My Tasks - ProjectSync</title>
        <meta name="description" content="Manage all your tasks across different projects with ProjectSync." />
      </Helmet>
      
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold text-gray-900">My Tasks</h1>
            <p className="mt-1 text-sm text-gray-500">
              View and manage all your tasks across different projects
            </p>
          </div>
        </div>
      </div>
      
      <div className="px-4 sm:px-6 lg:px-8 pb-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Tasks</CardTitle>
              <div className="w-full max-w-sm ml-4">
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="h-8"
                />
              </div>
            </div>
            <CardDescription>
              Manage your tasks and keep track of deadlines
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
              <TabsList>
                <TabsTrigger value="all">
                  All Tasks
                  <Badge variant="secondary" className="ml-2">
                    {allTasks.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="upcoming">
                  Upcoming
                  <Badge variant="secondary" className="ml-2">
                    {upcomingCount}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="overdue">
                  Overdue
                  <Badge variant="destructive" className="ml-2">
                    {overdueCount}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed
                  <Badge variant="outline" className="ml-2">
                    {completedCount}
                  </Badge>
                </TabsTrigger>
              </TabsList>
              
              <div className="mt-4">
                {projectsLoading || tasksLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((_, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <Skeleton className="h-4 w-4 mt-1" />
                        <div className="flex-1">
                          <Skeleton className="h-6 w-3/4 mb-1" />
                          <Skeleton className="h-4 w-1/4 mb-2" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredTasks.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="text-gray-400 mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className="text-gray-600 font-medium">No tasks found</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      {searchTerm ? 'Try a different search term' : 'You have no tasks in this category'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredTasks.map(task => (
                      <div key={task.id} className="group">
                        <TaskItem 
                          task={task} 
                          phaseId={task.phaseId}
                          onStatusChange={() => {
                            // Recalculate all tasks to update the UI
                            const updatedTasks = allTasks.map(t => 
                              t.id === task.id 
                                ? { ...t, status: t.status === 'done' ? 'todo' : t.status === 'doing' ? 'done' : 'doing' } 
                                : t
                            );
                            setAllTasks(updatedTasks);
                          }}
                        />
                        <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-gray-500 pl-8">
                          <span className="font-medium">{projectMap[task.projectId]?.name}</span>
                          {' > '}
                          <span>{phaseMap[task.phaseId]?.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Tasks;
