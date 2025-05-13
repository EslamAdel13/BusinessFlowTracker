import React from "react";
import { Phase } from "@shared/schema";
import { formatDate, isOverdue, isComingSoon } from "@/lib/dateUtils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PhaseBarProps {
  phase: Phase;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export function PhaseBar({ phase, style, onClick }: PhaseBarProps) {
  // Color based on status
  const getStatusColor = () => {
    switch (phase.status) {
      case "not_started":
        return "bg-gray-400";
      case "in_progress":
        return "bg-blue-500";
      case "completed":
        return "bg-green-500";
      case "overdue":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  // Badge for upcoming deadlines
  const getDeadlineBadge = () => {
    if (isOverdue(phase.endDate)) {
      return (
        <Badge variant="destructive" className="absolute -top-2 -right-2 text-xs animate-pulse">
          Overdue
        </Badge>
      );
    }
    
    if (isComingSoon(phase.endDate)) {
      return (
        <Badge variant="outline" className="absolute -top-2 -right-2 text-xs bg-amber-100">
          Due Soon
        </Badge>
      );
    }
    
    return null;
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "phase-bar cursor-pointer absolute top-4 left-0 z-10 text-white text-xs flex items-center justify-center shadow transition-all",
            getStatusColor()
          )}
          style={{
            height: '28px',
            borderRadius: '4px',
            ...style,
          }}
          onClick={onClick}
        >
          {getDeadlineBadge()}
          <span className="px-2 truncate">{phase.name}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent className="p-2 max-w-xs">
        <div className="space-y-1">
          <p className="font-semibold">{phase.name}</p>
          <p className="text-xs">{formatDate(phase.startDate)} - {formatDate(phase.endDate)}</p>
          <p className="text-xs">Status: {phase.status.replace('_', ' ')}</p>
          <p className="text-xs">Progress: {phase.progress}%</p>
          {phase.deliverable && (
            <p className="text-xs">Deliverable: {phase.deliverable}</p>
          )}
          {phase.responsible && (
            <p className="text-xs">Responsible: {phase.responsible}</p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

export default PhaseBar;
