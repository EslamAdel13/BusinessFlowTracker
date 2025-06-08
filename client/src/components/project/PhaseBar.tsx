import { FC, useMemo } from 'react';
import { Phase } from '@shared/schema';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { calculatePhasePosition } from '@/lib/date';
import { getStatusColor, formatShortDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface PhaseBarProps {
  phase: Phase;
  timelineStartDate: Date;
  onClick: () => void;
  monthWidth?: number;
}

const PhaseBar: FC<PhaseBarProps> = ({ phase, timelineStartDate, onClick, monthWidth = 100 }) => {
  const { left, width } = useMemo(() => {
    try {
      // Ensure we have valid dates before calculating position
      if (!phase.start_date || !phase.end_date) {
        console.warn('Missing date values for phase:', phase.id);
        return { left: 0, width: 100 }; // Default width to make phase visible
      }
      
      const result = calculatePhasePosition(
        phase.start_date, 
        phase.end_date, 
        timelineStartDate,
        monthWidth
      );
      
      // If width is too small, set a minimum width to make the phase visible
      if (result.width < 40) {
        return { left: result.left, width: 40 };
      }
      
      return result;
    } catch (error) {
      console.error('Error calculating phase position:', error);
      return { left: 0, width: 100 }; // Default width to make phase visible
    }
  }, [phase.start_date, phase.end_date, timelineStartDate, monthWidth]);
  
  // Use a combination of project color and phase status for more visual variety
  const getPhaseColor = () => {
    // Use a color based on the phase ID to ensure variety
    const phaseColors = [
      'bg-chart-1',  // Blue
      'bg-chart-2',  // Purple
      'bg-chart-3',  // Green
      'bg-chart-4',  // Red
      'bg-chart-5',  // Orange
      'bg-indigo-500',
      'bg-pink-500',
      'bg-teal-500',
      'bg-amber-500',
      'bg-cyan-500'
    ];
    
    // Use the phase ID to pick a color, or fall back to status color
    const colorIndex = phase.id % phaseColors.length;
    return phaseColors[colorIndex];
  };
  
  // Get the phase color
  const phaseColorClass = getPhaseColor();
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn("phase-bar cursor-pointer absolute top-4 left-0 z-10 text-white text-xs flex items-center justify-center shadow h-7 rounded-md", phaseColorClass)}
            style={{
              left: `${Math.max(0, left)}px`,
              width: `${Math.max(40, width)}px`,
              height: '28px',
              backgroundColor: phase.color || '', // Use custom color if available
              transition: 'all 0.2s ease'
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
            <p className="text-xs text-gray-500">
              {formatShortDate(new Date(phase.start_date || new Date()))} - {formatShortDate(new Date(phase.end_date || new Date()))}
            </p>
            <p className="text-xs text-gray-500">Deliverable: {phase.deliverable}</p>
            <p className="text-xs text-gray-500">Responsible: {phase.responsible}</p>
            <p className="text-xs text-gray-500">Status: {phase.status.replace('_', ' ')}</p>
            <p className="text-xs text-gray-500">Progress: {phase.progress}%</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

export default PhaseBar;
