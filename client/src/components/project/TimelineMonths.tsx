import { FC } from 'react';

interface TimelineMonthsProps {
  months: string[];
}

const TimelineMonths: FC<TimelineMonthsProps> = ({ months }) => {
  return (
    <div className="timeline-months">
      {months.map((month, index) => (
        <div
          key={`${month}-${index}`}
          className="py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-gray-200"
        >
          {month}
        </div>
      ))}
    </div>
  );
};

export default TimelineMonths;
