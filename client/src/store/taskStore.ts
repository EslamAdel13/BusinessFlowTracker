import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Task } from '@shared/schema';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './authStore';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  filterMode: 'all' | 'my';
  
  fetchTasks: (phaseId: number) => Promise<Task[]>;
  createTask: (task: Omit<Task, 'id'>) => Promise<Task>;
  updateTask: (id: number, data: Partial<Task>) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  
  toggleTaskStatus: (task: Task) => Promise<void>;
  reorderTasks: (taskIds: number[]) => Promise<void>;
  setFilterMode: (mode: 'all' | 'my') => void;
  getFilteredTasks: (phaseId: number) => Task[];
}

export const useTaskStore = create<TaskState>()(
  devtools((set, get) => ({
    tasks: [],
    isLoading: false,
    error: null,
    filterMode: 'all',
    
    fetchTasks: async (phaseId) => {
      try {
        set({ isLoading: true, error: null });
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('phase_id', phaseId)
          .order('priority', { ascending: true });
          
        if (error) throw error;
        
        set({ tasks: data, isLoading: false });
        return data;
      } catch (error: any) {
        set({ 
          isLoading: false, 
          error: error.message || 'Failed to fetch tasks' 
        });
        throw error;
      }
    },
    
    createTask: async (task) => {
      try {
        set({ isLoading: true, error: null });
        const { data, error } = await supabase
          .from('tasks')
          .insert(task)
          .select()
          .single();
          
        if (error) throw error;
        
        const tasks = [...get().tasks, data];
        set({ tasks, isLoading: false });
        return data;
      } catch (error: any) {
        set({ 
          isLoading: false, 
          error: error.message || 'Failed to create task' 
        });
        throw error;
      }
    },
    
    updateTask: async (id, data) => {
      try {
        set({ isLoading: true, error: null });
        const { error } = await supabase
          .from('tasks')
          .update(data)
          .eq('id', id);
          
        if (error) throw error;
        
        const tasks = get().tasks.map(task => 
          task.id === id ? { ...task, ...data } : task
        );
        
        set({ tasks, isLoading: false });
      } catch (error: any) {
        set({ 
          isLoading: false, 
          error: error.message || 'Failed to update task' 
        });
        throw error;
      }
    },
    
    deleteTask: async (id) => {
      try {
        set({ isLoading: true, error: null });
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        const tasks = get().tasks.filter(task => task.id !== id);
        set({ tasks, isLoading: false });
      } catch (error: any) {
        set({ 
          isLoading: false, 
          error: error.message || 'Failed to delete task' 
        });
        throw error;
      }
    },
    
    toggleTaskStatus: async (task) => {
      try {
        const newStatus = task.status === 'done' ? 'todo' : 
                         task.status === 'doing' ? 'done' : 'doing';
        
        await get().updateTask(task.id, { status: newStatus });
      } catch (error: any) {
        set({ 
          error: error.message || 'Failed to toggle task status' 
        });
      }
    },
    
    reorderTasks: async (taskIds) => {
      try {
        set({ isLoading: true, error: null });
        
        // Update the priority of each task based on its position in the array
        for (let i = 0; i < taskIds.length; i++) {
          await supabase
            .from('tasks')
            .update({ priority: i })
            .eq('id', taskIds[i]);
        }
        
        // Fetch the tasks again to get the updated order
        const firstTaskId = taskIds[0];
        const firstTask = get().tasks.find(t => t.id === firstTaskId);
        
        if (firstTask) {
          await get().fetchTasks(firstTask.phaseId);
        }
        
        set({ isLoading: false });
      } catch (error: any) {
        set({ 
          isLoading: false, 
          error: error.message || 'Failed to reorder tasks' 
        });
      }
    },
    
    setFilterMode: (mode) => {
      set({ filterMode: mode });
    },
    
    getFilteredTasks: (phaseId) => {
      const { tasks, filterMode } = get();
      const currentUser = useAuthStore.getState().user;
      
      console.log('Filtering tasks for phase:', phaseId);
      console.log('Available tasks:', tasks);
      
      // First filter by phaseId (using phase_id to match database schema)
      const phaseTasks = tasks.filter(task => task.phase_id === phaseId);
      
      console.log('Filtered tasks for phase:', phaseTasks);
      
      // Then apply user filter if needed
      if (filterMode === 'my' && currentUser) {
        return phaseTasks.filter(task => task.assignee === currentUser.id);
      }
      
      return phaseTasks;
    }
  }))
);
