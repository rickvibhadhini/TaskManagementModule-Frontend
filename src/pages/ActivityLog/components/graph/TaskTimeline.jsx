import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { funnelColors, statusColors } from '../../utils/Ganntutils';
import TaskTooltip from './TaskTooltip';

const TaskTimeline = ({ funnels, tasksByFunnel, timeRange, timeScale, compactView, filters }) => {
  const [hoveredTask, setHoveredTask] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isPinned, setIsPinned] = useState(false);
  const [collapsedFunnels, setCollapsedFunnels] = useState({});
  const [zoomLevel, setZoomLevel] = useState(1);
  const timelineRef = useRef(null);
  const isDragging = useRef(false);
  const dragStart = useRef(null);
  const scrollStart = useRef(null);

  // Handle funnel collapse toggle
  const toggleFunnel = (funnel) => {
    setCollapsedFunnels({
      ...collapsedFunnels,
      [funnel]: !collapsedFunnels[funnel]
    });
  };

  // Generate time ticks based on time scale and zoom level
  const generateTimeTicks = () => {
    if (!timeRange.start || !timeRange.end) return [];
    
    const totalDuration = timeRange.end - timeRange.start;
    const adjustedTimeScale = timeScale / zoomLevel;
    const numTicks = Math.ceil(totalDuration / adjustedTimeScale) + 1;
    
    return Array.from({ length: numTicks }).map((_, i) => {
      const tickTime = new Date(timeRange.start.getTime() + (adjustedTimeScale * i));
      const position = `${(i * adjustedTimeScale / totalDuration) * 100 * zoomLevel}%`;
      return { time: tickTime, position };
    });
  };

  const timeTicks = generateTimeTicks();

  const getSegmentPosition = (segment, timeRange) => {
    if (!timeRange.start || !timeRange.end) return { left: 0, width: 0 };

    const totalDuration = timeRange.end - timeRange.start;
    const segmentStart = segment.startTime - timeRange.start;
    const segmentDuration = segment.endTime - segment.startTime;

    const left = (segmentStart / totalDuration) * 100 * zoomLevel;
    const width = (segmentDuration / totalDuration) * 100 * zoomLevel;

    return { left: `${left}%`, width: `${Math.max(width, 0.5)}%` };
  };

  const handleTaskClick = (e, task, segment) => {
    e.stopPropagation();
    if (hoveredTask && hoveredTask.id === task.id && hoveredTask.funnel === task.funnel && isPinned) {
      setHoveredTask(null);
      setIsPinned(false);
    } else {
      setHoveredTask({ ...task, currentSegment: segment });
      setTooltipPosition({ x: e.clientX, y: e.clientY });
      setIsPinned(true);
    }
  };

  const handleTaskMouseEnter = (e, task, segment) => {
    if (!isPinned) {
      setHoveredTask({ ...task, currentSegment: segment });
      setTooltipPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleTaskMouseLeave = () => {
    if (!isPinned) {
      setHoveredTask(null);
    }
  };

  const handleTooltipClose = () => {
    setHoveredTask(null);
    setIsPinned(false);
  };

  // Handle mouse wheel for zooming
  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY * -0.01;
      setZoomLevel(Math.max(0.5, Math.min(5, zoomLevel + delta)));
    }
  };

  // Handle mouse down for panning
  const handleMouseDown = (e) => {
    if (e.button === 0) { // Left mouse button
      isDragging.current = true;
      dragStart.current = e.clientX;
      scrollStart.current = timelineRef.current.scrollLeft;
      document.body.style.cursor = 'grabbing';
    }
  };

  // Handle mouse move for panning
  const handleMouseMove = (e) => {
    if (isDragging.current) {
      const dx = e.clientX - dragStart.current;
      timelineRef.current.scrollLeft = scrollStart.current - dx;
    }
  };

  // Handle mouse up for panning
  const handleMouseUp = () => {
    isDragging.current = false;
    document.body.style.cursor = 'default';
  };

  // Handle mouse leave for panning
  const handleMouseLeave = () => {
    if (isDragging.current) {
      isDragging.current = false;
      document.body.style.cursor = 'default';
    }
  };

  // Format duration in a human-readable way
  const formatDuration = (segment) => {
    const durationMs = segment.endTime - segment.startTime;
    const seconds = Math.floor(durationMs / 1000);
    
    if (seconds < 60) {
      return `${seconds}s`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    }
  };

  // Calculate task statistics
  const calculateTaskStats = (task) => {
    // Find the fastest and slowest segments
    let fastestSegment = null;
    let slowestSegment = null;
    
    task.segments.forEach(segment => {
      const duration = segment.endTime - segment.startTime;
      
      if (!fastestSegment || duration < (fastestSegment.endTime - fastestSegment.startTime)) {
        fastestSegment = segment;
      }
      
      if (!slowestSegment || duration > (slowestSegment.endTime - slowestSegment.startTime)) {
        slowestSegment = segment;
      }
    });
    
    return {
      fastestSegment,
      slowestSegment,
      totalDuration: task.segments.reduce((total, segment) => {
        return total + (segment.endTime - segment.startTime);
      }, 0)
    };
  };

  // Add event listeners for wheel and mouse events
  useEffect(() => {
    const timeline = timelineRef.current;
    
    if (timeline) {
      timeline.addEventListener('wheel', handleWheel, { passive: false });
      timeline.addEventListener('mousedown', handleMouseDown);
      timeline.addEventListener('mousemove', handleMouseMove);
      timeline.addEventListener('mouseup', handleMouseUp);
      timeline.addEventListener('mouseleave', handleMouseLeave);
      
      return () => {
        timeline.removeEventListener('wheel', handleWheel);
        timeline.removeEventListener('mousedown', handleMouseDown);
        timeline.removeEventListener('mousemove', handleMouseMove);
        timeline.removeEventListener('mouseup', handleMouseUp);
        timeline.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, []);

  return (
    <div className="flex" style={{ borderTop: '1px solid #e5e7eb' }}>
      {/* Left sidebar for task names */}
      <div className="w-48 flex-shrink-0 border-r border-gray-200">
        {/* Empty row to align with time axis header */}
        <div className="h-10 bg-gray-50 border-b border-gray-200 flex items-center">
          <span className="text-xs text-gray-500 ml-3">Task ID</span>
        </div>
        
        {funnels.map((funnel, funnelIdx) => {
          const funnelTasks = tasksByFunnel[funnel] || [];
          const isCollapsed = collapsedFunnels[funnel];
          
          return (
            <div key={funnelIdx}>
              <div 
                className="py-2 px-3 font-medium bg-gray-50 border-b border-gray-200 flex items-center justify-between cursor-pointer"
                onClick={() => toggleFunnel(funnel)}
              >
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: funnelColors[funnel] || '#95a5a6' }}
                  ></div>
                  <span className="text-gray-700">{funnel}</span>
                </div>
                <span className="text-xs bg-gray-200 rounded-full px-2 py-0.5">
                  {funnelTasks.length}
                </span>
                <svg 
                  className={`w-4 h-4 transform transition-transform ${isCollapsed ? '' : 'rotate-90'}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              {!isCollapsed && funnelTasks.map((task, idx) => (
                <div key={idx} className="border-b border-gray-100">
                  <div className={`flex items-center px-3 ${compactView ? 'h-6' : 'h-10'}`}>
                    <span
                      className="text-sm truncate cursor-pointer hover:text-blue-600"
                      onClick={(e) => handleTaskClick(e, task, task.segments[0])}
                      onMouseEnter={(e) => handleTaskMouseEnter(e, task, task.segments[0])}
                      onMouseLeave={handleTaskMouseLeave}
                    >
                      {task.id}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Main timeline graph */}
      <div 
        className="flex-1 overflow-x-auto relative" 
        ref={timelineRef}
        style={{ cursor: isDragging.current ? 'grabbing' : 'grab' }}
      >
        <div className="min-width-content" style={{ width: `${100 * zoomLevel}%` }}>
          {/* Vertical grid lines */}
          {timeTicks.map((tick, i) => (
            <div
              key={`grid-line-${i}`}
              className="absolute top-0 bottom-0 border-l border-gray-300"
              style={{
                left: tick.position,
                height: '100%',
                zIndex: 1
              }}
            />
          ))}

          {/* Time axis header */}
          <div className="border-b border-gray-200 py-2 relative h-10 bg-gray-50">
            <div className="flex items-center justify-between px-4 absolute right-4 top-1/2 transform -translate-y-1/2 z-20">
              <div className="text-xs bg-white px-2 py-1 rounded-md shadow-sm border border-gray-200">
                Zoom: {Math.round(zoomLevel * 100)}% | Ctrl+Wheel to zoom, Drag to pan
              </div>
            </div>
            
            {timeTicks.map((tick, i) => (
              <div
                key={i}
                className="absolute top-0 h-full flex items-center"
                style={{ left: tick.position }}
              >
                <div className="text-xs text-gray-500">
                  {format(tick.time, 'HH:mm:ss')}
                </div>
              </div>
            ))}
          </div>

          {/* Funnel timelines */}
          <div className="relative">
            {funnels.map((funnel, funnelIdx) => {
              const funnelTasks = tasksByFunnel[funnel] || [];
              const funnelColor = funnelColors[funnel] || '#95a5a6';
              const isCollapsed = collapsedFunnels[funnel];

              // Calculate funnel stats
              const completedTasks = funnelTasks.filter(t => 
                t.finalStatus && t.finalStatus.status === 'COMPLETED'
              ).length;
              const completionPercentage = funnelTasks.length > 0 
                ? Math.round((completedTasks / funnelTasks.length) * 100) 
                : 0;

              return (
                <div key={funnelIdx} className="relative">
                  {/* Funnel header with stats */}
                  <div 
                    className="h-10 border-b border-gray-200 bg-gray-50 flex items-center justify-between"
                    onClick={() => toggleFunnel(funnel)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Stats */}
                    <div className="flex items-center ml-3 space-x-4">
                      <span className="text-xs text-gray-500">
                        Tasks: <span className="font-medium">{funnelTasks.length}</span>
                      </span>
                      <span className="text-xs text-gray-500">
                        Completed: <span className="font-medium">{completionPercentage}%</span>
                      </span>
                    </div>
                    
                    {/* Collapse indicator */}
                    <svg 
                      className={`w-4 h-4 transform transition-transform mr-3 ${isCollapsed ? '' : 'rotate-90'}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>

                  {/* Task rows */}
                  {!isCollapsed && funnelTasks.map((task, idx) => {
                    // Sort segments by start time for connector lines
                    const sortedSegments = [...task.segments].sort((a, b) => a.startTime - b.startTime);
                    const taskStats = calculateTaskStats(task);
                    
                    return (
                      <div
                        key={idx}
                        className="relative border-b border-gray-100"
                        id={`task-row-${funnel}-${idx}`}
                      >
                        <div className={`relative ${compactView ? 'h-6' : 'h-10'}`}>
                          {/* Connector lines */}
                          {sortedSegments.length > 1 && sortedSegments.slice(0, -1).map((segment, segIdx) => {
                            const nextSegment = sortedSegments[segIdx + 1];
                            const currentPos = getSegmentPosition(segment, timeRange);
                            const nextPos = getSegmentPosition(nextSegment, timeRange);
                            
                            const currentLeft = parseFloat(currentPos.left);
                            const currentWidth = parseFloat(currentPos.width);
                            const nextLeft = parseFloat(nextPos.left);
                            
                            return (
                              <div
                                key={`connector-${task.id}-${segIdx}`}
                                className="absolute border-t-2 border-dashed border-gray-400"
                                style={{
                                  left: `calc(${currentLeft}% + ${currentWidth}%)`,
                                  width: `calc(${nextLeft}% - ${currentLeft}% - ${currentWidth}%)`,
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  zIndex: 5
                                }}
                              />
                            );
                          })}
                          
                          {/* Task segments */}
                          {task.segments.map((segment, segmentIdx) => {
                            const position = getSegmentPosition(segment, timeRange);
                            const statusColor = statusColors[segment.status] || '#6B7280';
                            const width = parseFloat(position.width);
                            const isHighlighted = segment === taskStats.slowestSegment || segment === taskStats.fastestSegment;
                            
                            // Determine if this segment should have special styling
                            let specialStyle = {};
                            if (segment === taskStats.slowestSegment) {
                              specialStyle = { 
                                boxShadow: '0 0 0 2px rgba(220, 38, 38, 0.5)', 
                                zIndex: 15 
                              };
                            } else if (segment === taskStats.fastestSegment) {
                              specialStyle = { 
                                boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.5)', 
                                zIndex: 15 
                              };
                            }

                            return (
                              <div
                                key={segmentIdx}
                                className="absolute task-segment flex items-center rounded"
                                style={{
                                  left: position.left,
                                  width: position.width,
                                  height: compactView ? '12px' : '20px',
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  backgroundColor: funnelColor,
                                  zIndex: 10,
                                  ...specialStyle
                                }}
                                onClick={(e) => handleTaskClick(e, task, segment)}
                                onMouseEnter={(e) => handleTaskMouseEnter(e, task, segment)}
                                onMouseLeave={handleTaskMouseLeave}
                              >
                                {!compactView && width > 5 && (
                                  <span className="text-xs text-white truncate px-1.5">
                                    {formatDuration(segment)}
                                  </span>
                                )}

                                <div
                                  className="absolute right-0 top-0 transform -translate-y-1/2 translate-x-1/2"
                                  style={{ zIndex: 11 }}
                                >
                                  <div
                                    className={`rounded-full border-2 border-white shadow-sm ${compactView ? 'w-2.5 h-2.5' : 'w-4 h-4'}`}
                                    style={{ backgroundColor: statusColor }}
                                    title={segment.status}
                                  ></div>
                                </div>
                                
                                {/* Task indicators */}
                                {!compactView && isHighlighted && (
                                  <div className="absolute top-0 left-0 transform -translate-y-full -translate-x-1/2">
                                    <span className={`text-xs px-1 py-0.5 rounded ${
                                      segment === taskStats.slowestSegment ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                    }`}>
                                      {segment === taskStats.slowestSegment ? 'Slowest' : 'Fastest'}
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* Tooltip Component */}
            <TaskTooltip
              hoveredTask={hoveredTask}
              tooltipPosition={tooltipPosition}
              onClose={handleTooltipClose}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskTimeline;