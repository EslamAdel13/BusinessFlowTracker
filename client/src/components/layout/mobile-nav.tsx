import React from "react";
import { Link, useLocation } from "wouter";
import { BarChartHorizontal, CheckSquare, BookmarkIcon, Bell } from "lucide-react";

export function MobileNav() {
  const [location] = useLocation();
  
  const navItems = [
    {
      name: "Timeline",
      href: "/timeline",
      icon: <BarChartHorizontal className="h-6 w-6" />,
    },
    {
      name: "Tasks",
      href: "/my-tasks",
      icon: <CheckSquare className="h-6 w-6" />,
    },
    {
      name: "Projects",
      href: "/projects",
      icon: <BookmarkIcon className="h-6 w-6" />,
    },
    {
      name: "Alerts",
      href: "/alerts",
      icon: <Bell className="h-6 w-6" />,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-200 flex">
      {navItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <a
            className={`flex-1 flex flex-col items-center justify-center py-3 ${
              location === item.href
                ? "text-primary-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.name}</span>
          </a>
        </Link>
      ))}
    </div>
  );
}

export default MobileNav;
