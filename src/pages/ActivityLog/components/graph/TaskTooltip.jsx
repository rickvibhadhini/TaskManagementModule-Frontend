import React, { useEffect, useRef, useState, useCallback } from 'react';
import { format } from 'date-fns';
import { statusColors } from '../../utils/Ganntutils';
import { createPortal } from 'react-dom';

const TaskTooltip = ({ hoveredTask, tooltipPosition, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const tooltipRef = useRef(null);
  const [tooltipStyles, setTooltipStyles] = useState({
    position: 'fixed',
    left: '0px',
    top: '0px',
    zIndex: 9999,
    opacity: 0,
    pointerEvents: 'none'
  });

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

  // Calculate stats for the task
  const calculateTaskStats = useCallback((task) => {
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
  }, []);
  
  // Position the tooltip only once when task or position changes
  useEffect(() => {
    if (!hoveredTask || !tooltipPosition) return;

    // Set initial position with opacity 0
    setTooltipStyles(prev => ({
      ...prev,
      left: `${tooltipPosition.x}px`,
      top: `${tooltipPosition.y + 20}px`,
      opacity: 0
    }));
    
    // Wait for the next frame to get tooltip dimensions and adjust position
    const frameId = requestAnimationFrame(() => {
      if (!tooltipRef.current) return;
      
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Center the tooltip on the position
      let newX = tooltipPosition.x - (tooltipRect.width / 2);
      let newY = tooltipPosition.y + 20; // Below the cursor
      
      // Ensure tooltip stays within viewport bounds
      if (newX < 10) newX = 10;
      if (newX + tooltipRect.width > viewportWidth - 10) {
        newX = viewportWidth - tooltipRect.width - 10;
      }
      
      if (newY + tooltipRect.height > viewportHeight - 10) {
        // Position above the cursor if it would go below viewport
        newY = Math.max(10, tooltipPosition.y - tooltipRect.height - 10);
      }
      
      // Set final position with opacity 1
      setTooltipStyles({
        position: 'fixed',
        left: `${newX}px`,
        top: `${newY}px`,
        zIndex: 9999,
        opacity: 1,
        pointerEvents: 'auto',
        transition: 'opacity 0.2s ease-in-out',
        transform: 'translateZ(0)', // Force hardware acceleration
        willChange: 'transform, opacity'
      });
    });
    
    return () => cancelAnimationFrame(frameId);
  }, [hoveredTask, tooltipPosition]);
  
  // Add click outside handler
  useEffect(() => {
    if (!hoveredTask) return;
    
    const handleClick = (e) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target)) {
        onClose();
      }
    };
    
    // Add with a delay to prevent immediate closing
    const timerId = setTimeout(() => {
      document.addEventListener('click', handleClick);
    }, 100);
    
    return () => {
      clearTimeout(timerId);
      document.removeEventListener('click', handleClick);
    };
  }, [hoveredTask, onClose]);
  
  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  
  if (!hoveredTask) return null;
  
  const segment = hoveredTask.currentSegment;
  if (!segment) return null;

  const formattedStatuses = hoveredTask.statuses.map((status) => ({
    ...status,
    formattedTime: format(status.time, 'h:mm:ss a'),
  }));

  const taskStats = calculateTaskStats(hoveredTask);
  
  // Render tooltip using portal to prevent re-render issues
  return createPortal(
    <div
      ref={tooltipRef}
      className="bg-white rounded-lg shadow-xl border border-gray-200 text-sm task-tooltip"
      style={{
        ...tooltipStyles,
        width: '400px',
        maxHeight: '80vh',
        overflow: 'hidden'
      }}
    >
      {/* Sticky header with tabs and close button */}
      
      <div className="sticky top-0 z-10 bg-white">
        <div className="flex justify-between items-center p-4 pb-2 border-b border-gray-100">
          {/* Use getDisplayName for the header to show a simplified version */}
          <h4 className="font-bold text-lg truncate max-w-[85%]">
            {hoveredTask.originalTaskId === 'sendback' ? 
              `Sendback → ${hoveredTask.targetTaskId || 'Unknown'}` : 
              hoveredTask.id}
          </h4>
          <button
            className="text-gray-500 hover:text-gray-700 focus:outline-none flex-shrink-0 ml-2"
            onClick={onClose}
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
                
                {/* Show target task ID for sendback tasks */}
                {hoveredTask.originalTaskId === 'sendback' && hoveredTask.targetTaskId && (
                  <p><span className="font-semibold">Target Task:</span> {hoveredTask.targetTaskId}</p>
                )}
                
                {/* Show source information for sendback tasks */}
                {hoveredTask.originalTaskId === 'sendback' && hoveredTask.sourceLoanStage && (
                  <p><span className="font-semibold">Source:</span> {hoveredTask.sourceLoanStage} {hoveredTask.sourceSubModule ? `(${hoveredTask.sourceSubModule})` : ''}</p>
                )}
              </div>
              <div>
                <p><span className="font-semibold">Start:</span> {format(segment.startTime, 'h:mm:ss a')}</p>
                <p><span className="font-semibold">End:</span> {format(segment.endTime, 'h:mm:ss a')}</p>
                {/* <p>
                  <span className="font-semibold">Duration:</span> {formatTime(segment.endTime - segment.startTime)}
                </p> */}
              </div>
            </div>
            
            {/* Current segment details */}
            {/* <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h5 className="font-medium mb-2">Current Segment Details</h5>
              <p className="text-sm">
                This task has been in <span className="font-medium">{segment.status}</span> status 
                for {formatTime(segment.endTime - segment.startTime)}, which 
                is {taskStats ? Math.round(((segment.endTime - segment.startTime) / taskStats.totalDuration) * 100) : 0}% 
                of the total task duration.
              </p>
            </div> */}
            
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
            {/* <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <h5 className="font-medium text-blue-800 mb-1">Total Task Duration</h5>
              <p className="text-2xl font-bold text-blue-700">{formatTime(taskStats.totalDuration)}</p>
            </div> */}
            
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
      </div>
    </div>,
    document.body // Render directly to body to prevent re-render issues
  );
}

export default TaskTooltip;
