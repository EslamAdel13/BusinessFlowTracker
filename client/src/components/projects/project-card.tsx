import React from "react";
import { Project, Phase } from "@shared/schema";
import { formatDate } from "@/lib/dateUtils";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { EyeIcon, PlusCircleIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProjectCardProps {
  project: Project;
  phases: Phase[];
  onViewDetails: () => void;
  onAddPhase: () => void;
}

export function ProjectCard({ project, phases, onViewDetails, onAddPhase }: ProjectCardProps) {
  // Calculate overall project status and progress
  const calculateProjectStatus = () => {
    if (phases.length === 0) return "not_started";
    
    const statuses = phases.map(p => p.status);
    
    if (statuses.some(s => s === "overdue")) return "overdue";
    if (statuses.every(s => s === "completed")) return "completed";
    if (statuses.some(s => s === "in_progress")) return "in_progress";
    return "not_started";
  };
  
  const calculateProjectProgress = () => {
    if (phases.length === 0) return 0;
    
    const totalProgress = phases.reduce((sum, phase) => sum + phase.progress, 0);
    return Math.round(totalProgress / phases.length);
  };
  
  const getProjectDates = () => {
    if (phases.length === 0) return "No phases yet";
    
    const startDates = phases.map(p => new Date(p.startDate));
    const endDates = phases.map(p => new Date(p.endDate));
    
    const earliestStart = new Date(Math.min(...startDates.map(d => d.getTime())));
    const latestEnd = new Date(Math.max(...endDates.map(d => d.getTime())));
    
    return `${formatDate(earliestStart)} - ${formatDate(latestEnd)}`;
  };
  
  const status = calculateProjectStatus();
  const progress = calculateProjectProgress();
  const dates = getProjectDates();
  
  // Status badge styling
  const getStatusBadgeProps = () => {
    switch (status) {
      case "not_started":
        return { variant: "secondary" as const, label: "Not Started" };
      case "in_progress":
        return { variant: "default" as const, label: "In Progress" };
      case "completed":
        return { variant: "success" as const, label: "Completed" };
      case "overdue":
        return { variant: "destructive" as const, label: "Overdue" };
      default:
        return { variant: "secondary" as const, label: "Unknown" };
    }
  };
  
  const statusBadge = getStatusBadgeProps();

  return (
    <div className="block hover:bg-gray-50 animate-fade-in">
      <div className="px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div 
              className="h-3 w-3 rounded-full mr-3"
              style={{ backgroundColor: project.color }}
            ></div>
            <p className="text-sm font-medium text-primary-600 truncate">{project.name}</p>
          </div>
          <div className="ml-2 flex-shrink-0 flex">
            <Badge variant={statusBadge.variant}>
              {statusBadge.label}
            </Badge>
          </div>
        </div>
        
        <div className="mt-2 sm:flex sm:justify-between">
          <div className="sm:flex">
            <p className="flex items-center text-sm text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
              {project.description || "No description"}
            </p>
          </div>
          
          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clipRule="evenodd"
              />
            </svg>
            <p>{dates}</p>
          </div>
        </div>
        
        {phases.length > 0 && (
          <div className="mt-4">
            <div className="flex justify-between mb-1 text-xs">
              <span className="font-medium text-gray-700">Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
        
        <div className="mt-4">
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Phases ({phases.length})
          </h4>
          
          {phases.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {phases.slice(0, 3).map((phase) => (
                <div key={phase.id} className="bg-gray-100 rounded-md p-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{phase.name}</span>
                    <Badge variant={
                      phase.status === "not_started" ? "secondary" :
                      phase.status === "in_progress" ? "default" :
                      phase.status === "completed" ? "success" :
                      "destructive"
                    } className="text-xs">
                      {phase.status === "not_started" ? "Not Started" :
                       phase.status === "in_progress" ? "In Progress" :
                       phase.status === "completed" ? "Completed" :
                       "Overdue"}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{formatDate(phase.startDate)} - {formatDate(phase.endDate)}</span>
                    <span>{phase.progress}%</span>
                  </div>
                </div>
              ))}
              
              {phases.length > 3 && (
                <div className="text-center text-xs text-primary-600 hover:text-primary-800 cursor-pointer p-1">
                  +{phases.length - 3} more phases
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-100 rounded-md p-3 text-center text-sm text-gray-500">
              No phases yet. Add your first phase.
            </div>
          )}
        </div>
        
        <div className="mt-4 flex space-x-2">
          <Button
            variant="default"
            size="sm"
            className="inline-flex items-center"
            onClick={onViewDetails}
          >
            <EyeIcon className="mr-1.5 h-4 w-4" />
            View Timeline
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="inline-flex items-center"
            onClick={onAddPhase}
          >
            <PlusCircleIcon className="mr-1.5 h-4 w-4" />
            Add Phase
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ProjectCard;
