import React, { useState, useEffect, useRef, useCallback, useLayoutEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { funnelColors, statusColors } from '../../utils/Ganntutils';
import TaskTooltip from './TaskTooltip';

const TaskTimeline = ({ funnels, tasksByFunnel, compactView }) => {
  const [hoveredTask, setHoveredTask] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [collapsedFunnels, setCollapsedFunnels] = useState({});
  const [zoomLevel, setZoomLevel] = useState(1);
  const [connectionKey, setConnectionKey] = useState(0);
  
  const timelineRef = useRef(null);
  const headerRef = useRef(null);
  const isDragging = useRef(false);
  const dragStart = useRef(null);
  const scrollStart = useRef(null);
  const hoverIntentTimerRef = useRef(null);
  const currentHoveredTaskRef = useRef(null);
  const isDraggingTaskRef = useRef(false);
  const initialScrollAppliedRef = useRef(false);

  // Constants for consistent sizing
  const ROW_HEIGHT = compactView ? 26 : 40;
  const HEADER_HEIGHT = 60;
  const FUNNEL_HEADER_HEIGHT = 40;
  const TIMELINE_PADDING = 40; // Padding between events
  
  // Generate discrete timeline points
  const discreteTimelineData = useMemo(() => {
    console.log('Processing tasks for discrete timeline');
    
    // Collect all task events (start/end times)
    const allEvents = [];
    
    // Process all tasks to get their timestamps
    Object.values(tasksByFunnel).flat().forEach(task => {
      task.segments.forEach(segment => {
        allEvents.push({
          time: segment.startTime.getTime(),
          type: 'start',
          task: task,
          segment: segment
        });
        
        allEvents.push({
          time: segment.endTime.getTime(),
          type: 'end',
          task: task,
          segment: segment
        });
      });
    });
    
    // Sort events chronologically
    allEvents.sort((a, b) => a.time - b.time);
    
    // Create a map of timestamps to x-positions (eliminating duplicates)
    const timeMap = new Map();
    let position = 0;
    
    allEvents.forEach(event => {
      if (!timeMap.has(event.time)) {
        timeMap.set(event.time, position);
        position += TIMELINE_PADDING;
      }
    });
    
    // Process tasks with the discrete positions
    const processedTasks = {};
    
    Object.entries(tasksByFunnel).forEach(([funnel, tasks]) => {
      processedTasks[funnel] = [];
      
      // Group tasks by ID
      const taskGroupsByID = {};
      tasks.forEach(task => {
        if (!taskGroupsByID[task.id]) {
          taskGroupsByID[task.id] = [];
        }
        taskGroupsByID[task.id].push(task);
      });
      
      // Process each task group
      Object.entries(taskGroupsByID).forEach(([taskId, taskGroup]) => {
        // Combine all segments from all tasks with the same ID
        let allSegments = [];
        taskGroup.forEach(task => {
          allSegments = allSegments.concat(task.segments.map(seg => ({
            ...seg,
            taskId: task.id,
            funnel: task.funnel,
            originalTaskId: task.originalTaskId,
            targetTaskId: task.targetTaskId,
            sourceLoanStage: task.sourceLoanStage,
            finalStatus: task.finalStatus
          })));
        });
        
        // Sort all segments chronologically
        allSegments.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
        
        // Add position data to segments
        allSegments = allSegments.map(segment => ({
          ...segment,
          startPosition: timeMap.get(segment.startTime.getTime()),
          endPosition: timeMap.get(segment.endTime.getTime())
        }));
        
        // Determine if this task ever transitions back to TODO after being in another state
        let hasTodoTransition = false;
        let previousStates = [];
        
        for (let i = 0; i < allSegments.length; i++) {
          if (allSegments[i].status === 'TODO' && i > 0) {
            // Check if we've seen non-TODO states after a previous TODO
            const previousTodoIndex = previousStates.lastIndexOf('TODO');
            if (previousTodoIndex !== -1 && previousTodoIndex < previousStates.length - 1) {
              hasTodoTransition = true;
              break;
            }
          }
          previousStates.push(allSegments[i].status);
        }
        
        // If no TODO transitions, keep all segments as one instance
        if (!hasTodoTransition) {
          const baseTask = taskGroup[0];
          processedTasks[funnel].push({
            ...baseTask,
            id: taskId,
            instances: [allSegments],
            hasCycles: false
          });
          return;
        }
        
        // Otherwise, process instances based on TODO transitions
        let instances = [];
        let currentInstance = [];
        let seenStatuses = [];
        
        allSegments.forEach((segment, index) => {
          // First segment always starts a new instance
          if (index === 0) {
            currentInstance.push(segment);
            seenStatuses.push(segment.status);
            return;
          }
          
          // If current segment is TODO and we've seen non-TODO states after a previous TODO,
          // we consider this a true reopening of the task
          if (segment.status === 'TODO') {
            const previousTodoIndex = seenStatuses.lastIndexOf('TODO');
            if (previousTodoIndex !== -1 && previousTodoIndex < seenStatuses.length - 1) {
              // Finish current instance
              if (currentInstance.length > 0) {
                instances.push([...currentInstance]);
                currentInstance = [];
                seenStatuses = [];
              }
            }
          }
          
          // Add segment to current instance
          currentInstance.push(segment);
          seenStatuses.push(segment.status);
        });
        
        // Add the final instance if any segments remain
        if (currentInstance.length > 0) {
          instances.push(currentInstance);
        }
        
        // Create a single task with all instances as a property
        if (instances.length > 0) {
          // Use properties from the first task in the group
          const baseTask = taskGroup[0];
          processedTasks[funnel].push({
            ...baseTask,
            id: taskId,
            instances: instances,
            hasCycles: instances.length > 1
          });
        }
      });
    });
    
    // Get the total width required
    const totalWidth = position;
    
    // Get time points for ticks
    const timePoints = Array.from(timeMap.entries()).map(([time, position]) => ({
      time: new Date(time),
      position: position
    }));
    
    // Sort time points chronologically
    timePoints.sort((a, b) => a.time - b.time);
    // Sort tasks within each funnel by priority time (TODO > IN_PROGRESS > NEW)
Object.keys(processedTasks).forEach(funnel => {
  if (processedTasks[funnel] && processedTasks[funnel].length > 0) {
    processedTasks[funnel].sort((taskA, taskB) => {
      // Get priority time for sorting based on status hierarchy
      const getPriorityTime = (task) => {
        // Normalize status to handle TO DO vs TODO inconsistency
        const normalizedChanges = task.statusChanges.map(change => ({
          ...change,
          status: change.status === 'TO DO' ? 'TODO' : change.status
        }));
        
        // Priority 1: Find the first TODO time
        const todoChange = normalizedChanges.find(change => change.status === 'TODO');
        if (todoChange) return todoChange.time;
        
        // Priority 2: Find the first IN_PROGRESS time
        const inProgressChange = normalizedChanges.find(change => change.status === 'IN_PROGRESS');
        if (inProgressChange) return inProgressChange.time;
        
        // Priority 3: Find the NEW status time
        const newChange = normalizedChanges.find(change => change.status === 'COMPLETED');
        if (newChange) return newChange.time;
        
        // Fallback: use the first status time
        return task.statusChanges[0]?.time || new Date();
      };
      
      // Compare the priority times
      const timeA = getPriorityTime(taskA);
      const timeB = getPriorityTime(taskB);
      
      return timeA - timeB; // Oldest tasks at top
    });
  }
});
    
    return {
      timeMap,
      processedTasks,
      totalWidth,
      timePoints
    };
  }, [tasksByFunnel, TIMELINE_PADDING]);
  
  // Function to get segment position
  const getSegmentPosition = useCallback((segment) => {
    return {
      left: segment.startPosition,
      width: segment.endPosition - segment.startPosition
    };
  }, []);

  // Format time for display
  const formatTimeLabel = useCallback((date) => {
    return format(date, 'HH:mm:ss.SSS');
  }, []);

  // Toggle funnel collapse
  const toggleFunnel = useCallback((funnel) => {
    setCollapsedFunnels(prev => ({
      ...prev,
      [funnel]: !prev[funnel]
    }));
  }, []);

  // Draw instance connections within a task row
  const drawInstanceConnections = useCallback(() => {
    // First remove existing instance connection lines
    const existingLines = document.querySelectorAll('.instance-connection-line');
    existingLines.forEach(line => line.remove());

    if (!timelineRef.current) return;
    const timeline = timelineRef.current.querySelector('.flex-1');
    if (!timeline) return;
    
    const timelineRect = timeline.getBoundingClientRect();

    // Process each funnel
    Object.entries(discreteTimelineData.processedTasks).forEach(([funnel, tasks]) => {
      if (collapsedFunnels[funnel]) return;
      
      // Process each task in the funnel
      tasks.forEach(task => {
        // Skip if task has only one instance
        if (!task.hasCycles || task.instances.length <= 1) return;
        
        // Connect instances within the same task
        for (let i = 0; i < task.instances.length - 1; i++) {
          const currentInstance = task.instances[i];
          const nextInstance = task.instances[i + 1];
          
          // Get last segment of current instance and first segment of next instance
          const lastSegment = currentInstance[currentInstance.length - 1];
          const firstSegment = nextInstance[0];
          
          // Get the task element from DOM
          const taskEl = document.querySelector(`.task-row-${funnel}-${task.id}`);
          if (!taskEl) continue;
          
          // Calculate positions
          const taskRect = taskEl.getBoundingClientRect();
          const taskMidY = taskRect.top + taskRect.height / 2 - timelineRect.top + timeline.scrollTop;
          
          const currentPos = getSegmentPosition(lastSegment);
          const nextPos = getSegmentPosition(firstSegment);
          
          const startX = (currentPos.left + currentPos.width) * zoomLevel;
          const endX = nextPos.left * zoomLevel;
          
          // Create connection line
          const line = document.createElement('div');
          line.className = 'instance-connection-line';
          line.style.position = 'absolute';
          line.style.left = `${startX}px`;
          line.style.top = `${taskMidY}px`;
          line.style.width = `${endX - startX}px`;
          line.style.height = '2px';
          line.style.borderTop = '2px dashed rgba(107, 114, 128, 0.8)';
          line.style.zIndex = '5';
          
          timeline.appendChild(line);
        }
      });
    });
  }, [discreteTimelineData.processedTasks, collapsedFunnels, getSegmentPosition, zoomLevel]);

  // Draw connections between sendback tasks and their targets
  // Draw connections between tasks and their targets
// Draw connections between tasks and their targets
const drawTaskConnections = useCallback(() => {
  // First remove any existing connection lines
  const existingLines = document.querySelectorAll('.sendback-connection-line, .sendback-connection-arrow');
  existingLines.forEach(line => line.remove());

  if (!timelineRef.current) return;
  
  // Find all tasks with targetTaskId
  const tasksWithTargets = [];
  Object.entries(discreteTimelineData.processedTasks).forEach(([funnel, tasks]) => {
    if (collapsedFunnels[funnel]) return;
    
    tasks.forEach(task => {
      // Check if task has a targetTaskId
      if (task.targetTaskId) {
        // Find the exact time when the task status was SENDBACK
        const sendbackStatus = task.statuses?.find(status => status.status === 'SENDBACK');
        
        if (sendbackStatus && task.instances && task.instances.length > 0 && task.instances[0].length > 0) {
          tasksWithTargets.push({
            ...task,
            sendbackTime: sendbackStatus.time,
            segment: task.instances[0][0]
          });
        }
      }
    });
  });

  if (tasksWithTargets.length === 0) return;

  // Get timeline container for positioning
  const timeline = timelineRef.current.querySelector('.flex-1');
  if (!timeline) return;
  
  const timelineRect = timeline.getBoundingClientRect();
  
  // Create connections for each task with a target
  tasksWithTargets.forEach(sourceTask => {
    // Find the target task
    const targetFunnel = Object.entries(discreteTimelineData.processedTasks).find(([_, tasks]) => {
      return tasks.some(task => task.id === sourceTask.targetTaskId);
    });
    
    if (!targetFunnel) return;
    
    const targetTask = targetFunnel[1].find(task => task.id === sourceTask.targetTaskId);
    if (!targetTask) return;

    // Try to get task elements from DOM
    const sourceEl = document.querySelector(`.task-row-${sourceTask.funnel}-${sourceTask.id} .instance-0-segment-0`);
    const targetEl = document.querySelector(`.task-row-${targetTask.funnel}-${targetTask.id} .instance-0-segment-0`);

    if (!sourceEl || !targetEl) return;

    // Get positions
    const sourceRect = sourceEl.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();

    // Calculate the position based on sendback time
    // First get the width of the task bar
    const taskStartTime = sourceTask.segment.startTime;
    const taskEndTime = sourceTask.segment.endTime;
    const taskDuration = taskEndTime - taskStartTime;
    
    // Calculate the position ratio based on when the sendback happened
    const sendbackOffset = sourceTask.sendbackTime - taskStartTime;
    const sendbackRatio = sendbackOffset / taskDuration;
    
    // Calculate the x position by interpolating along the task bar's width
    const taskBarWidth = sourceRect.width;
    const sendbackX = sourceRect.left + (taskBarWidth * sendbackRatio);
    const lineX = sendbackX - timelineRect.left + timeline.scrollLeft;
    
    const sourceY = sourceRect.top - timelineRect.top + timeline.scrollTop + (sourceRect.height / 2);
    const targetY = targetRect.top - timelineRect.top + timeline.scrollTop + (targetRect.height / 2);
    const lineHeight = Math.abs(targetY - sourceY);
    const topY = Math.min(sourceY, targetY);

    // Create the connection line
    const line = document.createElement('div');
    line.className = 'sendback-connection-line';
    line.style.position = 'absolute';
    line.style.left = `${lineX}px`;
    line.style.top = `${topY}px`;
    line.style.width = '2px';
    line.style.height = `${lineHeight}px`;
    line.style.borderLeft = '2px dashed #f97316'; // Orange dashed line
    line.style.zIndex = '5';

    // Create arrow
    const arrow = document.createElement('div');
    arrow.className = 'sendback-connection-arrow';
    arrow.style.position = 'absolute';
    arrow.style.left = `${lineX - 4}px`;
    
    if (sourceY < targetY) {
      arrow.style.top = `${targetY - 5}px`;
      arrow.style.borderTop = '6px solid #f97316';
      arrow.style.borderBottom = 'none';
    } else {
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
}, [discreteTimelineData.processedTasks, collapsedFunnels]);
  // Synchronize header and timeline scrolling
  const synchronizeScroll = useCallback((source, force = false) => {
    if (!headerRef.current || !timelineRef.current) return;
    
    const headerContent = headerRef.current.querySelector('.flex-1');
    const timelineContent = timelineRef.current.querySelector('.flex-1');
    
    if (!headerContent || !timelineContent) return;
    
    requestAnimationFrame(() => {
      if (source === 'header' || force) {
        timelineContent.scrollLeft = headerContent.scrollLeft;
      }
      
      if (source === 'timeline' || force) {
        headerContent.scrollLeft = timelineContent.scrollLeft;
      }
    });
  }, []);

  // Setup scroll synchronization
  useEffect(() => {
    const handleHeaderScroll = () => synchronizeScroll('header');
    const handleTimelineScroll = () => {
      synchronizeScroll('timeline');
      
      // Redraw connections on scroll with debounce
      if (window.scrollTimer) clearTimeout(window.scrollTimer);
      window.scrollTimer = setTimeout(() => {
        setConnectionKey(prev => prev + 1);
      }, 100);
    };
    
    const headerContent = headerRef.current?.querySelector('.flex-1');
    const timelineContent = timelineRef.current?.querySelector('.flex-1');
    
    if (headerContent) headerContent.addEventListener('scroll', handleHeaderScroll);
    if (timelineContent) timelineContent.addEventListener('scroll', handleTimelineScroll);
    
    return () => {
      if (headerContent) headerContent.removeEventListener('scroll', handleHeaderScroll);
      if (timelineContent) timelineContent.removeEventListener('scroll', handleTimelineScroll);
      if (window.scrollTimer) clearTimeout(window.scrollTimer);
    };
  }, [synchronizeScroll]);

  // Initial scroll to show latest tasks based on timestamp
  useEffect(() => {
    if (initialScrollAppliedRef.current || !discreteTimelineData.totalWidth) return;
    
    const scrollToLatest = () => {
      const timelineContent = timelineRef.current?.querySelector('.flex-1');
      const headerContent = headerRef.current?.querySelector('.flex-1');
      
      if (timelineContent) {
        // Find the latest task segment based on end time
        let latestSegment = null;
        let latestTask = null;
        let latestInstanceIndex = 0;
        let latestSegmentIndex = 0;
        let latestFunnel = '';
        
        // Iterate through all funnels and tasks to find the latest segment
        Object.entries(discreteTimelineData.processedTasks).forEach(([funnel, tasks]) => {
          tasks.forEach(task => {
            task.instances.forEach((instance, instanceIdx) => {
              instance.forEach((segment, segmentIdx) => {
                if (!latestSegment || segment.endTime > latestSegment.endTime) {
                  latestSegment = segment;
                  latestTask = task;
                  latestInstanceIndex = instanceIdx;
                  latestSegmentIndex = segmentIdx;
                  latestFunnel = funnel;
                }
              });
            });
          });
        });
        
        if (latestSegment) {
          // Find the DOM element of the latest segment
          const segmentSelector = `.task-row-${latestFunnel}-${latestTask.id} .instance-${latestInstanceIndex}-segment-${latestSegmentIndex}`;
          const latestSegmentEl = timelineContent.querySelector(segmentSelector);
          
          if (latestSegmentEl) {
            // Get the position of the latest task
            const segmentRect = latestSegmentEl.getBoundingClientRect();
            const timelineRect = timelineContent.getBoundingClientRect();
            
            // Calculate scroll positions
            // Scroll horizontally to show the latest segment (with some margin)
            const horizontalOffset = latestSegment.endPosition * zoomLevel + 100;
            const maxScroll = timelineContent.scrollWidth - timelineContent.clientWidth;
            timelineContent.scrollLeft = Math.min(horizontalOffset, maxScroll);
            
            // Scroll vertically to center the latest task
            const taskRow = timelineContent.querySelector(`.task-row-${latestFunnel}-${latestTask.id}`);
            if (taskRow) {
              const taskRect = taskRow.getBoundingClientRect();
              const topOffset = taskRow.offsetTop - (timelineContent.clientHeight / 2) + (taskRect.height / 2);
              timelineContent.scrollTop = Math.max(0, topOffset);
            }
            
            // Synchronize header
            if (headerContent) {
              headerContent.scrollLeft = timelineContent.scrollLeft;
            }
          } else {
            // Fallback to the previous method if the element isn't found
            timelineContent.scrollLeft = timelineContent.scrollWidth;
          }
        } else {
          // Fallback to the previous method if no latest segment found
          timelineContent.scrollLeft = timelineContent.scrollWidth;
        }
        
        initialScrollAppliedRef.current = true;
        
        // Redraw connections after scrolling
        setTimeout(() => {
          setConnectionKey(prev => prev + 1);
        }, 100);
      }
    };
    
    // Wait for timeline to be fully rendered
    setTimeout(scrollToLatest, 500);
  }, [discreteTimelineData.totalWidth, zoomLevel]);

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

    // For regular tasks
    return task.id;
  }, []);

  // Handle hover and tooltip functionality
  const clearHoverIntent = useCallback(() => {
    if (hoverIntentTimerRef.current) {
      clearTimeout(hoverIntentTimerRef.current);
      hoverIntentTimerRef.current = null;
    }
  }, []);

  const handleTaskClick = useCallback((e, task, segment, instanceIndex) => {
    e.stopPropagation();
    e.preventDefault();
    clearHoverIntent();

    if (isDraggingTaskRef.current) {
      isDraggingTaskRef.current = false;
      return;
    }

    if (hoveredTask && hoveredTask.id === task.id && 
        hoveredTask.funnel === task.funnel && 
        hoveredTask.instanceIndex === instanceIndex) {
      setHoveredTask(null);
      currentHoveredTaskRef.current = null;
      return;
    }

    currentHoveredTaskRef.current = { id: task.id, funnel: task.funnel, instanceIndex };
    setHoveredTask({ ...task, currentSegment: segment, instanceIndex });
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  }, [hoveredTask, clearHoverIntent]);

  const handleTaskMouseEnter = useCallback((e, task, segment, instanceIndex) => {
    if (hoveredTask) return;
    clearHoverIntent();

    hoverIntentTimerRef.current = setTimeout(() => {
      currentHoveredTaskRef.current = { id: task.id, funnel: task.funnel, instanceIndex };
      setHoveredTask({ ...task, currentSegment: segment, instanceIndex });
      setTooltipPosition({ x: e.clientX, y: e.clientY });
    }, 300);
  }, [hoveredTask, clearHoverIntent]);

  const handleTaskMouseLeave = useCallback(() => {
    if (isDraggingTaskRef.current) return;
    clearHoverIntent();

    if (hoveredTask && !document.activeElement) {
      hoverIntentTimerRef.current = setTimeout(() => {
        setHoveredTask(null);
        currentHoveredTaskRef.current = null;
      }, 100);
    }
  }, [hoveredTask, clearHoverIntent]);

  const handleTooltipClose = useCallback(() => {
    setHoveredTask(null);
    currentHoveredTaskRef.current = null;
  }, []);

  // Handle mouse wheel for zooming
  const handleWheel = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY * -0.01;
      setZoomLevel(prev => Math.max(0.5, Math.min(5, prev + delta)));
    }
  }, []);

  // Handle mouse events for panning
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
      e.preventDefault();
    }
  }, []);

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

  const handleMouseUp = useCallback(() => {
    if (isDragging.current) {
      isDragging.current = false;
      document.body.style.cursor = 'default';
      
      setTimeout(() => {
        isDraggingTaskRef.current = false;
      }, 50);
    }
  }, []);

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
    // Flatten all segments from all instances
    const allSegments = task.instances.flat();
    
    let fastestSegment = null;
    let slowestSegment = null;

    allSegments.forEach(segment => {
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
      totalDuration: allSegments.reduce((total, segment) => {
        return total + (segment.endTime - segment.startTime);
      }, 0)
    };
  }, []);

  // Add wheel event listener
  useEffect(() => {
    const timelineContent = timelineRef.current?.querySelector('.flex-1');
    if (timelineContent) {
      timelineContent.addEventListener('wheel', handleWheel, { passive: false });
      return () => timelineContent.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  // Update connections when needed
  useLayoutEffect(() => {
    const timer = setTimeout(() => {
      drawTaskConnections();
      drawInstanceConnections();
    }, 200); // Ensure DOM is ready

    return () => clearTimeout(timer);
  }, [drawTaskConnections, drawInstanceConnections, connectionKey, zoomLevel]);

  // Update connections on window scroll
  useEffect(() => {
    const handleWindowScroll = () => {
      if (window.scrollTimeout) {
        clearTimeout(window.scrollTimeout);
      }
  
      window.scrollTimeout = setTimeout(() => {
        setConnectionKey(prev => prev + 1);
      }, 100);
    };

    window.addEventListener('scroll', handleWindowScroll);

    return () => {
      window.removeEventListener('scroll', handleWindowScroll);
      if (window.scrollTimeout) {
        clearTimeout(window.scrollTimeout);
      }
    };
  }, []);

  // Clean up timeouts and connections when component unmounts
  useEffect(() => {
    return () => {
      clearHoverIntent();
      const existingLines = document.querySelectorAll('.sendback-connection-line, .sendback-connection-arrow, .instance-connection-line');
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
      {/* Fixed zoom control */}
      <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2">
        <div className="text-xs bg-white px-2 py-1 rounded-md shadow-sm border border-gray-200">
          Zoom: {Math.round(zoomLevel * 100)}%
        </div>
      </div>

      {/* Header row */}
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

        {/* Discrete timeline header with scrollable container */}
        <div className="flex-1 overflow-x-auto bg-gray-50" style={{ overflowY: 'hidden' }}>
          <div 
            className="relative" 
            style={{ 
              width: `${discreteTimelineData.totalWidth * zoomLevel}px`, 
              height: HEADER_HEIGHT,
              minWidth: '100%'
            }}
          >
            {/* Time ticks */}
            {discreteTimelineData.timePoints.map((point, i) => (
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

      {/* Main content area */}
      <div className="flex flex-1" ref={timelineRef} style={{ minHeight: '0' }}>
        {/* Left sidebar for task names */}
        <div className="w-48 flex-shrink-0 border-r border-gray-300 overflow-y-auto">
          {funnels.map((funnel, funnelIdx) => {
            const funnelTasks = discreteTimelineData.processedTasks[funnel] || [];
            const isCollapsed = collapsedFunnels[funnel];
        
            return (
              <div key={funnelIdx}>
                {/* Funnel header with stats */}
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

                {/* Task names */}
                {!isCollapsed && funnelTasks.map((task, idx) => (
                  <div 
                    key={`${task.id}-${idx}`} 
                    className="border-b border-gray-100"
                    style={{ height: ROW_HEIGHT }}
                  >
                    <div 
                      className="h-full flex items-center px-3"
                    >
                      <span
                        className="text-sm truncate cursor-pointer hover:text-blue-600"
                        onClick={(e) => handleTaskClick(e, task, task.instances[0][0], 0)}
                        onMouseEnter={(e) => handleTaskMouseEnter(e, task, task.instances[0][0], 0)}
                        onMouseLeave={handleTaskMouseLeave}
                        title={getTaskDisplayName(task)}
                      >
                        {getTaskDisplayName(task)}
                        {task.hasCycles && (
                          <span className="ml-1 text-xs text-gray-500">
                            ({task.instances.length} cycles)
                          </span>
                        )}
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
          <div 
            className="relative" 
            style={{ 
              width: `${discreteTimelineData.totalWidth * zoomLevel}px`,
              minWidth: '100%'
            }}
          >
            {/* Vertical grid lines */}
            {discreteTimelineData.timePoints.map((point, i) => (
              <div
                key={`grid-line-${i}`}
                className="absolute top-0 bottom-0 border-l border-gray-200"
                style={{
                  left: `${point.position * zoomLevel}px`,
                  height: '100%',
                  zIndex: 1
                }}
              />
            ))}

            {/* Funnel timelines */}
            <div className="relative">
              {funnels.map((funnel, funnelIdx) => {
                const funnelTasks = discreteTimelineData.processedTasks[funnel] || [];
                const funnelColor = funnelColors[funnel] || '#95a5a6';
                const isCollapsed = collapsedFunnels[funnel];

                return (
                  <div key={funnelIdx} className="relative">
                    {/* Funnel header placeholder */}
                    <div 
                      className="border-b border-gray-200 bg-gray-50"
                      style={{ height: FUNNEL_HEADER_HEIGHT }}
                    />

                    {/* Task rows */}
                    {!isCollapsed && funnelTasks.map((task, taskIdx) => {
                      const taskStats = calculateTaskStats(task);
                      
                      return (
                        <div
                          key={`${task.id}-${taskIdx}`}
                          className={`relative border-b border-gray-100 task-row-${funnel}-${task.id}`}
                          style={{ height: ROW_HEIGHT }}
                        >
                          <div className="relative h-full">
                            {/* Draw each instance on a single task row */}
                            {task.instances.map((instanceSegments, instanceIdx) => {
                              // Sort segments by start time
                              const sortedSegments = [...instanceSegments].sort((a, b) => a.startPosition - b.startPosition);
                              
                              // Draw dashed connectors between segments in an instance
                              const connectors = sortedSegments.length > 1 ? sortedSegments.slice(0, -1).map((segment, segIdx) => {
                                const nextSegment = sortedSegments[segIdx + 1];
                                const currentPos = getSegmentPosition(segment);
                                const nextPos = getSegmentPosition(nextSegment);
                            
                                const currentLeft = currentPos.left;
                                const currentWidth = currentPos.width;
                                const nextLeft = nextPos.left;
                                
                                // Only draw connector if there's a gap
                                if (currentLeft + currentWidth < nextLeft) {
                                  return (
                                    <div
                                      key={`connector-${task.id}-${instanceIdx}-${segIdx}`}
                                      className="absolute border-t-2 border-dashed"
                                      style={{
                                        borderColor: 'rgba(156, 163, 175, 0.5)',
                                        left: `${(currentLeft + currentWidth) * zoomLevel}px`,
                                        width: `${(nextLeft - currentLeft - currentWidth) * zoomLevel}px`,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        zIndex: 5
                                      }}
                                    />
                                  );
                                }
                                return null;
                              }) : [];
                              
                              // Draw the segments for this instance
                              return (
                                <React.Fragment key={`instance-${instanceIdx}`}>
                                  {connectors}
                                  
                                  {sortedSegments.map((segment, segmentIdx) => {
                                    const position = getSegmentPosition(segment);
                                    const statusColor = statusColors[segment.status] || '#6B7280';
                                    const width = position.width;
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

                                    // Segment height based on compact view
                                    const segmentHeight = compactView ? 12 : 20;

                                    return (
                                      <div
                                        key={`instance-${instanceIdx}-segment-${segmentIdx}`}
                                        className={`absolute task-segment instance-${instanceIdx}-segment-${segmentIdx} flex items-center rounded`}
                                        style={{
                                          left: `${position.left * zoomLevel}px`,
                                          width: `${position.width * zoomLevel}px`,
                                          height: segmentHeight,
                                          top: `calc(50% - ${segmentHeight / 2}px)`,
                                          backgroundColor: funnelColor,
                                          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                          zIndex: 10,
                                          ...specialStyle
                                        }}
                                        onClick={(e) => handleTaskClick(e, task, segment, instanceIdx)}
                                        onMouseEnter={(e) => handleTaskMouseEnter(e, task, segment, instanceIdx)}
                                        onMouseLeave={handleTaskMouseLeave}
                                      >
                                        {/* Display duration if segment is wide enough */}
                                        {!compactView && width * zoomLevel > 30 && (
                                          <span className="text-xs text-white truncate px-1.5">
                                            {formatDuration(segment)}
                                          </span>
                                        )}

                                        {/* Status indicator */}
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
                                        {!compactView && isHighlighted && width * zoomLevel > 30 && (
                                          <div className="absolute top-0 left-0 transform -translate-y-full -translate-x-1/2">
                                            <span className={`text-xs px-1 py-0.5 rounded ${
                                              segment === taskStats.slowestSegment ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                              {segment === taskStats.slowestSegment ? 'Slowest' : 'Fastest'}
                                            </span>
                                          </div>
                                        )}
                                        
                                        {/* Instance indicator for repeated instances */}
                                        {task.hasCycles && instanceIdx > 0 && segmentIdx === 0 && (
                                          <div className="absolute top-0 left-0 transform -translate-y-full">
                                            <span className="text-xs px-1 py-0.5 rounded bg-purple-100 text-purple-800">
                                              #{instanceIdx + 1}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </React.Fragment>
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