import { FC, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

interface TimelineMonthsProps {
  months: string[];
  monthWidth?: number;
}

const TimelineMonths: FC<TimelineMonthsProps> = ({ months, monthWidth = 100 }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  
  // Check if we need to show scroll buttons
  useEffect(() => {
    const checkScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollWidth, clientWidth, scrollLeft } = scrollContainerRef.current;
        
        // Show buttons if content is wider than container
        setShowScrollButtons(scrollWidth > clientWidth);
        
        // Can scroll left if not at the beginning
        setCanScrollLeft(scrollLeft > 0);
        
        // Can scroll right if not at the end
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth);
      }
    };
    
    checkScroll();
    
    // Add event listener for resize
    window.addEventListener('resize', checkScroll);
    
    // Add scroll event listener
    if (scrollContainerRef.current) {
      scrollContainerRef.current.addEventListener('scroll', checkScroll);
    }
    
    return () => {
      window.removeEventListener('resize', checkScroll);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.removeEventListener('scroll', checkScroll);
      }
    };
  }, [months, monthWidth]);
  
  // Scroll left/right by one month
  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -monthWidth : monthWidth;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };
  
  return (
    <div className="relative flex items-center w-full">
      {/* Left scroll button */}
      {showScrollButtons && (
        <Button 
          variant="ghost" 
          size="icon" 
          className={`absolute left-0 z-20 bg-white/80 hover:bg-white/90 rounded-full shadow-md ${!canScrollLeft ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => handleScroll('left')}
          disabled={!canScrollLeft}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Button>
      )}
      
      {/* Months container with horizontal scrolling */}
      <div 
        ref={scrollContainerRef}
        className="timeline-months overflow-x-auto scrollbar-hide w-full" 
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${months.length}, ${monthWidth}px)`,
          width: `${months.length * monthWidth}px`,
          minWidth: '100%',
          position: 'relative',
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
      
      {/* Right scroll button */}
      {showScrollButtons && (
        <Button 
          variant="ghost" 
          size="icon" 
          className={`absolute right-0 z-20 bg-white/80 hover:bg-white/90 rounded-full shadow-md ${!canScrollRight ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => handleScroll('right')}
          disabled={!canScrollRight}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      )}
    </div>
  );
};

export default TimelineMonths;
