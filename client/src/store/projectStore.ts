import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Project, Phase } from '@shared/schema';
import { supabase } from '@/lib/supabase';
import { isOverdue } from '@/lib/utils';

interface ProjectState {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  selectedProject: Project | null;
  selectedPhase: Phase | null;
  
  fetchProjects: () => Promise<void>;
  createProject: (project: Omit<Project, 'id'>) => Promise<Project>;
  updateProject: (id: number, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
  
  fetchPhases: (projectId: number) => Promise<Phase[]>;
  createPhase: (phase: Omit<Phase, 'id'>) => Promise<Phase>;
  updatePhase: (id: number, data: Partial<Phase>) => Promise<void>;
  deletePhase: (id: number) => Promise<void>;
  
  selectProject: (project: Project | null) => void;
  selectPhase: (phase: Phase | null) => void;
  
  updatePhaseStatus: (phase: Phase) => Promise<void>;
}

// Load initial projects from localStorage if available
const loadLocalProjects = (): Project[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const savedProjects = localStorage.getItem('projectsync_projects');
    return savedProjects ? JSON.parse(savedProjects) : [];
  } catch (e) {
    console.error('Failed to load projects from localStorage:', e);
    return [];
  }
};

// Save projects to localStorage
const saveLocalProjects = (projects: Project[]) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('projectsync_projects', JSON.stringify(projects));
  } catch (e) {
    console.error('Failed to save projects to localStorage:', e);
  }
};

export const useProjectStore = create<ProjectState>()(
  devtools((set, get) => ({
    projects: loadLocalProjects(),
    isLoading: false,
    error: null,
    selectedProject: null,
    selectedPhase: null,
    
    fetchProjects: async () => {
      try {
        set({ isLoading: true, error: null });
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('id', { ascending: true });
          
        if (error) {
          console.error('Error fetching projects from Supabase:', error);
          
          // Use localStorage projects as fallback
          const localProjects = loadLocalProjects();
          console.log('Using local projects as fallback:', localProjects);
          set({ projects: localProjects, isLoading: false });
          return;
        }
        
        // Store in localStorage for offline access
        saveLocalProjects(data);
        set({ projects: data, isLoading: false });
      } catch (error: any) {
        console.error('Failed to fetch projects:', error);
        // Use localStorage as fallback
        const localProjects = loadLocalProjects();
        set({ 
          projects: localProjects,
          isLoading: false, 
          error: error.message || 'Failed to fetch projects' 
        });
      }
    },
    
    createProject: async (project) => {
      try {
        console.log('Creating project with data:', project);
        set({ isLoading: true, error: null });
        
        // Attempt to create the project in Supabase
        const { data, error } = await supabase
          .from('projects')
          .insert(project)
          .select()
          .single();
          
        if (error) {
          console.error('Project creation error:', error);
          
          // Create a local project with an ID
          const localProjects = loadLocalProjects();
          const maxId = localProjects.length > 0 
            ? Math.max(...localProjects.map(p => p.id)) 
            : 0;
          
          const localProject = {
            ...project,
            id: maxId + 1,
            createdAt: new Date().toISOString()
          } as unknown as Project;
          
          console.log('Created local project:', localProject);
          
          // Save to localStorage and update state
          const updatedProjects = [...get().projects, localProject];
          saveLocalProjects(updatedProjects);
          set({ projects: updatedProjects, isLoading: false });
          return localProject;
        }
        
        console.log('Project created successfully in Supabase:', data);
        const projects = [...get().projects, data];
        // Update localStorage
        saveLocalProjects(projects);
        set({ projects, isLoading: false });
        return data;
      } catch (error: any) {
        console.error('Project creation failed:', error);
        set({ 
          isLoading: false, 
          error: error.message || 'Failed to create project' 
        });
        // Even on error, create a local version
        try {
          const localProjects = loadLocalProjects();
          const maxId = localProjects.length > 0 
            ? Math.max(...localProjects.map(p => p.id)) 
            : 0;
          
          const localProject = {
            ...project,
            id: maxId + 1,
            createdAt: new Date().toISOString()
          } as unknown as Project;
          
          const updatedProjects = [...get().projects, localProject];
          saveLocalProjects(updatedProjects);
          set({ projects: updatedProjects });
          return localProject;
        } catch (localError) {
          console.error('Failed to create local project:', localError);
          throw error;
        }
      }
    },
    
    updateProject: async (id, data) => {
      try {
        set({ isLoading: true, error: null });
        const { error } = await supabase
          .from('projects')
          .update(data)
          .eq('id', id);
          
        if (error) throw error;
        
        const projects = get().projects.map(project => 
          project.id === id ? { ...project, ...data } : project
        );
        
        set({ projects, isLoading: false });
      } catch (error: any) {
        set({ 
          isLoading: false, 
          error: error.message || 'Failed to update project' 
        });
        throw error;
      }
    },
    
    deleteProject: async (id) => {
      try {
        set({ isLoading: true, error: null });
        const { error } = await supabase
          .from('projects')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        const projects = get().projects.filter(project => project.id !== id);
        set({ projects, isLoading: false });
      } catch (error: any) {
        set({ 
          isLoading: false, 
          error: error.message || 'Failed to delete project' 
        });
        throw error;
      }
    },
    
    fetchPhases: async (projectId) => {
      try {
        set({ isLoading: true, error: null });
        const { data, error } = await supabase
          .from('phases')
          .select('*')
          .eq('projectId', projectId)
          .order('startDate', { ascending: true });
          
        if (error) throw error;
        
        set({ isLoading: false });
        return data;
      } catch (error: any) {
        set({ 
          isLoading: false, 
          error: error.message || 'Failed to fetch phases' 
        });
        throw error;
      }
    },
    
    createPhase: async (phase) => {
      try {
        set({ isLoading: true, error: null });
        const { data, error } = await supabase
          .from('phases')
          .insert(phase)
          .select()
          .single();
          
        if (error) throw error;
        
        set({ isLoading: false });
        return data;
      } catch (error: any) {
        set({ 
          isLoading: false, 
          error: error.message || 'Failed to create phase' 
        });
        throw error;
      }
    },
    
    updatePhase: async (id, data) => {
      try {
        set({ isLoading: true, error: null });
        const { error } = await supabase
          .from('phases')
          .update(data)
          .eq('id', id);
          
        if (error) throw error;
        
        // If we have the selectedPhase and it's being updated
        const selectedPhase = get().selectedPhase;
        if (selectedPhase && selectedPhase.id === id) {
          set({ selectedPhase: { ...selectedPhase, ...data } });
        }
        
        set({ isLoading: false });
      } catch (error: any) {
        set({ 
          isLoading: false, 
          error: error.message || 'Failed to update phase' 
        });
        throw error;
      }
    },
    
    deletePhase: async (id) => {
      try {
        set({ isLoading: true, error: null });
        const { error } = await supabase
          .from('phases')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        // If we have the selectedPhase and it's being deleted
        const selectedPhase = get().selectedPhase;
        if (selectedPhase && selectedPhase.id === id) {
          set({ selectedPhase: null });
        }
        
        set({ isLoading: false });
      } catch (error: any) {
        set({ 
          isLoading: false, 
          error: error.message || 'Failed to delete phase' 
        });
        throw error;
      }
    },
    
    selectProject: (project) => {
      set({ selectedProject: project });
    },
    
    selectPhase: (phase) => {
      set({ selectedPhase: phase });
    },
    
    updatePhaseStatus: async (phase) => {
      try {
        let status = phase.status;
        const progress = phase.progress || 0;
        
        if (progress === 100) {
          status = 'completed';
        } else if (progress > 0) {
          status = 'in_progress';
        } else if (isOverdue(phase.endDate)) {
          status = 'overdue';
        } else {
          status = 'not_started';
        }
        
        // Only update if status changed
        if (status !== phase.status) {
          await get().updatePhase(phase.id, { status });
        }
      } catch (error: any) {
        set({ 
          error: error.message || 'Failed to update phase status' 
        });
      }
    }
  }))
);
