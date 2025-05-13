import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface UIState {
  sidebarOpen: boolean;
  drawerOpen: boolean;
  activeModal: string | null;
  companyLogo: string | null;
  accentColor: string | null;
  timelineStartDate: Date;
  
  toggleSidebar: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  openModal: (modalName: string) => void;
  closeModal: () => void;
  setCompanyLogo: (logo: string | null) => void;
  setAccentColor: (color: string | null) => void;
  setTimelineStartDate: (date: Date) => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set, get) => ({
        sidebarOpen: false,
        drawerOpen: false,
        activeModal: null,
        companyLogo: null,
        accentColor: null,
        timelineStartDate: new Date(),
        
        toggleSidebar: () => {
          set({ sidebarOpen: !get().sidebarOpen });
        },
        
        openDrawer: () => {
          set({ drawerOpen: true });
        },
        
        closeDrawer: () => {
          set({ drawerOpen: false });
        },
        
        openModal: (modalName) => {
          set({ activeModal: modalName });
        },
        
        closeModal: () => {
          set({ activeModal: null });
        },
        
        setCompanyLogo: (logo) => {
          set({ companyLogo: logo });
        },
        
        setAccentColor: (color) => {
          set({ accentColor: color });
          
          // Apply the accent color to CSS custom properties
          if (color) {
            document.documentElement.style.setProperty('--primary', color);
            document.documentElement.style.setProperty('--accent', color);
            document.documentElement.style.setProperty('--ring', color);
          } else {
            // Reset to default indigo color
            document.documentElement.style.setProperty('--primary', '246 96% 64%');
            document.documentElement.style.setProperty('--accent', '246 96% 64%');
            document.documentElement.style.setProperty('--ring', '246 96% 64%');
          }
        },
        
        setTimelineStartDate: (date) => {
          set({ timelineStartDate: date });
        }
      }),
      {
        name: 'ui-storage',
        partialize: (state) => ({
          companyLogo: state.companyLogo,
          accentColor: state.accentColor,
          timelineStartDate: state.timelineStartDate,
        }),
      }
    )
  )
);
