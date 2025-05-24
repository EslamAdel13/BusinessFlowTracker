import { ReactNode } from 'react';
import Sidebar from './sidebar';
import MobileSidebar from './MobileSidebar';
import TopBar from './TopBar';
import MobileNav from './MobileNav';
import { useUIStore } from '@/store/uiStore';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <div className="flex h-screen w-full overflow-hidden max-w-full">
      {/* Desktop Sidebar - Always visible on md screens and up */}
      <Sidebar />
      
      {/* Mobile Sidebar - Only visible when sidebarOpen is true */}
      <MobileSidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
        <TopBar />
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50">
          {children}
        </main>
        
        {/* Mobile Bottom Navigation */}
        <MobileNav />
      </div>
    </div>
  );
};

export default AppLayout;
