import { FC, useState, useEffect, useMemo } from 'react';
import { Project, Phase } from '@shared/schema';
import { useProjectStore } from '@/store/projectStore';
import { useUIStore } from '@/store/uiStore';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { monthIndex } from '@/lib/date'; // statusColor might be handled by DraggablePhaseBar if it uses phase.color
import DraggablePhaseBar from './DraggablePhaseBar';
import EditPhaseModal from './EditPhaseModal';

// Extend dayjs with plugins
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(weekOfYear);

interface RoadmapTimelineProps {
  projects: Project[];
  phases: Record<number, Phase[]>; // Map of project_id to phases
  timelineStartDate?: Date;
}

const RoadmapTimeline: FC<RoadmapTimelineProps> = ({ 
  projects, 
  phases,
  timelineStartDate = new Date(new Date().getFullYear(), 0, 1) // Default to Jan 1st of current year
}) => {
  const { selectProject, selectPhase, fetchPhases } = useProjectStore();
  const { openModal, activeModal, closeModal } = useUIStore();
  
  const [editPhase, setEditPhase] = useState(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [currentEditingPhase, setCurrentEditingPhase] = useState<Phase | null>(null);

  const weekPixelWidth = 80; // Define standard width for a week column in pixels
  const dayPixelWidth = weekPixelWidth / 7;
  const effectiveMonthWidthForDraggableBar = dayPixelWidth * 30.44; // Approx. days in a month

  // Generate a timeline with 12 months and 4 weeks per month
  const generateTimelineHeaders = () => {
    const result = [];
    const startMonth = dayjs(timelineStartDate);
    
    // Generate 12 months with fixed 4 weeks per month for simplicity
    for (let monthOffset = 0; monthOffset < 12; monthOffset++) {
      const currentMonth = startMonth.add(monthOffset, 'month');
      const monthName = currentMonth.format('MMM').toUpperCase();
      const weeksInMonth = [1, 2, 3, 4]; // Fixed 4 weeks per month for simplicity
      
      result.push({
        month: monthName,
        weeks: weeksInMonth,
        monthDate: currentMonth.toDate()
      });
    }
    
    return result;
  };
  
  // Generate the timeline headers
  const timelineHeaders = useMemo(() => generateTimelineHeaders(), [timelineStartDate]);
  
  // Calculate the timeline end date (1 year from start date)
  const timelineEndDate = useMemo(() => {
    const endDate = new Date(timelineStartDate);
    endDate.setFullYear(endDate.getFullYear() + 1);
    return endDate;
  }, [timelineStartDate]);
  
  // Helper function to calculate the exact position of a date within the timeline
  const calculateDatePosition = (date: Date) => {
    const timelineStart = dayjs(timelineStartDate);
    const timelineEnd = dayjs(timelineEndDate);
    const targetDate = dayjs(date);
    
    // If the date is outside the timeline, clamp it to the timeline boundaries
    if (targetDate.isBefore(timelineStart)) {
      return 0; // Start of timeline
    }
    
    if (targetDate.isAfter(timelineEnd)) {
      return 100; // End of timeline
    }
    
    // Calculate the total days in the timeline
    const totalDays = timelineEnd.diff(timelineStart, 'day');
    
    // Calculate days elapsed from the start date to the target date
    const daysElapsed = targetDate.diff(timelineStart, 'day');
    
    // Calculate position as a percentage of the timeline
    return (daysElapsed / totalDays) * 100;
  };
  
  // Helper function to calculate the exact column position for grid layout
  const calculateGridPosition = (date: Date) => {
    const targetDate = dayjs(date);
    const timelineStart = dayjs(timelineStartDate);
    
    // If date is before timeline start, clamp to start
    if (targetDate.isBefore(timelineStart)) {
      return 2; // Project label column (1) + first column (1)
    }
    
    // If date is more than 3 months after timeline start, clamp to visible area
    const threeMonthsLater = timelineStart.add(3, 'month');
    if (targetDate.isAfter(threeMonthsLater)) {
      return 2 + 12; // Project label column + all 12 week columns (3 months × 4 weeks)
    }
    
    // Calculate position within visible timeline
    let columnPosition = 2; // Start after project label column
    
    // Calculate months difference
    const monthsDiff = targetDate.month() - timelineStart.month() + 
                      (targetDate.year() - timelineStart.year()) * 12;
    
    // Add weeks for full months
    if (monthsDiff > 0) {
      columnPosition += monthsDiff * 4; // 4 weeks per month
    }
    
    // Calculate week within month (0-3)
    const dayOfMonth = targetDate.date();
    let weekInMonth = 0;
    
    if (dayOfMonth <= 7) {
      weekInMonth = 0;
    } else if (dayOfMonth <= 14) {
      weekInMonth = 1;
    } else if (dayOfMonth <= 21) {
      weekInMonth = 2;
    } else {
      weekInMonth = 3;
    }
    
    // Add week position
    columnPosition += weekInMonth;
    
    // Add day position within week (0-1 range for fractional positioning)
    const dayInWeek = (dayOfMonth - 1) % 7;
    const dayPosition = dayInWeek / 7;
    
    columnPosition += dayPosition;
    
    return columnPosition;
  };

  const handlePhaseClick = (phase: Phase) => {
    // If edit modal is open for this phase, don't open task drawer
    if (isEditModalOpen && currentEditingPhase?.id === phase.id) return;
    selectPhase(phase);
    openModal('taskDrawer');
  };

  const handleOpenEditModal = (phase: Phase) => {
    // e.stopPropagation(); // No longer needed here, DraggablePhaseBar handles its button's event propagation
    setCurrentEditingPhase(phase);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setCurrentEditingPhase(null);
    // Optionally, refetch phases if an edit might have occurred
    // projects.forEach(p => fetchPhases(p.id)); 
  };

  const handlePhaseClickOriginal = (phase: Phase) => {
    setEditPhase(phase);
    setEditModalOpen(true);
  };

  const handleEditProject = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    selectProject(project);
    openModal('editProject');
  };
  
  const handleAddPhase = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    selectProject(project);
    openModal('createPhase');
  };

  // Calculate total number of week columns
  const totalWeekColumns = useMemo(() => {
    let total = 0;
    timelineHeaders.forEach(month => {
      total += month.weeks.length;
    });
    return total;
  }, [timelineHeaders]);
  
  return (
    <div className="overflow-x-auto w-full" data-component-name="RoadmapTimeline">
      {/* HEADER ROW - MONTHS */}
      <div
        className="grid w-max sticky top-0 bg-white z-20"
        style={{
          gridTemplateColumns: `200px repeat(${totalWeekColumns}, minmax(80px, 1fr))`,
          minWidth: `${200 + totalWeekColumns * 80}px`,
        }}
      >
        <div className="font-semibold px-4 py-2 border-b border-r">PROJECT</div>
        
        {/* Month headers that span their weeks */}
        {timelineHeaders.map((monthData, monthIndex) => (
          <div 
            key={`month-${monthData.month}-${monthIndex}`}
            className="text-center font-semibold px-4 py-2 border-b border-r bg-gray-50"
            style={{ 
              gridColumn: `span ${monthData.weeks.length}`,
            }}
          >
            {monthData.month}
          </div>
        ))}
      </div>
      
      {/* HEADER ROW - WEEKS */}
      <div
        className="grid w-max sticky top-10 bg-white z-20"
        style={{
          gridTemplateColumns: `200px repeat(${totalWeekColumns}, minmax(80px, 1fr))`,
          minWidth: `${200 + totalWeekColumns * 80}px`,
        }}
      >
        <div className="font-semibold px-4 py-1 text-xs border-b border-r">TIMELINE</div>
        
        {/* Week headers */}
        {timelineHeaders.flatMap((monthData, monthIndex) => 
          monthData.weeks.map((weekNum, weekIndex) => (
            <div 
              key={`week-${monthData.month}-${weekNum}-${weekIndex}`}
              className="text-center text-xs px-2 py-1 border-b border-r"
            >
              Week {weekNum}
            </div>
          ))
        )}
      </div>

      {/* DATA ROWS */}
      {projects.map(project => (
        <div
          key={project.id}
          className="relative grid w-max border-b min-h-[3.5rem]" // Added min-h for row height
          style={{
            gridTemplateColumns: `200px repeat(${totalWeekColumns}, minmax(${weekPixelWidth}px, 1fr))`,
            minWidth: `${200 + totalWeekColumns * weekPixelWidth}px`,
          }}
        >
          {/* Project label with fixed action buttons */}
          {/* Column 1: Project Label */}
          <div className="flex items-center justify-between px-4 py-2 border-r sticky left-0 bg-white z-10 row-start-1 h-full">
            <div> {/* Wrapper for title and dates */}
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{background: project.color || '#6366f1'}}/>
                <span className="text-sm font-medium truncate max-w-[120px]">{project.name}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {project.start_date ? dayjs(project.start_date).format('MMM D, YYYY') : 'No start date'} - 
                {project.end_date ? dayjs(project.end_date).format('MMM D, YYYY') : 'No end date'}
              </div>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={(e) => handleEditProject(e, project)}
                className="text-primary hover:text-primary-600 p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
              <button 
                onClick={(e) => handleAddPhase(e, project)}
                className="text-primary hover:text-primary-600 p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* Column 2 onwards: Timeline Area Background Grid Cells */}
          {Array.from({ length: totalWeekColumns }).map((_, weekIndex) => (
            <div
              key={`${project.id}-week-bg-${weekIndex}`}
              className="border-r border-gray-100 h-full" // Use h-full to match row height
              style={{ gridColumnStart: weekIndex + 2, gridRowStart: 1 }}
            />
          ))}

          {/* Container for DraggablePhaseBars, overlaid on the timeline area */}
          <div
            className="relative row-start-1 h-full" // Occupy the first row, full height
            style={{ gridColumn: `2 / span ${totalWeekColumns}` }} // Span all timeline columns
          >
            {phases[project.id]?.map((phase) => (
              <DraggablePhaseBar
                key={phase.id}
                phase={phase}
                timelineStartDate={timelineStartDate}
                monthWidth={effectiveMonthWidthForDraggableBar}
                onClick={() => handlePhaseClick(phase)}
                onEditClick={() => handleOpenEditModal(phase)}
              />
            ))}
          </div>

        </div>
      ))}
      <EditPhaseModal phase={currentEditingPhase} isOpen={isEditModalOpen} onClose={handleCloseEditModal} />
    </div>
  );
};

export default RoadmapTimeline;
