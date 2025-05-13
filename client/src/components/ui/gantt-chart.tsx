import React, { useEffect, useState } from "react";
import { Project, Phase } from "@shared/schema";
import { getTimelineMonths, getRelativeMonthPosition, calculatePhaseWidth } from "@/lib/dateUtils";
import { PhaseBar } from "@/components/phases/phase-bar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PlusCircle, Edit } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface GanttChartProps {
  projects: Project[];
  phases: Record<number, Phase[]>; // projectId -> phases[]
  onAddPhase?: (projectId: number) => void;
  onEditProject?: (project: Project) => void;
}

export function GanttChart({
  projects,
  phases,
  onAddPhase,
  onEditProject
}: GanttChartProps) {
  const openDrawer = useAppStore((state) => state.openDrawer);
  const [timelineDates, setTimelineDates] = useState<{
    start: Date;
    end: Date;
  }>({
    start: new Date(),
    end: new Date(new Date().setMonth(new Date().getMonth() + 11))
  });

  // Calculate the earliest and latest dates from all phases
  useEffect(() => {
    let earliestDate = new Date();
    let latestDate = new Date(new Date().setMonth(new Date().getMonth() + 11));
    
    let hasPhases = false;
    
    Object.values(phases).forEach(projectPhases => {
      projectPhases.forEach(phase => {
        hasPhases = true;
        const phaseStart = new Date(phase.startDate);
        const phaseEnd = new Date(phase.endDate);
        
        if (phaseStart < earliestDate) {
          earliestDate = phaseStart;
        }
        
        if (phaseEnd > latestDate) {
          latestDate = phaseEnd;
        }
      });
    });
    
    // If we have phases, use their date range; otherwise keep default range
    if (hasPhases) {
      // Add padding of 1 month on each side
      earliestDate.setMonth(earliestDate.getMonth() - 1);
      latestDate.setMonth(latestDate.getMonth() + 1);
      
      setTimelineDates({
        start: earliestDate,
        end: latestDate
      });
    }
  }, [phases]);

  const months = getTimelineMonths(timelineDates.start, timelineDates.end, 12);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Timeline Header */}
      <div className="border-b border-gray-200">
        <div className="flex">
          <div className="w-64 pl-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Project
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="timeline-months grid grid-cols-12">
              {months.map((month, index) => (
                <div
                  key={index}
                  className="py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200"
                >
                  {month.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Project Rows & Gantt Chart */}
      <div className="custom-scrollbar" style={{ maxHeight: "calc(100vh - 260px)", overflowY: "auto" }}>
        {projects.map((project) => (
          <div key={project.id} className="hover:bg-gray-50 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-64 pl-6 pr-2 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div 
                    className="h-3 w-3 rounded-full mr-3" 
                    style={{ backgroundColor: project.color }}
                  ></div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{project.name}</div>
                    <div className="text-xs text-gray-500">{project.description}</div>
                  </div>
                </div>
              </div>

              <div className="flex-1 relative">
                <div className="timeline-months" style={{ height: "60px" }}>
                  {/* Phase bars */}
                  {phases[project.id]?.map((phase) => {
                    const positionInMonths = getRelativeMonthPosition(
                      phase.startDate,
                      timelineDates.start
                    );
                    
                    const phaseWidth = calculatePhaseWidth(
                      phase.startDate,
                      phase.endDate,
                      timelineDates.start,
                      timelineDates.end
                    );

                    const widthInPixels = (phaseWidth / 100) * (120 * 12); // 120px per month, 12 months
                    const leftPositionInPixels = (positionInMonths / 12) * (120 * 12);

                    return (
                      <PhaseBar
                        key={phase.id}
                        phase={phase}
                        style={{
                          left: `${leftPositionInPixels}px`,
                          width: `${widthInPixels}px`,
                        }}
                        onClick={() => openDrawer("phase", phase)}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="pr-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="text-primary-600 hover:text-primary-900 mr-3"
                      onClick={() => onEditProject && onEditProject(project)}
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Edit project</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="text-primary-600 hover:text-primary-900"
                      onClick={() => onAddPhase && onAddPhase(project.id)}
                    >
                      <PlusCircle className="h-5 w-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Add phase</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GanttChart;
