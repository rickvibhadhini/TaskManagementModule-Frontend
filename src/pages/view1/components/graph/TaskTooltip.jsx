import React, { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { statusColors } from '../../utils/Ganntutils';

const TaskTooltip = ({ hoveredTask, tooltipPosition, onClose }) => {
  const [isPinned, setIsPinned] = useState(false);
  const [adjustedPosition, setAdjustedPosition] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef(null);
  const timelineRef = useRef(null);

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

  if (!hoveredTask) return null;

  const segment = hoveredTask.currentSegment;
  if (!segment) return null;

  const formattedStatuses = hoveredTask.statuses.map((status) => ({
    ...status,
    formattedTime: format(status.time, 'HH:mm:ss'),
  }));

  // Calculate the required width for the timeline based on number of statuses
  const minStatusSpacing = 120; // Increased from 80 to provide more space
  const timelineWidth = formattedStatuses.length * minStatusSpacing;

  return (
    <div
      ref={tooltipRef}
      className="fixed z-50 bg-white p-4 rounded-lg shadow-xl border border-gray-200 text-sm task-tooltip"
      style={{
        left: `${adjustedPosition.x}px`,
        top: `${adjustedPosition.y}px`,
        maxWidth: '400px',
        maxHeight: '80vh',
        overflow: 'auto',
        opacity: 1,
        transform: 'translateZ(0)', // Force GPU acceleration
        willChange: 'transform', // Hint for browser optimization
        transition: 'opacity 0.15s ease-in-out',
      }}
      onClick={handleTooltipClick}
    >
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-bold text-lg">{hoveredTask.id}</h4>
        <button
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
          onClick={handleCloseClick}
        >
          &times;
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div>
          <p>
            <span className="font-semibold">Funnel:</span>
            <span className="ml-1 inline-flex items-center">
              <span className="inline-block w-3 h-3 rounded-full mr-1" style={{ backgroundColor: hoveredTask.funnelColor }}></span>
              {hoveredTask.funnel}
            </span>
          </p>
          <p>
            <span className="font-semibold">Current Status:</span>
            <span className="ml-1 inline-flex items-center">
              <span className="inline-block w-3 h-3 rounded-full mr-1" style={{ backgroundColor: statusColors[segment.status] || '#6B7280' }}></span>
              {segment.status}
            </span>
          </p>
          <p><span className="font-semibold">Actor ID:</span> {hoveredTask.actorId || 'None'}</p>
        </div>
        <div>
          <p><span className="font-semibold">Start:</span> {format(segment.startTime, 'HH:mm:ss')}</p>
          <p><span className="font-semibold">End:</span> {format(segment.endTime, 'HH:mm:ss')}</p>
          <p><span className="font-semibold">Duration:</span> {((segment.endTime - segment.startTime) / 1000).toFixed(2)}s</p>
        </div>
      </div>

      {/* Status Timeline - Fixed width approach */}
      <div className="mt-4">
        <p className="font-semibold mb-2">Status Timeline:</p>
      
        <div 
          className="relative" 
          ref={timelineRef}
          style={{ 
            width: `${Math.max(350, timelineWidth)}px`, 
            height: '90px', 
            overflow: 'visible' 
          }}
        >
          {/* Timeline bar */}
          <div className="absolute left-0 right-0 h-0.5 bg-gray-300" style={{ top: '20px' }}></div>
          
          {/* Remove the timeline markers that were causing duplicate timestamps */}
          {/* <div className="absolute left-0 text-xs text-gray-500">{format(formattedStatuses[0].time, 'HH:mm:ss')}</div>
          <div className="absolute right-0 text-xs text-gray-500">{format(formattedStatuses[formattedStatuses.length - 1].time, 'HH:mm:ss')}</div> */}
        
          {/* Status points with even spacing */}
          {formattedStatuses.map((status, idx) => {
            // Calculate position based on even spacing
            const position = (idx / (formattedStatuses.length - 1)) * 100;
          
            return (
              <div key={idx} className="absolute pointer-events-none" style={{ left: `${position}%`, top: 0 }}>
                {/* Status dot */}
                <div className="relative">
                  <div
                    className="absolute w-5 h-5 rounded-full border-2 border-white shadow-md"
                    style={{ 
                      backgroundColor: status.color,
                      top: '20px',
                      left: '-10px'
                    }}
                    title={`${status.status} at ${status.formattedTime}`}
                  ></div>
                </div>
              
                {/* Status label */}
                <div
                  className="absolute text-xs font-medium whitespace-nowrap"
                  style={{
                    top: '45px',
                    left: '-25px',
                    width: '50px',
                    textAlign: 'center'
                  }}
                >
                  {status.status}
                </div>
              
                {/* Time label - single timestamp from API */}
                <div
                  className="absolute text-xs text-gray-500"
                  style={{
                    top: '0px',
                    left: '-30px',
                    width: '60px',
                    textAlign: 'center'
                  }}
                >
                  {format(status.time, 'HH:mm:ss')}
                </div>
              </div>
            );
          })}
        
          {/* Connector lines between points */}
          {formattedStatuses.slice(0, -1).map((status, idx) => {
            const nextStatus = formattedStatuses[idx + 1];
            const startPosition = (idx / (formattedStatuses.length - 1)) * 100;
            const endPosition = ((idx + 1) / (formattedStatuses.length - 1)) * 100;
          
            return (
              <div
                key={`connector-${idx}`}
                className="absolute h-0.5 bg-gray-400 pointer-events-none"
                style={{
                  left: `${startPosition}%`,
                  top: '20px',
                  width: `${endPosition - startPosition}%`,
                }}
              ></div>
            );
          })}
        </div>
      </div>

      <div className="mt-2 text-xs text-gray-500 text-center italic">
        {isPinned ? 'Click outside to close this tooltip' : 'Click to pin this tooltip'}
      </div>
    </div>
  );
};

export default TaskTooltip;