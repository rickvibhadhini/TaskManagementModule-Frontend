import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { format } from 'date-fns';
import { funnelColors, statusColors } from '../../utils/Ganntutils';
import TaskTooltip from './TaskTooltip';

const TaskTimeline = ({ funnels, tasksByFunnel, timeRange, timeScale, compactView, filters }) => {
  const [hoveredTask, setHoveredTask] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [collapsedFunnels, setCollapsedFunnels] = useState({});
  const [zoomLevel, setZoomLevel] = useState(1);
  const [connectionKey, setConnectionKey] = useState(0);
  const [discreteTimePoints, setDiscreteTimePoints] = useState([]);
  const [showDiscreteTime, setShowDiscreteTime] = useState(true);

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

  // Constants for consistent sizing - critical for alignment
  const ROW_HEIGHT = compactView ? 26 : 40; // Using numeric values for precise calculation
  const HEADER_HEIGHT = 60;
  const FUNNEL_HEADER_HEIGHT = 40;

  // Toggle funnel collapse
  const toggleFunnel = useCallback((funnel) => {
    setCollapsedFunnels(prev => ({
      ...prev,
      [funnel]: !prev[funnel]
    }));
  }, []);

  // Identify discrete time points from task data
  const identifyDiscreteTimePoints = useCallback(() => {
    if (!timeRange.start || !timeRange.end) return [];
    
    // Collect all unique timestamps where tasks start or end
    const allTasks = Object.values(tasksByFunnel).flat();
    const timePointsSet = new Set();
    
    allTasks.forEach(task => {
      task.segments.forEach(segment => {
        timePointsSet.add(segment.startTime.getTime());
        timePointsSet.add(segment.endTime.getTime());
      });
    });
    
    // Convert to array and sort
    const timePoints = Array.from(timePointsSet).sort((a, b) => a - b);
    
    // If no time points, use timeRange boundaries
    if (timePoints.length === 0) {
      return [timeRange.start.getTime(), timeRange.end.getTime()];
    }
    
    // Add surrounding minutes to the earliest and latest points for context
    const minTime = Math.max(timeRange.start.getTime(), timePoints[0] - 60000);
    const maxTime = Math.min(timeRange.end.getTime(), timePoints[timePoints.length - 1] + 60000);
    
    // Create the final array with Date objects
    return [minTime, ...timePoints, maxTime].map(t => new Date(t));
  }, [tasksByFunnel, timeRange]);

  // Generate time ticks with better spacing and limited count for readability
  const generateTimeTicks = useCallback(() => {
    if (!timeRange.start || !timeRange.end || discreteTimePoints.length === 0) return [];
    
    if (!showDiscreteTime) {
      // Linear time ticks (original behavior)
      const adjustedTimeScale = timeScale / zoomLevel;
      const totalDuration = timeRange.end - timeRange.start;
      
      // Reduce the number of ticks to prevent overcrowding
      const preferredTickInterval = Math.max(adjustedTimeScale, 300000); // At least 5 minutes between ticks
      const numTicks = Math.min(Math.ceil(totalDuration / preferredTickInterval) + 1, 20); // Cap at 20 ticks
      const actualInterval = totalDuration / (numTicks - 1);
      
      return Array.from({ length: numTicks }).map((_, i) => {
        const tickTime = new Date(timeRange.start.getTime() + (actualInterval * i));
        const position = `${(i * actualInterval / totalDuration) * 100 * zoomLevel}%`;
        return { 
          time: tickTime, 
          position,
          isDiscrete: false
        };
      });
    } else {
      // Discrete time ticks - equally spaced visually
      // Filter out timestamps that are too close together
      const uniqueTimePoints = [];
      for (let i = 0; i < discreteTimePoints.length; i++) {
        if (i === 0 || 
            discreteTimePoints[i].getTime() - discreteTimePoints[i-1].getTime() > 1000) {
          uniqueTimePoints.push(discreteTimePoints[i]);
        }
      }
      
      // Cap the number of displayed points to prevent overcrowding
      let displayPoints = uniqueTimePoints;
      if (uniqueTimePoints.length > 15) { // Reduced for better readability
        const step = Math.ceil(uniqueTimePoints.length / 15);
        displayPoints = uniqueTimePoints.filter((_, idx) => idx % step === 0 || idx === uniqueTimePoints.length - 1);
      }
      
      return displayPoints.map((time, index, array) => {
        // Each tick position is proportional to its index, not its time value
        const position = `${(index / (array.length - 1 || 1)) * 100 * zoomLevel}%`;
        return {
          time,
          position,
          isDiscrete: true,
          // Add jump indicator if there's a big time gap to the next point
          hasJump: index < array.length - 1 && 
                  (array[index + 1] - time) > 300000 // 5 minutes
        };
      });
    }
  }, [timeRange, timeScale, zoomLevel, discreteTimePoints, showDiscreteTime]);

  // Get segment position based on discrete time points
  const getSegmentPosition = useCallback((segment, timeRange) => {
    if (!timeRange.start || !timeRange.end || discreteTimePoints.length === 0) {
      return { left: 0, width: 0 };
    }
    
    if (!showDiscreteTime) {
      // Linear time scaling with boundary checks
      const totalDuration = timeRange.end - timeRange.start;
      const startRatio = Math.max(0, Math.min(1, (segment.startTime - timeRange.start) / totalDuration));
      const endRatio = Math.max(0, Math.min(1, (segment.endTime - timeRange.start) / totalDuration));
      
      const left = startRatio * 100 * zoomLevel;
      const width = Math.max((endRatio - startRatio) * 100 * zoomLevel, 1.0);
      
      return { left: `${left}%`, width: `${width}%` };
    } else {
      // Discrete time scaling with better index handling
      // Find indices in the discrete time array
      let startIndex = -1;
      let endIndex = -1;
      
      for (let i = 0; i < discreteTimePoints.length; i++) {
        if (discreteTimePoints[i].getTime() === segment.startTime.getTime()) {
          startIndex = i;
        }
        if (discreteTimePoints[i].getTime() === segment.endTime.getTime()) {
          endIndex = i;
        }
      }
      
      // If exact matches not found, find nearest points
      if (startIndex === -1) {
        startIndex = discreteTimePoints.findIndex(point => 
          point.getTime() > segment.startTime.getTime()
        ) - 1;
        if (startIndex < 0) startIndex = 0;
      }
      
      if (endIndex === -1) {
        endIndex = discreteTimePoints.findIndex(point => 
          point.getTime() >= segment.endTime.getTime()
        );
        if (endIndex < 0) endIndex = discreteTimePoints.length - 1;
      }
      
      // Calculate position based on indices
      const totalPoints = discreteTimePoints.length - 1 || 1; // Avoid division by zero
      const startPosition = (startIndex / totalPoints) * 100 * zoomLevel;
      const endPosition = (endIndex / totalPoints) * 100 * zoomLevel;
      
      // Ensure minimum width and handle boundary conditions
      const width = Math.max(endPosition - startPosition, 1.5);
      
      return { left: `${startPosition}%`, width: `${width}%` };
    }
  }, [discreteTimePoints, zoomLevel, showDiscreteTime]);

  // Update time points when data changes
  useEffect(() => {
    const timePoints = identifyDiscreteTimePoints();
    setDiscreteTimePoints(timePoints);
  }, [identifyDiscreteTimePoints, tasksByFunnel]);

  const timeTicks = generateTimeTicks();

  // FIX 1: Robust bidirectional scroll synchronization with force parameter
  const synchronizeScroll = useCallback((source, force = false) => {
    if (!headerRef.current || !timelineRef.current) return;
    
    const headerContent = headerRef.current.querySelector('.flex-1');
    const timelineContent = timelineRef.current.querySelector('.flex-1');
    
    if (!headerContent || !timelineContent) return;
    
    // Using requestAnimationFrame for smoother synchronization
    requestAnimationFrame(() => {
      if (source === 'header' || force) {
        // When header is scrolled, update timeline
        timelineContent.scrollLeft = headerContent.scrollLeft;
      }
      
      if (source === 'timeline' || force) {
        // When timeline is scrolled, update header
        headerContent.scrollLeft = timelineContent.scrollLeft;
      }
    });
  }, []);

  // FIX 2: Improved auto-scroll to rightmost part
  useEffect(() => {
    // Reset the flag when dependencies change
    initialScrollAppliedRef.current = false;
    
    // Use a short timeout to ensure the component is fully rendered
    const scrollTimer = setTimeout(() => {
      if (!initialScrollAppliedRef.current && timelineRef.current && headerRef.current) {
        const timelineContent = timelineRef.current.querySelector('.flex-1');
        const headerContent = headerRef.current.querySelector('.flex-1');
        
        if (timelineContent && headerContent) {
          // Set scroll to the rightmost position
          const maxScroll = timelineContent.scrollWidth - timelineContent.clientWidth;
          
          // Apply scroll to both elements
          timelineContent.scrollLeft = maxScroll;
          headerContent.scrollLeft = maxScroll;
          
          // Enforce synchronization after auto-scroll
          synchronizeScroll(null, true);
          
          initialScrollAppliedRef.current = true;
          
          // Log for debugging
          console.log('Auto-scrolled to rightmost position', maxScroll);
        }
      }
    }, 500); // Increased timeout for more reliable initial scrolling
    
    return () => clearTimeout(scrollTimer);
  }, [timeRange, zoomLevel, synchronizeScroll]);

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
      // Position the line at the center right of the sendback segment
      const lineX = sendbackRect.right - timelineRect.left + timeline.scrollLeft;
      const sendbackY = sendbackRect.top - timelineRect.top + timeline.scrollTop + (sendbackRect.height / 2);
      
      // Position the end of the line at the center left of the target segment
      const targetY = targetRect.top - timelineRect.top + timeline.scrollTop + (targetRect.height / 2);
      const lineHeight = Math.abs(targetY - sendbackY);
      const topY = Math.min(sendbackY, targetY);

      // Create the connection line with better positioning
      const line = document.createElement('div');
      line.className = 'sendback-connection-line';
      line.style.position = 'absolute';
      line.style.left = `${lineX}px`;
      line.style.top = `${topY}px`;
      line.style.width = '2px';
      line.style.height = `${lineHeight}px`;
      line.style.borderLeft = '2px dashed #f97316'; // Orange dashed line for sendback
      line.style.zIndex = '5'; // Ensure proper z-index

      // Create arrow with improved positioning
      const arrow = document.createElement('div');
      arrow.className = 'sendback-connection-arrow';
      arrow.style.position = 'absolute';
      arrow.style.left = `${lineX - 4}px`; // Center the arrow on the line
      
      // Position arrow at the end of the line
      if (sendbackY < targetY) {
        // Arrow pointing down
        arrow.style.top = `${targetY - 5}px`;
        arrow.style.borderTop = '6px solid #f97316';
        arrow.style.borderBottom = 'none';
      } else {
        // Arrow pointing up
        arrow.style.top = `${targetY - 1}px`;
        arrow.style.borderBottom = '6px solid #f97316';
        arrow.style.borderTop = 'none';
      }
      
      arrow.style.width = '0';
      arrow.style.height = '0';
      arrow.style.borderLeft = '5px solid transparent';
      arrow.style.borderRight = '5px solid transparent';
      arrow.style.zIndex = '5';

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

  // FIX 1: Enhanced timeline scroll handler with debounce
  useEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline) return;

    const timelineContent = timeline.querySelector('.flex-1');
    if (!timelineContent) return;

    // Use a variable to track last scroll position for debouncing
    let lastScrollLeft = timelineContent.scrollLeft;
    let scrollTimer = null;

    const handleTimelineScroll = () => {
      // Synchronize immediately for smoother UX
      synchronizeScroll('timeline');
      
      // Debounced connection redrawing
      if (scrollTimer) {
        clearTimeout(scrollTimer);
      }
  
      scrollTimer = setTimeout(() => {
        if (lastScrollLeft !== timelineContent.scrollLeft) {
          lastScrollLeft = timelineContent.scrollLeft;
          setConnectionKey(prev => prev + 1);
          drawTaskConnections();
        }
      }, 100);
    };

    timelineContent.addEventListener('scroll', handleTimelineScroll);

    return () => {
      timelineContent.removeEventListener('scroll', handleTimelineScroll);
      if (scrollTimer) {
        clearTimeout(scrollTimer);
      }
    };
  }, [drawTaskConnections, synchronizeScroll]);

  // FIX 1: Enhanced header scroll handler with debounce
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const headerContent = header.querySelector('.flex-1');
    if (!headerContent) return;

    let scrollTimer = null;

    const handleHeaderScroll = () => {
      // Always synchronize immediately
      synchronizeScroll('header');
      
      // Debounce multiple rapid scroll events
      if (scrollTimer) {
        clearTimeout(scrollTimer);
      }
  
      scrollTimer = setTimeout(() => {
        // Any post-scroll cleanup if needed
      }, 100);
    };

    headerContent.addEventListener('scroll', handleHeaderScroll);

    return () => {
      headerContent.removeEventListener('scroll', handleHeaderScroll);
      if (scrollTimer) {
        clearTimeout(scrollTimer);
      }
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

  // Format time gap
  const formatTimeGap = useCallback((gapMs) => {
    const seconds = Math.floor(gapMs / 1000);
    
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes}m`;
    } else if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600);
      return `${hours}h`;
    } else {
      const days = Math.floor(seconds / 86400);
      return `${days}d`;
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

  // Calculate completion percentage
  const calculateCompletionPercentage = useCallback((tasks) => {
    if (tasks.length === 0) return 0;
    
    const completedTasks = tasks.filter(task => 
      task.finalStatus && task.finalStatus.status === 'COMPLETED'
    ).length;
    
    return Math.round((completedTasks / tasks.length) * 100);
  }, []);

  return (
    <div className="flex flex-col" style={{ borderTop: '1px solid #e5e7eb' }}>
      {/* Fixed zoom control - positioned well away from timestamps */}
      <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2">
        <div className="text-xs bg-white px-2 py-1 rounded-md shadow-sm border border-gray-200">
          Zoom: {Math.round(zoomLevel * 100)}%
        </div>
        <button 
          className="text-xs bg-white px-2 py-1 rounded-md shadow-sm border border-gray-200 hover:bg-gray-50"
          onClick={() => setShowDiscreteTime(prev => !prev)}
        >
          {showDiscreteTime ? "Linear Time" : "Discrete Time"}
        </button>
      </div>

      {/* Header row - FIX 3: Improved styling to ensure visibility of timestamps */}
      <div className="sticky top-0 z-30 flex border-b-2 border-gray-300 bg-white shadow-sm" ref={headerRef}>
        {/* Left sidebar header */}
        <div className="w-48 flex-shrink-0 border-r border-gray-300">
          <div 
            style={{ height: HEADER_HEIGHT, lineHeight: `${HEADER_HEIGHT}px` }} 
            className="bg-gray-100 flex items-center"
          >
            <span className="text-sm font-medium text-gray-600 ml-3">Task ID</span>
          </div>
        </div>

        {/* Timeline header with scrollable container */}
        <div className="flex-1 overflow-x-auto bg-gray-50" style={{ overflowY: 'hidden' }}>
          <div className="relative min-width-content" style={{ width: `${100 * zoomLevel}%`, height: HEADER_HEIGHT }}>
            {/* Time ticks with improved visibility */}
            {timeTicks.map((tick, i) => (
              <div
                key={i}
                className="absolute top-0 h-full flex flex-col items-center"
                style={{ left: tick.position, zIndex: 2 }}
              >
                <div className="h-8 border-l border-gray-300" style={{ width: '1px' }}></div>
                <div 
                  className="text-[13px] text-gray-700 transform -rotate-45 origin-top-left whitespace-nowrap font-medium" 
                  style={{ marginTop: '10px', marginLeft: '4px' }}
                >
                  {format(tick.time, 'HH:mm:ss')}
                </div>
                
                {/* Time jump indicator */}
                {tick.hasJump && (
                  <div 
                    className="absolute text-[10px] text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded-sm whitespace-nowrap"
                    style={{ top: '34px', left: '4px', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis' }}
                  >
                    ↔️ {formatTimeGap(discreteTimePoints[i+1] - tick.time)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content area - FIX 3: Strict alignment between task names and segments */}
      <div className="flex flex-1" ref={timelineRef} style={{ minHeight: '0' }}>
        {/* Left sidebar for task names */}
        <div className="w-48 flex-shrink-0 border-r border-gray-300 overflow-y-auto">
          {funnels.map((funnel, funnelIdx) => {
            const funnelTasks = tasksByFunnel[funnel] || [];
            const isCollapsed = collapsedFunnels[funnel];
        
            return (
              <div key={funnelIdx}>
                {/* Funnel header with stats moved to right */}
                <div 
                  className="border-b border-gray-200 bg-gray-50 flex items-center justify-between cursor-pointer"
                  onClick={() => toggleFunnel(funnel)}
                  style={{ height: FUNNEL_HEADER_HEIGHT }}
                >
                  {/* Left side - Funnel name and collapse indicator */}
                  <div className="flex items-center ml-3">
                    <svg 
                      className={`w-4 h-4 transform transition-transform mr-2 ${isCollapsed ? '' : 'rotate-90'}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: funnelColors[funnel] || '#95a5a6' }}
                    ></div>
                    <span className="text-sm text-gray-700">{funnel}</span>
                  </div>

                  {/* Right side - Stats */}
                  <div className="flex items-center mr-3">
                    <span className="text-xs text-gray-500 mr-1">Tasks:</span>
                    <span className="text-xs font-medium bg-gray-200 rounded-full px-2 py-0.5 mr-2">
                      {funnelTasks.length}
                    </span>
                    <span className="text-xs text-gray-500 mr-1">Success:</span>
                    <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${
                      funnelTasks.length === 0 ? 'bg-gray-200 text-gray-700' :
                      calculateCompletionPercentage(funnelTasks) >= 70 ? 'bg-green-100 text-green-800' : 
                      calculateCompletionPercentage(funnelTasks) >= 40 ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {calculateCompletionPercentage(funnelTasks)}%
                    </span>
                  </div>
                </div>

                {/* Task names with strict height alignment */}
                {!isCollapsed && funnelTasks.map((task, idx) => (
                  <div 
                    key={idx} 
                    className="border-b border-gray-100"
                    style={{ height: ROW_HEIGHT }}
                  >
                    <div 
                      className="h-full flex items-center px-3"
                    >
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

        {/* Main timeline graph with fixed alignments */}
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
                className={`absolute top-0 bottom-0 ${
                  tick.hasJump 
                    ? 'border-l-2 border-purple-400 border-dotted' 
                    : 'border-l border-gray-200'
                }`}
                style={{
                  left: tick.position,
                  height: '100%',
                  zIndex: 1
                }}
              />
            ))}

            {/* Funnel timelines with exact alignment to sidebar */}
            <div className="relative">
              {funnels.map((funnel, funnelIdx) => {
                const funnelTasks = tasksByFunnel[funnel] || [];
                const funnelColor = funnelColors[funnel] || '#95a5a6';
                const isCollapsed = collapsedFunnels[funnel];

                return (
                  <div key={funnelIdx} className="relative">
                    {/* Funnel header placeholder with exact same height as sidebar */}
                    <div 
                      className="border-b border-gray-200 bg-gray-50"
                      style={{ height: FUNNEL_HEADER_HEIGHT }}
                    />

                    {/* Task rows with exact same height as sidebar */}
                    {!isCollapsed && funnelTasks.map((task, taskIdx) => {
                      // Sort segments by start time for connector lines
                      const sortedSegments = [...task.segments].sort((a, b) => a.startTime - b.startTime);
                      const taskStats = calculateTaskStats(task);
                  
                      return (
                        <div
                          key={taskIdx}
                          className={`relative border-b border-gray-100 task-row-${funnel}-${task.id}`}
                          style={{ height: ROW_HEIGHT }}
                        >
                          <div className="relative h-full">
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
                                  className="absolute border-t-2 border-dashed"
                                  style={{
                                    borderColor: 'rgba(156, 163, 175, 0.5)',
                                    left: `calc(${currentLeft}% + ${currentWidth}%)`,
                                    width: `calc(${nextLeft}% - ${currentLeft}% - ${currentWidth}%)`,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    zIndex: 5
                                  }}
                                />
                              );
                            })}
                        
                            {/* Task segments - Centered exactly in the middle of the row */}
                            {task.segments.map((segment, segmentIdx) => {
                              const position = getSegmentPosition(segment, timeRange);
                              const statusColor = statusColors[segment.status] || '#6B7280';
                              const width = parseFloat(position.width);
                              const isHighlighted = segment === taskStats.slowestSegment || segment === taskStats.fastestSegment;
                          
                              // Segment styling
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

                              // Fixed segment height based on compact view
                              const segmentHeight = compactView ? 12 : 20;

                              return (
                                <div
                                  key={segmentIdx}
                                  className="absolute task-segment flex items-center rounded"
                                  style={{
                                    left: position.left,
                                    width: position.width,
                                    height: segmentHeight,
                                    top: `calc(50% - ${segmentHeight / 2}px)`, // Precisely centered
                                    backgroundColor: funnelColor,
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                    zIndex: 10,
                                    ...specialStyle
                                  }}
                                  onClick={(e) => handleTaskClick(e, task, segment)}
                                  onMouseEnter={(e) => handleTaskMouseEnter(e, task, segment)}
                                  onMouseLeave={handleTaskMouseLeave}
                                >
                                  {/* Only show duration text if segment is wide enough */}
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
                                  {!compactView && isHighlighted && width > 10 && (
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