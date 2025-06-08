import { FC, useState, useRef, useEffect } from 'react';
import { Phase } from '@shared/schema';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { calculatePhasePosition, positionToDate } from '@/lib/date';
import { formatShortDate } from '@/lib/utils';
import { useProjectStore } from '@/store/projectStore';
import { cn } from '@/lib/utils';
import { Pencil } from 'lucide-react';

interface DraggablePhaseBarProps {
  phase: Phase;
  timelineStartDate: Date;
  onClick: () => void;
  onEditClick: () => void;
  monthWidth: number;
}

const DraggablePhaseBar: FC<DraggablePhaseBarProps> = ({ 
  phase, 
  timelineStartDate, 
  onClick,
  onEditClick,
  monthWidth = 120
}) => {
  const phaseRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);
  const [position, setPosition] = useState({ left: 0, width: 0 });
  const [originalDates, setOriginalDates] = useState({
    start: new Date(phase.start_date || new Date()),
    end: new Date(phase.end_date || new Date())
  });
  const { updatePhase } = useProjectStore();

  // Calculate initial position when component mounts or dependencies change
  useEffect(() => {
    if (phase && phase.start_date && phase.end_date) {
      const { left, width } = calculatePhasePosition(
        phase.start_date,
        phase.end_date,
        timelineStartDate,
        monthWidth
      );
      setPosition({ left, width });
      setOriginalDates({
        start: new Date(phase.start_date),
        end: new Date(phase.end_date)
      });
    }
  }, [phase, phase.start_date, phase.end_date, timelineStartDate, monthWidth]);

  const cancelDragOperation = () => {
    if (isDragging || isResizingLeft || isResizingRight) {
      console.log('[DraggablePhaseBar] cancelDragOperation: Cancelling drag/resize state.');
      setIsDragging(false);
      setIsResizingLeft(false);
      setIsResizingRight(false);
    }
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const getPhaseColor = () => {
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
    
    const colorIndex = phase.id % phaseColors.length;
    return phaseColors[colorIndex];
  };

  const convertPositionToDate = (posX: number): Date => {
    return positionToDate(posX, timelineStartDate, monthWidth);
  };
  
  const handleMouseDown = (e: React.MouseEvent, action: 'drag' | 'resizeLeft' | 'resizeRight') => {
    console.log(`[DraggablePhaseBar] handleMouseDown: action=${action}, current states: isDragging=${isDragging}, isResizingLeft=${isResizingLeft}, isResizingRight=${isResizingRight}`);
    e.stopPropagation();
    
    if (action === 'drag') {
      setIsDragging(true);
    } else if (action === 'resizeLeft') {
      setIsResizingLeft(true);
    } else if (action === 'resizeRight') {
      setIsResizingRight(true);
    }
    
    setOriginalDates({
      start: new Date(phase.start_date || new Date()),
      end: new Date(phase.end_date || new Date())
    });
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!phaseRef.current || (!isDragging && !isResizingLeft && !isResizingRight)) return;
    
    const timelineContainer = phaseRef.current.closest('.timeline-months');
    if (!timelineContainer) return;
    
    const timelineRect = timelineContainer.getBoundingClientRect();
    const phaseRect = phaseRef.current.getBoundingClientRect();
    
    const mouseX = e.clientX - timelineRect.left;
    
    if (isDragging) {
      const newLeft = mouseX - (phaseRect.width / 2);
      
      setPosition(prev => ({ ...prev, left: Math.max(0, newLeft) }));
    } else if (isResizingLeft) {
      const currentRightEdge = position.left + position.width;
      const newLeft = Math.max(0, mouseX);
      const newWidth = currentRightEdge - newLeft;
      
      if (newWidth > 20) { 
        setPosition({ left: newLeft, width: newWidth });
      }
    } else if (isResizingRight) {
      const newWidth = mouseX - position.left;
      
      if (newWidth > 20) { 
        setPosition(prev => ({ ...prev, width: newWidth }));
      }
    }
  };

  const handleMouseUp = async () => {
    console.log(`[DraggablePhaseBar] handleMouseUp: Entry. States: isDragging=${isDragging}, isResizingLeft=${isResizingLeft}, isResizingRight=${isResizingRight}`);
    if (isDragging || isResizingLeft || isResizingRight) {
      try {
        let newStartDate = convertPositionToDate(position.left);
        let newEndDate = convertPositionToDate(position.left + position.width);
        
        if (newEndDate <= newStartDate) {
          newEndDate = new Date(newStartDate.getTime() + (24 * 60 * 60 * 1000));
        }

        const originalStartMs = originalDates.start.getTime();
        const originalEndMs = originalDates.end.getTime();
        const newStartMs = newStartDate.getTime();
        const newEndMs = newEndDate.getTime();

        if (newStartMs !== originalStartMs || newEndMs !== originalEndMs) {
          console.log('[DraggablePhaseBar] handleMouseUp: Dates changed, saving phase position:', { 
            phase_id: phase.id, 
            new_start: newStartDate.toISOString(), new_end: newEndDate.toISOString(), 
            original_start: originalDates.start.toISOString(), original_end: originalDates.end.toISOString()
          });
          await updatePhase(phase.id, {
            start_date: newStartDate.toISOString(),
            end_date: newEndDate.toISOString()
          });
          setOriginalDates({ start: newStartDate, end: newEndDate }); 
          const { left, width } = calculatePhasePosition(
            newStartDate,
            newEndDate,
            timelineStartDate,
            monthWidth
          );
          setPosition({left, width});
          console.log('[DraggablePhaseBar] Phase position saved successfully (updatePhase called).');
        } else {
          console.log('[DraggablePhaseBar] handleMouseUp: No date change detected after drag/resize. Not saving.');
          const { left, width } = calculatePhasePosition(originalDates.start, originalDates.end, timelineStartDate, monthWidth);
          setPosition({left, width});
        }
      } catch (error) {
        console.error('[DraggablePhaseBar] Error saving/recalculating phase position in handleMouseUp:', error instanceof Error ? { message: error.message, stack: error.stack, name: error.name } : JSON.stringify(error));
      }
    }
    setIsDragging(false);
    setIsResizingLeft(false);
    setIsResizingRight(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const phaseColorClass = getPhaseColor();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            ref={phaseRef}
            className={cn(
              "phase-bar cursor-move absolute top-4 z-10 text-white text-xs flex items-center justify-center shadow h-7 rounded-md",
              phaseColorClass,
              isDragging || isResizingLeft || isResizingRight ? "opacity-80" : ""
            )}
            style={{
              left: `${Math.max(0, position.left)}px`,
              width: `${Math.max(60, position.width)}px`,
              minWidth: position.width === 0 ? '60px' : 'auto', 
              height: '28px',
              backgroundColor: phase.color || '', 
              transition: isDragging || isResizingLeft || isResizingRight ? 'none' : 'all 0.2s ease'
            }}
            onClick={(e) => {
              if (!isDragging && !isResizingLeft && !isResizingRight) {
                onClick();
              }
            }}
            onMouseDown={(e) => handleMouseDown(e, 'drag')}
          >
            {/* Left resize handle */}
            <div 
              className="absolute left-0 top-0 w-2 h-full cursor-w-resize z-20"
              onMouseDown={(e) => handleMouseDown(e, 'resizeLeft')}
            />
            
            {/* Phase content */}
            <span className="px-2 truncate flex-grow">{phase.name}</span>
            
            {/* Edit Icon Button */}
            <button 
              className="p-1 hover:bg-black/20 rounded-full focus:outline-none mr-1 z-20"
              onClick={(e) => {
                e.stopPropagation(); 
                console.log('[DraggablePhaseBar] Edit button clicked. Cancelling any drag operation.');
                cancelDragOperation();
                onEditClick();
              }}
              onMouseDown={(e) => e.stopPropagation()} 
              title="Edit Phase"
            >
              <Pencil size={14} className="text-white/80 hover:text-white" />
            </button>

            {/* Right resize handle */}
            <div 
              className="absolute right-0 top-0 w-2 h-full cursor-e-resize z-20"
              onMouseDown={(e) => handleMouseDown(e, 'resizeRight')}
            />
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
};

export default DraggablePhaseBar;
