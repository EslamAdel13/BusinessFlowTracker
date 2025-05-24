import React from "react";
import { Link, useLocation } from "wouter";
import { useUIStore } from "@/store/uiStore";
import { useAuth } from "@/lib/auth.tsx";
import AvatarWithInitials from "@/components/ui/avatar-with-initials";
import { useCompanySettings } from "@/lib/store";
import { LayoutGrid, BarChartHorizontal, CheckSquare, BookmarkIcon, InfoIcon } from "lucide-react";

// Navigation items
const navItems = [
  {
    name: "Timeline",
    href: "/timeline",
    icon: <BarChartHorizontal className="h-5 w-5 mr-3" />,
  },
  {
    name: "Tasks",
    href: "/tasks",
    icon: <CheckSquare className="h-5 w-5 mr-3" />,
  },
  {
    name: "Projects",
    href: "/projects",
    icon: <BookmarkIcon className="h-5 w-5 mr-3" />,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: <InfoIcon className="h-5 w-5 mr-3" />,
  },
];

export function MobileSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { logo } = useCompanySettings();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  
  if (!sidebarOpen) return null;
  
  return (
    <>
      {/* Mobile sidebar backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
        onClick={toggleSidebar}
      />
      
      {/* Mobile sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white md:hidden flex flex-col">
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            {logo ? (
              <img src={logo} alt="Company Logo" className="w-8 h-8 rounded-md" />
            ) : (
              <div className="w-8 h-8 bg-primary-600 rounded-md flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v6a1 1 0 01-1 1H6a1 1 0 01-1-1v-6a1 1 0 011-1h8z" />
                </svg>
              </div>
            )}
            <span className="text-xl font-semibold text-gray-800">ProjectSync</span>
          </div>
          <button 
            onClick={toggleSidebar}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              onClick={toggleSidebar}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                location.startsWith(item.href) || 
                (item.href === "/timeline" && location === "/")
                  ? "text-white bg-primary-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <AvatarWithInitials 
              name={user?.fullName || "User"} 
              imageUrl={user?.avatarUrl}
              className="w-8 h-8"
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user?.fullName}</p>
              <p className="text-xs text-gray-500">{user?.position || "User"}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default MobileSidebar;
