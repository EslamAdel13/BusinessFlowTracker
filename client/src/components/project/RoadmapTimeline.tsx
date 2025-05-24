import { FC, useState, useEffect, useMemo } from 'react';
import { Project, Phase } from '@shared/schema';
import { useProjectStore } from '@/store/projectStore';
import { useUIStore } from '@/store/uiStore';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { monthIndex, statusColor } from '@/lib/date';

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
  const { selectProject, selectPhase } = useProjectStore();
  const { openModal } = useUIStore();
  
  // Generate a simpler timeline with 3 months and 4 weeks per month
  const generateTimelineHeaders = () => {
    const result = [];
    const startMonth = dayjs(timelineStartDate);
    
    // Generate 3 months with fixed 4 weeks per month for simplicity
    for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
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
    selectPhase(phase);
    openModal('taskDrawer');
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
    <div className="overflow-x-auto">
      {/* HEADER ROW - MONTHS */}
      <div
        className="grid w-max sticky top-0 bg-white z-20"
        style={{
          gridTemplateColumns: `200px repeat(${totalWeekColumns}, minmax(80px, 1fr))` /* 1st col = project label, then 1 col per week */
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
          gridTemplateColumns: `200px repeat(${totalWeekColumns}, minmax(80px, 1fr))` /* 1st col = project label, then 1 col per week */
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
          className="relative grid w-max border-b"
          style={{
            gridTemplateColumns: `200px repeat(${totalWeekColumns}, minmax(80px, 1fr))`
          }}
        >
          {/* Project label with fixed action buttons */}
          <div className="flex items-center justify-between px-4 py-2 border-r sticky left-0 bg-white z-10">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{background: project.color || '#6366f1'}}/>
              <span className="text-sm font-medium truncate max-w-[120px]">{project.name}</span>
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

          {/* Empty grid cells for each week (just placeholders) */}
          {Array.from({ length: totalWeekColumns }).map((_, index) => (
            <div key={`${project.id}-week-${index}`} className="border-r border-gray-100 h-14"/>
          ))}

          {/* Phase bars (absolute so they sit on top of grid) */}
          {phases[project.id]?.map(phase => {
            // Ensure we have valid dates
            if (!phase.start_date || !phase.end_date) {
              console.warn(`Phase ${phase.id} has missing dates`);
              return null;
            }
            
            const startDate = new Date(phase.start_date);
            const endDate = new Date(phase.end_date);
            
            // Calculate precise grid positions using our helper function
            const startPosition = calculateGridPosition(startDate);
            const endPosition = calculateGridPosition(endDate);
            
            // Ensure minimum width for very short phases
            const minWidth = 0.5; // Half a column width minimum
            const gridSpan = Math.max(minWidth, endPosition - startPosition);
            
            // Format dates for tooltip
            const startDateFormatted = dayjs(startDate).format('MMM D, YYYY');
            const endDateFormatted = dayjs(endDate).format('MMM D, YYYY');
            const duration = dayjs(endDate).diff(dayjs(startDate), 'day') + 1;
            
            // Check if phase is within our 3-month view
            const threeMonthsLater = dayjs(timelineStartDate).add(3, 'month');
            const isVisible = (
              (dayjs(startDate).isAfter(dayjs(timelineStartDate)) || dayjs(startDate).isSame(dayjs(timelineStartDate))) &&
              (dayjs(startDate).isBefore(threeMonthsLater) || dayjs(endDate).isBefore(threeMonthsLater))
            );
            
            if (!isVisible) return null;
            
            return (
              <div
                key={phase.id}
                className="absolute h-8 flex items-center justify-center text-xs font-medium text-white rounded cursor-pointer shadow-sm hover:shadow transition-all"
                style={{
                  gridColumnStart: startPosition,
                  gridColumnEnd: `span ${gridSpan}`,
                  top: '0.75rem', // Center vertically in the row
                  background: phase.color || statusColor(phase.status),
                  zIndex: 10,
                  minWidth: '60px' // Ensure minimum width for very short phases
                }}
                onClick={() => handlePhaseClick(phase)}
                title={`${phase.name}\nStart: ${startDateFormatted}\nEnd: ${endDateFormatted}\nDuration: ${duration} days\n${phase.deliverable ? `Deliverable: ${phase.deliverable}` : ''}\n${phase.responsible ? `Responsible: ${phase.responsible}` : ''}`}
              >
                <span className="px-2 truncate">{phase.name}</span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default RoadmapTimeline;
