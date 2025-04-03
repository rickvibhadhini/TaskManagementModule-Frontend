import React, { useEffect } from 'react';
import { format } from 'date-fns';

const TimelineHeader = ({ 
  headerRef, 
  timePoints, 
  totalWidth, 
  zoomLevel, 
  headerHeight,
  synchronizeScroll
}) => {
  // Format time for display
  const formatTimeLabel = (date) => {
    return format(date, 'HH:mm:ss.SSS');
  };

  // Set up scroll synchronization
  useEffect(() => {
    const headerContent = headerRef.current?.querySelector('.flex-1');
    if (!headerContent) return;

    const handleScroll = () => synchronizeScroll('header');
    headerContent.addEventListener('scroll', handleScroll);
    
    return () => {
      headerContent.removeEventListener('scroll', handleScroll);
    };
  }, [headerRef, synchronizeScroll]);

  return (
    <div className="sticky top-0 z-30 flex border-b-2 border-gray-300 bg-white shadow-sm" ref={headerRef}>
      {/* Left sidebar header */}
      <div className="w-48 flex-shrink-0 border-r border-gray-300">
        <div 
          style={{ height: headerHeight, lineHeight: `${headerHeight}px` }} 
          className="bg-gray-100 flex items-center"
        >
          <span className="text-sm font-medium text-gray-600 ml-3">Task ID</span>
        </div>
      </div>

      {/* Discrete timeline header with scrollable container */}
      <div className="flex-1 overflow-x-auto bg-gray-50" style={{ overflowY: 'hidden' }}>
        <div 
          className="relative" 
          style={{ 
            width: `${totalWidth * zoomLevel}px`, 
            height: headerHeight,
            minWidth: '100%'
          }}
        >
          {/* Time ticks */}
          {timePoints.map((point, i) => (
            <div
              key={i}
              className="absolute top-0 h-full flex flex-col items-center"
              style={{ 
                left: `${point.position * zoomLevel}px`, 
                zIndex: 2 
              }}
            >
              <div className="h-8 border-l border-gray-300" style={{ width: '1px' }}></div>
              <div 
                className="text-[11px] text-gray-700 transform -rotate-45 origin-top-left whitespace-nowrap font-medium" 
                style={{ marginTop: '10px', marginLeft: '4px' }}
              >
                {formatTimeLabel(point.time)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimelineHeader;