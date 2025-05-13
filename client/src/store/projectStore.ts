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

export const useProjectStore = create<ProjectState>()(
  devtools((set, get) => ({
    projects: [],
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
          
        if (error) throw error;
        
        set({ projects: data, isLoading: false });
      } catch (error: any) {
        set({ 
          isLoading: false, 
          error: error.message || 'Failed to fetch projects' 
        });
      }
    },
    
    createProject: async (project) => {
      try {
        console.log('Creating project with data:', project);
        set({ isLoading: true, error: null });
        
        // Check if the projects table exists first
        const { data: existingTables, error: tablesError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public');
          
        console.log('Existing tables:', existingTables, 'Error:', tablesError);
        
        // Attempt to create the project
        const { data, error } = await supabase
          .from('projects')
          .insert(project)
          .select()
          .single();
          
        if (error) {
          console.error('Project creation error:', error);
          throw error;
        }
        
        console.log('Project created successfully:', data);
        const projects = [...get().projects, data];
        set({ projects, isLoading: false });
        return data;
      } catch (error: any) {
        console.error('Project creation failed:', error);
        set({ 
          isLoading: false, 
          error: error.message || 'Failed to create project' 
        });
        
        // Try to run our schema creation
        try {
          console.log('Attempting to create schema tables...');
          const schemaResult = await fetch('/api/create-schema', {
            method: 'POST',
          });
          console.log('Schema creation attempt result:', schemaResult);
        } catch (schemaError) {
          console.error('Schema creation failed:', schemaError);
        }
        
        throw error;
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
