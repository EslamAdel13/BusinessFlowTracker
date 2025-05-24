import { FC } from 'react';

interface TimelineMonthsProps {
  months: string[];
  monthWidth?: number;
}

const TimelineMonths: FC<TimelineMonthsProps> = ({ months, monthWidth = 100 }) => {
  return (
    <div 
      className="timeline-months" 
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${months.length}, ${monthWidth}px)`,
        width: `${months.length * monthWidth}px`,
        position: 'relative',
        overflowX: 'hidden'
      }}
    >
      {months.map((month, index) => (
        <div
          key={`${month}-${index}`}
          className="py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200"
          style={{ 
            width: `${monthWidth}px`,
            position: 'relative',
            minWidth: `${monthWidth}px`
          }}
        >
          {month}
        </div>
      ))}
    </div>
  );
};

export default TimelineMonths;
