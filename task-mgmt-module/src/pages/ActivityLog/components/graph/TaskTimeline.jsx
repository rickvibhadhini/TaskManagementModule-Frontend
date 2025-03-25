import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { format } from 'date-fns';
import { funnelColors, statusColors } from '../../utils/Ganntutils';
import TaskTooltip from './TaskTooltip';

const TaskTimeline = ({ funnels, tasksByFunnel, timeRange, timeScale, compactView, filters }) => {
  const [hoveredTask, setHoveredTask] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [collapsedFunnels, setCollapsedFunnels] = useState({});
  const [zoomLevel, setZoomLevel] = useState(1);
  const [connectionKey, setConnectionKey] = useState(0); // For forcing connection updates

  const timelineRef = useRef(null);
  const headerRef = useRef(null);
  const isDragging = useRef(false);
  const dragStart = useRef(null);
  const scrollStart = useRef(null);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const hoverIntentTimerRef = useRef(null);
  const currentHoveredTaskRef = useRef(null);
  const isDraggingTaskRef = useRef(false);
  const initialScrollAppliedRef = useRef(false);

  // Toggle funnel collapse
  const toggleFunnel = useCallback((funnel) => {
    setCollapsedFunnels(prev => ({
      ...prev,
      [funnel]: !prev[funnel]
    }));
  }, []);

  // Generate time ticks based on time scale and zoom level
  const generateTimeTicks = useCallback(() => {
    if (!timeRange.start || !timeRange.end) return [];

    const totalDuration = timeRange.end - timeRange.start;
    const adjustedTimeScale = timeScale / zoomLevel;
    const numTicks = Math.ceil(totalDuration / adjustedTimeScale) + 1;

    return Array.from({ length: numTicks }).map((_, i) => {
      const tickTime = new Date(timeRange.start.getTime() + (adjustedTimeScale * i));
      const position = `${(i * adjustedTimeScale / totalDuration) * 100 * zoomLevel}%`;
      return { time: tickTime, position };
    });
  }, [timeRange, timeScale, zoomLevel]);

  const timeTicks = generateTimeTicks();

  // Synchronize horizontal scroll between header and content in both directions
  const synchronizeScroll = useCallback((source) => {
    if (headerRef.current && timelineRef.current) {
      const headerContent = headerRef.current.querySelector('.flex-1');
      const timelineContent = timelineRef.current.querySelector('.flex-1');
      
      if (headerContent && timelineContent) {
        if (source === 'header') {
          timelineContent.scrollLeft = headerContent.scrollLeft;
        } else {
          headerContent.scrollLeft = timelineContent.scrollLeft;
        }
      }
    }
  }, []);

  // Scroll to the rightmost part (most recent events) on initial load
  useEffect(() => {
    if (!initialScrollAppliedRef.current && timelineRef.current && headerRef.current) {
      const timelineContent = timelineRef.current.querySelector('.flex-1');
      const headerContent = headerRef.current.querySelector('.flex-1');
      
      if (timelineContent && headerContent) {
        // Set scroll to the rightmost position
        const maxScroll = timelineContent.scrollWidth - timelineContent.clientWidth;
        timelineContent.scrollLeft = maxScroll;
        headerContent.scrollLeft = maxScroll;
        initialScrollAppliedRef.current = true;
      }
    }
  }, [timeRange, zoomLevel]);

  const getSegmentPosition = useCallback((segment, timeRange) => {
    if (!timeRange.start || !timeRange.end) return { left: 0, width: 0 };

    const totalDuration = timeRange.end - timeRange.start;
    const segmentStart = segment.startTime - timeRange.start;
    const segmentDuration = segment.endTime - segment.startTime;

    const left = (segmentStart / totalDuration) * 100 * zoomLevel;
    const width = (segmentDuration / totalDuration) * 100 * zoomLevel;

    return { left: `${left}%`, width: `${Math.max(width, 0.5)}%` };
  }, [zoomLevel]);

  // Format task display name
  const getTaskDisplayName = useCallback((task) => {
    // Check if this is a sendback task
    const isSendback = task.originalTaskId === "sendback";

    if (isSendback) {
      let displayText = "sendback";
  
      // Add target task information if available
      if (task.targetTaskId) {
        displayText += ` → ${task.targetTaskId}`;
      }
  
      // Add source information if available
      if (task.sourceLoanStage) {
        displayText += ` (${task.sourceLoanStage})`;
      }
  
      return displayText;
    }

    // For regular tasks, just return the original task ID
    return task.id;
  }, []);

  // Clear hover intent timer
  const clearHoverIntent = useCallback(() => {
    if (hoverIntentTimerRef.current) {
      clearTimeout(hoverIntentTimerRef.current);
      hoverIntentTimerRef.current = null;
    }
  }, []);

  // Handle task click
  const handleTaskClick = useCallback((e, task, segment) => {
    e.stopPropagation();
    e.preventDefault();

    // Clear any existing hover intent
    clearHoverIntent();

    // If user is dragging, don't trigger click
    if (isDraggingTaskRef.current) {
      isDraggingTaskRef.current = false;
      return;
    }

    // If the same task is already shown, close it
    if (hoveredTask && hoveredTask.id === task.id && hoveredTask.funnel === task.funnel) {
      setHoveredTask(null);
      currentHoveredTaskRef.current = null;
      return;
    }

    // Show the task tooltip at the click position
    currentHoveredTaskRef.current = { id: task.id, funnel: task.funnel };
    setHoveredTask({ ...task, currentSegment: segment });
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  }, [hoveredTask, clearHoverIntent]);

  // Handle task mouse enter with hover intent
  const handleTaskMouseEnter = useCallback((e, task, segment) => {
    // If there's an open tooltip, don't change it
    if (hoveredTask) return;

    // Clear any existing hover intent
    clearHoverIntent();

    // Store the current mouse position
    mousePositionRef.current = { x: e.clientX, y: e.clientY };

    // Set a timeout to show the tooltip only if mouse stays on element
    hoverIntentTimerRef.current = setTimeout(() => {
      currentHoveredTaskRef.current = { id: task.id, funnel: task.funnel };
      setHoveredTask({ ...task, currentSegment: segment });
      setTooltipPosition({ x: e.clientX, y: e.clientY });
    }, 300); // Delay showing the tooltip to prevent flickering
  }, [hoveredTask, clearHoverIntent]);

  // Handle task mouse leave
  const handleTaskMouseLeave = useCallback(() => {
    // If there's no tooltip or user is actively dragging, do nothing
    if (isDraggingTaskRef.current) return;

    // Clear hover intent timer
    clearHoverIntent();

    // If there's an open tooltip that was triggered by hover (not click), close it
    if (hoveredTask && !document.activeElement) {
      // Use a short delay to allow the mouse to move between elements
      hoverIntentTimerRef.current = setTimeout(() => {
        setHoveredTask(null);
        currentHoveredTaskRef.current = null;
      }, 100);
    }
  }, [hoveredTask, clearHoverIntent]);

  // Handle tooltip close
  const handleTooltipClose = useCallback(() => {
    setHoveredTask(null);
    currentHoveredTaskRef.current = null;
  }, []);

  // Draw connections between sendback tasks and their targets using HTML elements
  const drawTaskConnections = useCallback(() => {
    // First remove any existing connection lines
    const existingLines = document.querySelectorAll('.sendback-connection-line, .sendback-connection-arrow');
    existingLines.forEach(line => line.remove());

    // Find all sendback tasks
    const allTasks = Object.values(tasksByFunnel).flat();
    const sendbackTasks = allTasks.filter(task => 
      task.originalTaskId === 'sendback' && task.targetTaskId && !collapsedFunnels[task.funnel]
    );

    if (!timelineRef.current || sendbackTasks.length === 0) return;

    // Get timeline container for positioning
    const timeline = timelineRef.current.querySelector('.flex-1');
    if (!timeline) return;
    
    const timelineRect = timeline.getBoundingClientRect();

    // Create connections for each sendback task
    sendbackTasks.forEach(sendbackTask => {
      // Find the target task
      const targetTasks = allTasks.filter(
        task => task.id === sendbackTask.targetTaskId && !collapsedFunnels[task.funnel]
      );
  
      if (targetTasks.length === 0) return;
      const targetTask = targetTasks[0];
  
      // Try to get task elements from DOM
      const sendbackEl = document.querySelector(`.task-row-${sendbackTask.funnel}-${sendbackTask.id} .task-segment`);
      const targetEl = document.querySelector(`.task-row-${targetTask.funnel}-${targetTask.id} .task-segment`);
  
      if (!sendbackEl || !targetEl) return;
  
      // Get positions
      const sendbackRect = sendbackEl.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();
  
      // Calculate positions for the line
      const lineX = sendbackRect.right - timelineRect.left + timeline.scrollLeft;
      const sendbackY = sendbackRect.top - timelineRect.top + timeline.scrollTop + (sendbackRect.height / 2);
      const targetY = targetRect.top - timelineRect.top + timeline.scrollTop + (targetRect.height / 2);
      const lineHeight = Math.abs(targetY - sendbackY);
      const topY = Math.min(sendbackY, targetY);
  
      // Create the connection line
      const line = document.createElement('div');
      line.className = 'sendback-connection-line';
      line.style.position = 'absolute';
      line.style.left = `${lineX}px`;
      line.style.top = `${topY}px`;
      line.style.width = '2px';
      line.style.height = `${lineHeight}px`;
      line.style.borderLeft = '2px dashed #f97316';
      line.style.zIndex = '50';
  
      // Create arrow
      const arrow = document.createElement('div');
      arrow.className = 'sendback-connection-arrow';
      arrow.style.position = 'absolute';
      arrow.style.left = `${lineX - 4}px`;
      arrow.style.top = sendbackY < targetY ? `${targetY - 4}px` : `${targetY - 4}px`;
      arrow.style.width = '0';
      arrow.style.height = '0';
      arrow.style.borderLeft = '5px solid transparent';
      arrow.style.borderRight = '5px solid transparent';
      arrow.style.borderTop = sendbackY < targetY ? '6px solid #f97316' : 'none';
      arrow.style.borderBottom = sendbackY > targetY ? '6px solid #f97316' : 'none';
      arrow.style.zIndex = '51';
  
      // Add elements to the timeline
      timeline.appendChild(line);
      timeline.appendChild(arrow);
    });
  }, [tasksByFunnel, collapsedFunnels, connectionKey]);

  // Track global mouse position to handle smooth hovering between elements
  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Handle content scroll
  useEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline) return;

    const timelineContent = timeline.querySelector('.flex-1');
    if (!timelineContent) return;

    const handleScroll = () => {
      synchronizeScroll('timeline');
      
      // Handle connection redrawing on scroll
      if (timelineContent.scrollTimeout) {
        clearTimeout(timelineContent.scrollTimeout);
      }
  
      timelineContent.scrollTimeout = setTimeout(() => {
        setConnectionKey(prev => prev + 1);
        drawTaskConnections();
      }, 100);
    };

    timelineContent.addEventListener('scroll', handleScroll);

    return () => {
      timelineContent.removeEventListener('scroll', handleScroll);
      if (timelineContent.scrollTimeout) {
        clearTimeout(timelineContent.scrollTimeout);
      }
    };
  }, [drawTaskConnections, synchronizeScroll]);

  // Handle header scroll
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const headerContent = header.querySelector('.flex-1');
    if (!headerContent) return;

    const handleHeaderScroll = () => {
      synchronizeScroll('header');
    };

    headerContent.addEventListener('scroll', handleHeaderScroll);

    return () => {
      headerContent.removeEventListener('scroll', handleHeaderScroll);
    };
  }, [synchronizeScroll]);

  // Handle mouse wheel for zooming
  const handleWheel = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY * -0.01;
      setZoomLevel(prev => Math.max(0.5, Math.min(5, prev + delta)));
    }
  }, []);

  // Handle mouse down for panning
  const handleMouseDown = useCallback((e) => {
    if (e.button === 0) { // Left mouse button
      isDragging.current = true;
      isDraggingTaskRef.current = true;
      dragStart.current = e.clientX;
      
      const timelineContent = timelineRef.current.querySelector('.flex-1');
      if (timelineContent) {
        scrollStart.current = timelineContent.scrollLeft;
      }
      
      document.body.style.cursor = 'grabbing';
  
      // Prevent text selection during drag
      e.preventDefault();
    }
  }, []);

  // Handle mouse move for panning
  const handleMouseMove = useCallback((e) => {
    if (isDragging.current) {
      const dx = e.clientX - dragStart.current;
      if (Math.abs(dx) > 5) {
        isDraggingTaskRef.current = true;
      }
      
      const timelineContent = timelineRef.current.querySelector('.flex-1');
      if (timelineContent) {
        timelineContent.scrollLeft = scrollStart.current - dx;
        synchronizeScroll('timeline');
      }
    }
  }, [synchronizeScroll]);

  // Handle mouse up for panning
  const handleMouseUp = useCallback(() => {
    if (isDragging.current) {
      isDragging.current = false;
      document.body.style.cursor = 'default';
  
      // Keep isDraggingTaskRef true for a moment to prevent accidental clicks
      setTimeout(() => {
        isDraggingTaskRef.current = false;
      }, 50);
    }
  }, []);

  // Handle mouse leave for panning
  const handleMouseLeave = useCallback(() => {
    if (isDragging.current) {
      isDragging.current = false;
      document.body.style.cursor = 'default';
    }
  }, []);

  // Format duration in a human-readable way
  const formatDuration = useCallback((segment) => {
    const durationMs = segment.endTime - segment.startTime;
    const seconds = Math.floor(durationMs / 1000);

    if (seconds < 60) {
      return `${seconds}s`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    }
  }, []);

  // Calculate task statistics
  const calculateTaskStats = useCallback((task) => {
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
  }, []);

  // Add event listeners for wheel
  useEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline) return;
    
    const timelineContent = timeline.querySelector('.flex-1');
    if (!timelineContent) return;

    timelineContent.addEventListener('wheel', handleWheel, { passive: false });
  
    return () => {
      timelineContent.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  // Update connections when needed
  useLayoutEffect(() => {
    const timer = setTimeout(() => {
      drawTaskConnections();
    }, 200); // Ensure DOM is ready

    return () => clearTimeout(timer);
  }, [drawTaskConnections, tasksByFunnel, collapsedFunnels, zoomLevel]);

  // Update connections on window scroll
  useEffect(() => {
    const handleWindowScroll = () => {
      if (window.scrollTimeout) {
        clearTimeout(window.scrollTimeout);
      }
  
      window.scrollTimeout = setTimeout(() => {
        setConnectionKey(prev => prev + 1);
        drawTaskConnections();
      }, 100);
    };

    window.addEventListener('scroll', handleWindowScroll);

    return () => {
      window.removeEventListener('scroll', handleWindowScroll);
      if (window.scrollTimeout) {
        clearTimeout(window.scrollTimeout);
      }
    };
  }, [drawTaskConnections]);

  // Clean up any timeouts when component unmounts
  useEffect(() => {
    return () => {
      clearHoverIntent();
      const existingLines = document.querySelectorAll('.sendback-connection-line, .sendback-connection-arrow');
      existingLines.forEach(line => line.remove());
    };
  }, [clearHoverIntent]);

  return (
    <div className="flex flex-col" style={{ borderTop: '1px solid #e5e7eb' }}>
      {/* Fixed zoom control */}
      <div className="fixed top-4 right-4 z-40">
        <div className="text-xs bg-white px-2 py-1 rounded-md shadow-sm border border-gray-200">
          Zoom: {Math.round(zoomLevel * 100)}% | Ctrl+Wheel to zoom, Drag to pan
        </div>
      </div>

      {/* Header row - Make this entire row sticky */}
      <div className="sticky top-0 z-30 flex border-b border-gray-200" ref={headerRef}>
        {/* Left sidebar header */}
        <div className="w-48 flex-shrink-0 border-r border-gray-200">
          <div className="h-10 bg-gray-50 flex items-center">
            <span className="text-xs text-gray-500 ml-3">Task ID</span>
          </div>
        </div>

        {/* Timeline header */}
        <div className="flex-1 overflow-x-auto bg-gray-50" style={{ overflowY: 'hidden' }}>
          <div className="relative min-width-content" style={{ width: `${100 * zoomLevel}%`, height: '40px' }}>
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
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-1" ref={timelineRef}>
        {/* Left sidebar for task names */}
        <div className="w-48 flex-shrink-0 border-r border-gray-200 overflow-y-auto">
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
                        title={getTaskDisplayName(task)}
                      >
                        {getTaskDisplayName(task)}
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
          className="flex-1 overflow-x-auto overflow-y-auto relative"
          style={{ 
            cursor: isDragging.current ? 'grabbing' : 'grab'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          <div className="min-width-content relative" style={{ width: `${100 * zoomLevel}%` }}>
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
                    {!isCollapsed && funnelTasks.map((task, taskIdx) => {
                      // Sort segments by start time for connector lines
                      const sortedSegments = [...task.segments].sort((a, b) => a.startTime - b.startTime);
                      const taskStats = calculateTaskStats(task);
                  
                      return (
                        <div
                          key={taskIdx}
                          className={`relative border-b border-gray-100 task-row-${funnel}-${task.id}`}
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
    </div>
  );
};

export default TaskTimeline;