import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import MobileNav from './MobileNav';
import { useUIStore } from '@/store/uiStore';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          {children}
        </main>
        
        {/* Mobile Bottom Navigation */}
        <MobileNav />
      </div>
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};

export default AppLayout;
