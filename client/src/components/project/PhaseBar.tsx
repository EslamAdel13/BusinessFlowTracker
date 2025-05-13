import { FC, useMemo } from 'react';
import { Phase } from '@shared/schema';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { calculatePhasePosition } from '@/lib/date';
import { getStatusColor } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface PhaseBarProps {
  phase: Phase;
  timelineStartDate: Date;
  onClick: () => void;
}

const PhaseBar: FC<PhaseBarProps> = ({ phase, timelineStartDate, onClick }) => {
  const { left, width } = useMemo(() => 
    calculatePhasePosition(phase.startDate, phase.endDate, timelineStartDate),
    [phase.startDate, phase.endDate, timelineStartDate]
  );
  
  // If width is 0, the phase is outside the timeline view
  if (width === 0) return null;
  
  const statusColorClass = getStatusColor(phase.status);
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn("phase-bar cursor-pointer absolute top-4 left-0 z-10 text-white text-xs flex items-center justify-center shadow", statusColorClass)}
            style={{
              left: `${left}px`,
              width: `${width}px`,
            }}
            onClick={onClick}
            data-phase-id={phase.id}
          >
            <span className="px-2 truncate">{phase.name}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p className="font-medium">{phase.name}</p>
            <p className="text-xs text-gray-500">Deliverable: {phase.deliverable}</p>
            <p className="text-xs text-gray-500">Responsible: {phase.responsible}</p>
            <p className="text-xs text-gray-500">Status: {phase.status.replace('_', ' ')}</p>
            <p className="text-xs text-gray-500">Progress: {phase.progress}%</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default PhaseBar;
