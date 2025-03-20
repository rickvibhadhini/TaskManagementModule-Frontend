import React, { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { statusColors } from '../../utils/Ganntutils';

const TaskTooltip = ({ hoveredTask, tooltipPosition, onClose }) => {
  const [isPinned, setIsPinned] = useState(false);
  const [adjustedPosition, setAdjustedPosition] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState('overview');
  const tooltipRef = useRef(null);

  // Debounce function for position updates
  const debounce = (fn, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  useEffect(() => {
    if (!tooltipPosition || !hoveredTask || isPinned) return;

    // Set initial position immediately to prevent jitter
    setAdjustedPosition({
      x: tooltipPosition.x - 150, // Approximate half width
      y: tooltipPosition.y + 20
    });

    const updatePosition = () => {
      if (tooltipRef.current) {
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Center the tooltip horizontally on the position
        let newX = tooltipPosition.x - (tooltipRect.width / 2);
        // Position the tooltip below the target
        let newY = tooltipPosition.y + 20;

        // Ensure tooltip stays within viewport bounds
        if (newX < 10) newX = 10;
        if (newX + tooltipRect.width > viewportWidth - 10) {
          newX = viewportWidth - tooltipRect.width - 10;
        }
      
        if (newY + tooltipRect.height > viewportHeight - 10) {
          // If tooltip would go below viewport, position it above the target
          newY = Math.max(10, tooltipPosition.y - tooltipRect.height - 10);
        }

        setAdjustedPosition({ x: newX, y: newY });
      }
    };

    // Use requestAnimationFrame for smoother updates
    const animationId = requestAnimationFrame(updatePosition);
  
    // Debounce window resize handler
    const debouncedUpdatePosition = debounce(updatePosition, 50);
    window.addEventListener('resize', debouncedUpdatePosition);

    return () => {
      window.removeEventListener('resize', debouncedUpdatePosition);
      cancelAnimationFrame(animationId);
    };
  }, [tooltipPosition, hoveredTask, isPinned]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target) && isPinned) {
        onClose();
      }
    };

    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [isPinned, onClose]);

  const handleTooltipClick = (e) => {
    e.stopPropagation();
    setIsPinned(true);
  };

  const handleCloseClick = (e) => {
    e.stopPropagation();
    onClose();
  };
  
  // Calculate stats for the task
  const calculateTaskStats = (task) => {
    if (!task) return null;
    
    // Total duration
    const totalDuration = task.segments.reduce((sum, segment) => {
      return sum + (segment.endTime - segment.startTime);
    }, 0);
    
    // Time per status
    const timePerStatus = {};
    task.segments.forEach(segment => {
      const duration = segment.endTime - segment.startTime;
      if (!timePerStatus[segment.status]) {
        timePerStatus[segment.status] = 0;
      }
      timePerStatus[segment.status] += duration;
    });
    
    return {
      totalDuration,
      timePerStatus
    };
  };

  // Format time in a human-readable way
  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  if (!hoveredTask) return null;

  const segment = hoveredTask.currentSegment;
  if (!segment) return null;

  const formattedStatuses = hoveredTask.statuses.map((status) => ({
    ...status,
    formattedTime: format(status.time, 'h:mm:ss a'),
  }));

  const taskStats = calculateTaskStats(hoveredTask);
  
  return (
    <div
      ref={tooltipRef}
      className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 text-sm task-tooltip"
      style={{
        left: `${adjustedPosition.x}px`,
        top: `${adjustedPosition.y}px`,
        width: '400px',
        maxHeight: '80vh',
        overflow: 'hidden',
        opacity: 1,
        transform: 'translateZ(0)',
        willChange: 'transform',
        transition: 'opacity 0.15s ease-in-out',
      }}
      onClick={handleTooltipClick}
    >
      {/* Sticky header with tabs and close button */}
      <div className="sticky top-0 z-10 bg-white">
        <div className="flex justify-between items-center p-4 pb-2 border-b border-gray-100">
          <h4 className="font-bold text-lg">{hoveredTask.id}</h4>
          <button
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={handleCloseClick}
            style={{
              fontSize: '28px',
              fontWeight: 'bold',
              lineHeight: '24px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b">
          {['overview', 'stats'].map(tab => (
            <button
              key={tab}
              className={`flex-1 py-2 text-sm font-medium ${
                activeTab === tab 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>
  
      {/* Scrollable content area */}
      <div className="p-4 overflow-auto" style={{ maxHeight: 'calc(80vh - 90px)' }}>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div>
                <p>
                  <span className="font-semibold">Funnel:</span>
                  <span className="ml-1 inline-flex items-center">
                    <span 
                      className="inline-block w-3 h-3 rounded-full mr-1" 
                      style={{ backgroundColor: hoveredTask.funnelColor }}
                    ></span>
                    {hoveredTask.funnel}
                  </span>
                </p>
                <p>
                  <span className="font-semibold">Current Status:</span>
                  <span className="ml-1 inline-flex items-center">
                    <span 
                      className="inline-block w-3 h-3 rounded-full mr-1" 
                      style={{ backgroundColor: statusColors[segment.status] || '#6B7280' }}
                    ></span>
                    {segment.status}
                  </span>
                </p>
                <p><span className="font-semibold">Actor ID:</span> {hoveredTask.actorId || 'None'}</p>
              </div>
              <div>
                <p><span className="font-semibold">Start:</span> {format(segment.startTime, 'h:mm:ss a')}</p>
                <p><span className="font-semibold">End:</span> {format(segment.endTime, 'h:mm:ss a')}</p>
                <p>
                  <span className="font-semibold">Duration:</span> {formatTime(segment.endTime - segment.startTime)}
                </p>
              </div>
            </div>
            
            {/* Current segment details */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h5 className="font-medium mb-2">Current Segment Details</h5>
              <p className="text-sm">
                This task has been in <span className="font-medium">{segment.status}</span> status 
                for {formatTime(segment.endTime - segment.startTime)}, which 
                is {taskStats ? Math.round(((segment.endTime - segment.startTime) / taskStats.totalDuration) * 100) : 0}% 
                of the total task duration.
              </p>
            </div>
            
            {/* Quick status summary */}
            <div className="mt-4">
              <h5 className="font-medium mb-2">Status Summary</h5>
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {formattedStatuses.map((status, idx) => (
                  <div 
                    key={idx} 
                    className="flex-shrink-0 px-3 py-2 bg-gray-50 rounded-md text-xs"
                    style={{ borderLeft: `3px solid ${status.color || '#6B7280'}` }}
                  >
                    <p className="font-medium">{status.status}</p>
                    <p className="text-gray-500">{status.formattedTime}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Stats Tab */}
        {activeTab === 'stats' && taskStats && (
          <div>
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <h5 className="font-medium text-blue-800 mb-1">Total Task Duration</h5>
              <p className="text-2xl font-bold text-blue-700">{formatTime(taskStats.totalDuration)}</p>
            </div>
            
            {/* Time per status chart */}
            <h5 className="font-medium mb-2">Time Spent per Status</h5>
            <div className="space-y-3">
              {Object.entries(taskStats.timePerStatus).map(([status, time]) => {
                const percentage = Math.round((time / taskStats.totalDuration) * 100);
                
                return (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center">
                        <span 
                          className="inline-block w-2 h-2 rounded-full mr-2"
                          style={{ backgroundColor: statusColors[status] || '#6B7280' }}
                        ></span>
                        {status}
                      </span>
                      <span>{formatTime(time)} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full" 
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: statusColors[status] || '#6B7280' 
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Status transitions */}
            <div className="mt-4">
              <h5 className="font-medium mb-2">Status Timeline</h5>
              <div className="border-l-2 border-gray-200 pl-4 ml-3 space-y-4">
                {formattedStatuses.map((status, idx) => (
                  <div 
                    key={idx} 
                    className="relative"
                  >
                    <div 
                      className="absolute w-3 h-3 rounded-full -left-5 top-1"
                      style={{ backgroundColor: status.color }}
                    ></div>
                    <p className="font-medium">{status.status}</p>
                    <p className="text-xs text-gray-500">{status.formattedTime}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
  
        <div className="mt-4 text-xs text-gray-500 text-center italic">
          {isPinned ? 'Click outside to close this tooltip' : 'Click to pin this tooltip'}
        </div>
      </div>
    </div>
  );
}

export default TaskTooltip;