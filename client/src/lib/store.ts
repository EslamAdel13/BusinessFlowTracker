import { create } from 'zustand';
import { Project, Phase, Task, User } from '@shared/schema';
import { queryClient } from './queryClient';

type DrawerType = 'phase' | 'task';

interface AppState {
  // Drawer state
  isDrawerOpen: boolean;
  drawerType: DrawerType;
  drawerData: Phase | Task | null;
  
  // Modal states
  isCreateProjectModalOpen: boolean;
  isCreatePhaseModalOpen: boolean;
  isCreateTaskModalOpen: boolean;
  
  // Currently selected items
  selectedProject: Project | null;
  selectedPhase: Phase | null;
  selectedTask: Task | null;
  
  // Filter states
  statusFilter: string | null;
  projectFilter: string | null;
  taskFilter: 'all' | 'my';
  
  // Actions
  openDrawer: (type: DrawerType, data: Phase | Task) => void;
  closeDrawer: () => void;
  
  openCreateProjectModal: () => void;
  closeCreateProjectModal: () => void;
  
  openCreatePhaseModal: (projectId?: number) => void;
  closeCreatePhaseModal: () => void;
  
  openCreateTaskModal: (phaseId?: number) => void;
  closeCreateTaskModal: () => void;
  
  setSelectedProject: (project: Project | null) => void;
  setSelectedPhase: (phase: Phase | null) => void;
  setSelectedTask: (task: Task | null) => void;
  
  setStatusFilter: (status: string | null) => void;
  setProjectFilter: (projectId: string | null) => void;
  setTaskFilter: (filter: 'all' | 'my') => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial drawer state
  isDrawerOpen: false,
  drawerType: 'phase',
  drawerData: null,
  
  // Initial modal states
  isCreateProjectModalOpen: false,
  isCreatePhaseModalOpen: false,
  isCreateTaskModalOpen: false,
  
  // Initial selections
  selectedProject: null,
  selectedPhase: null,
  selectedTask: null,
  
  // Initial filters
  statusFilter: null,
  projectFilter: null,
  taskFilter: 'all',
  
  // Drawer actions
  openDrawer: (type, data) => set({ isDrawerOpen: true, drawerType: type, drawerData: data }),
  closeDrawer: () => set({ isDrawerOpen: false, drawerData: null }),
  
  // Project modal actions
  openCreateProjectModal: () => set({ isCreateProjectModalOpen: true }),
  closeCreateProjectModal: () => set({ isCreateProjectModalOpen: false }),
  
  // Phase modal actions
  openCreatePhaseModal: (projectId) => set((state) => ({
    isCreatePhaseModalOpen: true,
    selectedProject: projectId && !state.selectedProject 
      ? queryClient.getQueryData<Project[]>(['/api/projects'])?.find(p => p.id === projectId) || null
      : state.selectedProject
  })),
  closeCreatePhaseModal: () => set({ isCreatePhaseModalOpen: false }),
  
  // Task modal actions
  openCreateTaskModal: (phaseId) => set((state) => ({
    isCreateTaskModalOpen: true,
    selectedPhase: phaseId && !state.selectedPhase
      ? queryClient.getQueryData<Phase[]>(['/api/projects', state.selectedProject?.id, 'phases'])?.find(p => p.id === phaseId) || null 
      : state.selectedPhase
  })),
  closeCreateTaskModal: () => set({ isCreateTaskModalOpen: false }),
  
  // Selection actions
  setSelectedProject: (project) => set({ selectedProject: project }),
  setSelectedPhase: (phase) => set({ selectedPhase: phase }),
  setSelectedTask: (task) => set({ selectedTask: task }),
  
  // Filter actions
  setStatusFilter: (status) => set({ statusFilter: status }),
  setProjectFilter: (projectId) => set({ projectFilter: projectId }),
  setTaskFilter: (filter) => set({ taskFilter: filter }),
}));

// Company logo and color settings
interface CompanySettings {
  logo: string | null;
  color: string | null;
  setLogo: (logo: string) => void;
  setColor: (color: string) => void;
}

export const useCompanySettings = create<CompanySettings>((set) => ({
  logo: null,
  color: null,
  setLogo: (logo) => set({ logo }),
  setColor: (color) => set({ color }),
}));
