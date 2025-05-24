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
  const { left, width } = useMemo(() => {
    try {
      // Ensure we have valid dates before calculating position
      if (!phase.start_date || !phase.end_date) {
        console.warn('Missing date values for phase:', phase.id);
        return { left: 0, width: 120 }; // Default width to make phase visible
      }
      
      console.log('Phase dates:', { 
        id: phase.id, 
        name: phase.name,
        start: phase.start_date, 
        end: phase.end_date,
        timelineStart: timelineStartDate 
      });
      
      const result = calculatePhasePosition(phase.start_date, phase.end_date, timelineStartDate);
      console.log('Phase position calculated:', result);
      
      // If width is 0, set a default width to make the phase visible
      if (result.width === 0) {
        return { left: 0, width: 120 };
      }
      
      return result;
    } catch (error) {
      console.error('Error calculating phase position:', error);
      return { left: 0, width: 120 }; // Default width to make phase visible
    }
  }, [phase.start_date, phase.end_date, timelineStartDate]);
  
  // Always show the phase, regardless of calculated width
  // Make sure phases are always visible
  
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
  
  // Get status color as fallback
  const statusColorClass = getStatusColor(phase.status);
  
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
              width: `${Math.max(60, width)}px`, // Reduced minimum width for better alignment
              minWidth: width === 0 ? '60px' : 'auto', // Only use minimum width as fallback
              height: '28px',
              backgroundColor: phase.color || '' // Use custom color if available
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
