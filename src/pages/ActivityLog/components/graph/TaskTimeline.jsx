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
  const [timelineMode, setTimelineMode] = useState('discrete'); // 'discrete' or 'fixed'
  
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
  const FIFTEEN_MINUTES = 15 * 60 * 1000;
  const TEN_MINUTES = 10 * 60 * 1000;
  
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
  
  // Generate fixed timeline with 5-minute intervals
  const fixedTimelineData = useMemo(() => {
    if (timelineMode !== 'fixed') return null;
    console.log('Processing tasks for fixed timeline');
    
    // Find earliest and latest timestamps across all tasks
    let earliestTime = Infinity;
    let latestTime = -Infinity;
    
    Object.values(tasksByFunnel).flat().forEach(task => {
      task.segments.forEach(segment => {
        earliestTime = Math.min(earliestTime, segment.startTime.getTime());
        latestTime = Math.max(latestTime, segment.endTime.getTime());
      });
    });
    
    // Handle empty data case
    if (earliestTime === Infinity || latestTime === -Infinity) {
      return {
        timePoints: [],
        compressionPoints: [],
        processedTasks: {},
        totalWidth: 0
      };
    }
    
    // Round to nearest 5 minute intervals
    const startTime = Math.floor(earliestTime / FIFTEEN_MINUTES) * FIFTEEN_MINUTES;
    const endTime = Math.ceil(latestTime / FIFTEEN_MINUTES) * FIFTEEN_MINUTES;
    
    // Generate all potential time points
    const allTimePoints = [];
    for (let time = startTime; time <= endTime; time += FIFTEEN_MINUTES) {
      allTimePoints.push(time);
    }
    
    // Find periods of activity
    const activityPeriods = [];
    
    for (let i = 0; i < allTimePoints.length; i++) {
      const currentTime = allTimePoints[i];
      const nextTime = allTimePoints[i + 1] || (currentTime + FIFTEEN_MINUTES);
      
      // Check if there's any task activity in this interval
      const hasActivity = Object.values(tasksByFunnel).flat().some(task => 
        task.segments.some(segment => {
          const segStart = segment.startTime.getTime();
          const segEnd = segment.endTime.getTime();
          return (segStart <= nextTime && segEnd >= currentTime);
        })
      );
      
      if (hasActivity) {
        // If we have an existing period that's close enough, extend it
        if (activityPeriods.length > 0) {
          const lastPeriod = activityPeriods[activityPeriods.length - 1];
          if (currentTime - lastPeriod.end <= TEN_MINUTES) {
            lastPeriod.end = nextTime;
            continue;
          }
        }
        
        // Otherwise start a new activity period
        activityPeriods.push({
          start: currentTime,
          end: nextTime
        });
      }
    }
    
    // Merge adjacent activity periods
    for (let i = 0; i < activityPeriods.length - 1; i++) {
      if (activityPeriods[i + 1].start - activityPeriods[i].end <= TEN_MINUTES) {
        activityPeriods[i].end = activityPeriods[i + 1].end;
        activityPeriods.splice(i + 1, 1);
        i--; // Check this position again
      }
    }
    
    // Generate time points with compression
    const timePoints = [];
    const compressionPoints = [];
    let position = 0;
    
    // Create points for start of timeline
    timePoints.push({
      time: new Date(startTime),
      position: position,
      compressed: false,
      isCompressedStart: false,
      isCompressedEnd: false
    });
    
    let lastTime = startTime;
    
    // Process each activity period with compressed gaps
    activityPeriods.forEach((period, index) => {
      // If there's a gap before this period, compress it
      if (period.start - lastTime > TEN_MINUTES) {
        // Mark compressed section
        compressionPoints.push({
          startTime: lastTime,
          endTime: period.start,
          startPosition: position,
          compressionRatio: 0.2 // 80% compression
        });
        
        // Add compressed indicator points
        timePoints.push({
          time: new Date(lastTime + FIFTEEN_MINUTES),
          position: position + TIMELINE_PADDING * 0.2,
          compressed: true,
          isCompressedStart: true,
          isCompressedEnd: false
        });
        
        timePoints.push({
          time: new Date(period.start - FIFTEEN_MINUTES),
          position: position + TIMELINE_PADDING * 0.4,
          compressed: true,
          isCompressedStart: false,
          isCompressedEnd: true
        });
        
        // Update position after compression
        position += TIMELINE_PADDING * 0.5;
      }
      
      // Add all time points within this activity period
      for (let time = period.start; time <= period.end; time += FIFTEEN_MINUTES) {
        if (time > lastTime) { // Avoid duplicates
          timePoints.push({
            time: new Date(time),
            position: position,
            compressed: false,
            isCompressedStart: false,
            isCompressedEnd: false
          });
          position += TIMELINE_PADDING;
          lastTime = time;
        }
      }
    });
    
    // Process tasks with fixed timeline positions
    const processedTasks = {};
    
    Object.entries(tasksByFunnel).forEach(([funnel, tasks]) => {
      processedTasks[funnel] = [];
      
      // Group tasks by ID similar to discrete timeline
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
        
        // Add position data to segments based on fixed timeline
        allSegments = allSegments.map(segment => {
          // Find positions for start and end times
          const startTime = segment.startTime.getTime();
          const endTime = segment.endTime.getTime();
          
          // Find the nearest time points
          let startPosition = null;
          let endPosition = null;
          
          // Check for compressed sections that contain the start/end times
          const startCompression = compressionPoints.find(cp => 
            startTime >= cp.startTime && startTime <= cp.endTime
          );
          
          const endCompression = compressionPoints.find(cp => 
            endTime >= cp.startTime && endTime <= cp.endTime
          );
          
          if (startCompression) {
            // Interpolate position within compressed section
            const ratio = (startTime - startCompression.startTime) / 
                         (startCompression.endTime - startCompression.startTime);
            const compressedWidth = TIMELINE_PADDING * 0.5;
            startPosition = startCompression.startPosition + (ratio * compressedWidth);
          } else {
            // Find nearest time point before or at start time
            for (let i = 0; i < timePoints.length; i++) {
              const point = timePoints[i];
              if (point.time.getTime() <= startTime) {
                startPosition = point.position;
              } else {
                // Interpolate between time points if needed
                if (i > 0 && !point.compressed && !timePoints[i-1].compressed) {
                  const prevPoint = timePoints[i-1];
                  const ratio = (startTime - prevPoint.time.getTime()) /
                               (point.time.getTime() - prevPoint.time.getTime());
                  startPosition = prevPoint.position + 
                                 (ratio * (point.position - prevPoint.position));
                }
                break;
              }
            }
          }
          
          if (endCompression) {
            // Interpolate position within compressed section
            const ratio = (endTime - endCompression.startTime) / 
                         (endCompression.endTime - endCompression.startTime);
            const compressedWidth = TIMELINE_PADDING * 0.5;
            endPosition = endCompression.startPosition + (ratio * compressedWidth);
          } else {
            // Find nearest time point after or at end time
            for (let i = timePoints.length - 1; i >= 0; i--) {
              const point = timePoints[i];
              if (point.time.getTime() >= endTime) {
                endPosition = point.position;
              } else {
                // Interpolate between time points if needed
                if (i < timePoints.length - 1 && !point.compressed && !timePoints[i+1].compressed) {
                  const nextPoint = timePoints[i+1];
                  const ratio = (endTime - point.time.getTime()) /
                               (nextPoint.time.getTime() - point.time.getTime());
                  endPosition = point.position + 
                               (ratio * (nextPoint.position - point.position));
                }
                break;
              }
            }
          }
          
          // Fallback to first/last position if needed
          if (startPosition === null) startPosition = timePoints[0].position;
          if (endPosition === null) endPosition = timePoints[timePoints.length - 1].position;
          
          return {
            ...segment,
            startPosition: startPosition,
            endPosition: endPosition
          };
        });
        
        // Use same instance creation logic as discrete timeline
        let hasTodoTransition = false;
        let previousStates = [];
        
        for (let i = 0; i < allSegments.length; i++) {
          if (allSegments[i].status === 'TODO' && i > 0) {
            const previousTodoIndex = previousStates.lastIndexOf('TODO');
            if (previousTodoIndex !== -1 && previousTodoIndex < previousStates.length - 1) {
              hasTodoTransition = true;
              break;
            }
          }
          previousStates.push(allSegments[i].status);
        }
        
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
        
        let instances = [];
        let currentInstance = [];
        let seenStatuses = [];
        
        allSegments.forEach((segment, index) => {
          if (index === 0) {
            currentInstance.push(segment);
            seenStatuses.push(segment.status);
            return;
          }
          
          if (segment.status === 'TODO') {
            const previousTodoIndex = seenStatuses.lastIndexOf('TODO');
            if (previousTodoIndex !== -1 && previousTodoIndex < seenStatuses.length - 1) {
              if (currentInstance.length > 0) {
                instances.push([...currentInstance]);
                currentInstance = [];
                seenStatuses = [];
              }
            }
          }
          
          currentInstance.push(segment);
          seenStatuses.push(segment.status);
        });
        
        if (currentInstance.length > 0) {
          instances.push(currentInstance);
        }
        
        if (instances.length > 0) {
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
    
    // Sort tasks using same logic as discrete timeline
    Object.keys(processedTasks).forEach(funnel => {
      if (processedTasks[funnel] && processedTasks[funnel].length > 0) {
        processedTasks[funnel].sort((taskA, taskB) => {
          const getPriorityTime = (task) => {
            const normalizedChanges = task.statusChanges.map(change => ({
              ...change,
              status: change.status === 'TO DO' ? 'TODO' : change.status
            }));
            
            const todoChange = normalizedChanges.find(change => change.status === 'TODO');
            if (todoChange) return todoChange.time;
            
            const inProgressChange = normalizedChanges.find(change => change.status === 'IN_PROGRESS');
            if (inProgressChange) return inProgressChange.time;
            
            const newChange = normalizedChanges.find(change => change.status === 'COMPLETED');
            if (newChange) return newChange.time;
            
            return task.statusChanges[0]?.time || new Date();
          };
          
          const timeA = getPriorityTime(taskA);
          const timeB = getPriorityTime(taskB);
          
          return timeA - timeB;
        });
      }
    });
    
    return {
      timePoints,
      compressionPoints,
      processedTasks,
      totalWidth: position
    };
  }, [tasksByFunnel, timelineMode, FIFTEEN_MINUTES, TEN_MINUTES, TIMELINE_PADDING]);
  
  // Choose the timeline data based on current mode
  const timelineData = timelineMode === 'discrete' ? discreteTimelineData : fixedTimelineData;
  
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
    Object.entries(timelineData.processedTasks).forEach(([funnel, tasks]) => {
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
  }, [timelineData, collapsedFunnels, getSegmentPosition, zoomLevel]);

  // Draw connections between tasks and their targets
  const drawTaskConnections = useCallback(() => {
    console.log("Drawing task connections");
    // Clear existing connections
    const existingLines = document.querySelectorAll('.sendback-connection-line, .sendback-connection-arrow');
    existingLines.forEach(line => line.remove());
  
    if (!timelineRef.current) return;
  
    // Collect ALL SENDBACK events with targetTaskId
    const sendbackEvents = [];
    
    // Flatten all tasks across all funnels for processing
    const allTasks = Object.entries(timelineData.processedTasks)
      .filter(([funnel]) => !collapsedFunnels[funnel])
      .flatMap(([funnel, tasks]) => tasks);
  
    // For debugging, count all SENDBACK statuses
    const allSendbacks = allTasks.flatMap(task => 
      task.statuses?.filter(s => s.status === 'SENDBACK') || []
    );
    console.log(`Found ${allSendbacks.length} total SENDBACK statuses`);
    
    // Process each task to extract SENDBACK events
    allTasks.forEach(task => {
      // Get only SENDBACK statuses with valid targetTaskId
      const sendbacks = task.statuses?.filter(status => 
        status.status === 'SENDBACK' && status.targetTaskId
      ) || [];
      
      if (sendbacks.length === 0) return;
      console.log(`Task ${task.id} has ${sendbacks.length} valid SENDBACK events`);
      
      // For each SENDBACK status, create a separate event
      sendbacks.forEach(status => {
        // Find the segment that contains this SENDBACK time
        const statusTime = status.time;
        let bestInstanceIndex = 0;
        let bestSegmentIndex = 0;
        let bestSegment = null;
        let smallestTimeDiff = Infinity;
        
        // Search all instances/segments for the one containing this status time
        if (task.instances) {
          for (let i = 0; i < task.instances.length; i++) {
            const instance = task.instances[i];
            for (let j = 0; j < instance.length; j++) {
              const segment = instance[j];
              
              // Check if status time falls within this segment
              if (statusTime >= segment.startTime && statusTime <= segment.endTime) {
                bestInstanceIndex = i;
                bestSegmentIndex = j;
                bestSegment = segment;
                smallestTimeDiff = 0; // Perfect match
                break;
              }
              
              // If not a match, find closest segment
              const startDiff = Math.abs(statusTime - segment.startTime);
              const endDiff = Math.abs(statusTime - segment.endTime);
              const minDiff = Math.min(startDiff, endDiff);
              
              if (minDiff < smallestTimeDiff) {
                smallestTimeDiff = minDiff;
                bestInstanceIndex = i;
                bestSegmentIndex = j;
                bestSegment = segment;
              }
            }
            if (smallestTimeDiff === 0) break; // Found perfect match
          }
        }
        
        // Only add if we found a segment
        if (bestSegment) {
          sendbackEvents.push({
            sourceTaskId: task.id,
            sourceFunnel: task.funnel,
            sendbackTime: statusTime,
            targetTaskId: status.targetTaskId,
            segmentStart: bestSegment.startTime,
            segmentEnd: bestSegment.endTime,
            instanceIndex: bestInstanceIndex,
            segmentIndex: bestSegmentIndex
          });
          
          console.log(`Added SENDBACK event: ${task.id} -> ${status.targetTaskId} at ${statusTime}`);
        }
      });
    });
  
    console.log(`Processing ${sendbackEvents.length} total SENDBACK connections`);
    if (sendbackEvents.length === 0) return;
  
    // Get timeline container
    const timeline = timelineRef.current.querySelector('.flex-1');
    if (!timeline) return;
    const timelineRect = timeline.getBoundingClientRect();
    
    // Draw connections for each SENDBACK event
    sendbackEvents.forEach((event, idx) => {
      // Find source and target elements in DOM
      const sourceSelector = `.task-row-${event.sourceFunnel}-${event.sourceTaskId}`;
      const sourceSegSelector = `${sourceSelector} .instance-${event.instanceIndex}-segment-${event.segmentIndex}`;
      const sourceEl = document.querySelector(sourceSegSelector);
      
      // If source element not found, try a more general selector as fallback
      const sourceFallbackSelector = `${sourceSelector} .instance-${event.instanceIndex}-segment-0`;
      const sourceElementToUse = sourceEl || document.querySelector(sourceFallbackSelector);
      
      if (!sourceElementToUse) {
        console.log(`Source element not found: ${sourceSegSelector} or ${sourceFallbackSelector}`);
        return;
      }
      
      // Find target task
      const targetTask = allTasks.find(t => t.id === event.targetTaskId);
      if (!targetTask) {
        console.log(`Target task not found: ${event.targetTaskId}`);
        return;
      }
      
      // Find target element
      const targetSelector = `.task-row-${targetTask.funnel}-${targetTask.id}`;
      const targetEl = document.querySelector(`${targetSelector} .instance-0-segment-0`);
      if (!targetEl) {
        console.log(`Target element not found: ${targetSelector}`);
        return;
      }
      
      // Get bounding rectangles
      const sourceRect = sourceElementToUse.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();
      
      // Calculate position ratio within the source segment
      let positionRatio;
      const sendbackTimeMS = event.sendbackTime.getTime();
      const segmentStartMS = event.segmentStart.getTime();
      const segmentEndMS = event.segmentEnd.getTime();
      const segmentDuration = segmentEndMS - segmentStartMS;
      
      if (sendbackTimeMS <= segmentStartMS) {
        positionRatio = 0;
      } else if (sendbackTimeMS >= segmentEndMS) {
        positionRatio = 1;
      } else if (segmentDuration <= 0) {
        positionRatio = 0.5; // Fallback if segment has zero duration
      } else {
        positionRatio = (sendbackTimeMS - segmentStartMS) / segmentDuration;
      }
      
      console.log(`Event ${idx}: Ratio=${positionRatio.toFixed(3)} for time ${event.sendbackTime}`);
      
      // Calculate position coordinates
      const sourceX = sourceRect.left + (sourceRect.width * positionRatio);
      const lineX = sourceX - timelineRect.left + timeline.scrollLeft;
      
      const sourceY = sourceRect.top - timelineRect.top + timeline.scrollTop + (sourceRect.height / 2);
      const targetY = targetRect.top - timelineRect.top + timeline.scrollTop + (targetRect.height / 2);
      const lineHeight = Math.abs(targetY - sourceY);
      const topY = Math.min(sourceY, targetY);
      
      // Create line
      const line = document.createElement('div');
      line.className = 'sendback-connection-line';
      line.style.position = 'absolute';
      line.style.left = `${lineX}px`;
      line.style.top = `${topY}px`;
      line.style.width = '2px';
      line.style.height = `${lineHeight}px`;
      line.style.borderLeft = '2px dashed #f97316';
      line.style.zIndex = '5';
      
      // Create arrow
      const arrow = document.createElement('div');
      arrow.className = 'sendback-connection-arrow';
      arrow.style.position = 'absolute';
      arrow.style.left = `${lineX - 6}px`; // Wider positioning
      arrow.style.zIndex = '10'; // Higher z-index to appear above bars

      if (sourceY < targetY) {
        // Arrow pointing down (source above target)
        arrow.style.top = `${targetY - 10}px`; // Position further from target
        arrow.style.borderTop = '10px solid #f97316'; // Bigger arrowhead
        arrow.style.borderBottom = 'none';
      } else {
        // Arrow pointing up (source below target)
        arrow.style.top = `${targetY - 0}px`; // Position slightly higher
        arrow.style.borderBottom = '10px solid #f97316'; // Bigger arrowhead
        arrow.style.borderTop = 'none';
      }

      arrow.style.width = '0';
      arrow.style.height = '0';
      arrow.style.borderLeft = '8px solid transparent'; // Wider arrow base
      arrow.style.borderRight = '8px solid transparent'; // Wider arrow base
      arrow.style.zIndex = '5';
      
      // Add elements to DOM
      timeline.appendChild(line);
      timeline.appendChild(arrow);
      
      console.log(`Created connection: ${event.sourceTaskId} -> ${event.targetTaskId}`);
    });
  }, [timelineData, collapsedFunnels]);
  
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
    if (initialScrollAppliedRef.current || !timelineData?.totalWidth) return;
    
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
        Object.entries(timelineData.processedTasks).forEach(([funnel, tasks]) => {
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
  }, [timelineData, zoomLevel]);

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
  }, [drawTaskConnections, drawInstanceConnections, connectionKey, zoomLevel, timelineMode]);

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
      {/* Fixed zoom control and timeline mode toggle */}
      <div className="fixed top-20 right-4 z-50 flex flex-col space-y-2">
        <div className="text-xs bg-white px-3 py-2 rounded-md shadow-sm border border-gray-200 flex items-center space-x-3">
          <div>
            <span className="text-gray-500 mr-2">Mode:</span>
            <button 
              className={`px-2 py-1 text-xs rounded-md ${timelineMode === 'discrete' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setTimelineMode('discrete')}
            >
              Discrete
            </button>
            <button 
              className={`px-2 py-1 text-xs rounded-md ml-1 ${timelineMode === 'fixed' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setTimelineMode('fixed')}
            >
              Fixed (15min)
            </button>
          </div>
          <div className="w-px h-4 bg-gray-300"></div>
          <div>
            <span className="text-gray-500 mr-2">Zoom:</span>
            <span className="font-medium">{Math.round(zoomLevel * 100)}%</span>
          </div>
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

        {/* Timeline header with scrollable container */}
        <div className="flex-1 overflow-x-auto bg-gray-50" style={{ overflowY: 'hidden' }}>
          <div 
            className="relative" 
            style={{ 
              width: `${timelineData?.totalWidth * zoomLevel}px` || '100%', 
              height: HEADER_HEIGHT,
              minWidth: '100%'
            }}
          >
            {/* Time ticks */}
            {timelineData?.timePoints.map((point, i) => (
              <div
                key={i}
                className={`absolute top-0 h-full flex flex-col items-center ${
                  point.compressed ? 'opacity-50' : ''
                }`}
                style={{ 
                  left: `${point.position * zoomLevel}px`, 
                  zIndex: 2 
                }}
              >
                <div className={`h-8 border-l ${
                  point.isCompressedStart ? 'border-yellow-400 border-dashed border-l-2' : 
                  point.isCompressedEnd ? 'border-yellow-400 border-dashed border-l-2' : 
                  point.compressed ? 'border-gray-200 border-dashed' : 'border-gray-300'
                }`} style={{ width: '1px' }}></div>
                
                {/* Time label with special styling for compressed sections */}
                {(!point.compressed || point.isCompressedStart || point.isCompressedEnd) && (
                  <div 
                    className={`text-[11px] transform -rotate-45 origin-top-left whitespace-nowrap font-medium ${
                      point.isCompressedStart || point.isCompressedEnd
                        ? 'text-yellow-600'
                        : 'text-gray-700'
                    }`}
                    style={{ marginTop: '10px', marginLeft: '4px' }}
                  >
                    {formatTimeLabel(point.time)}
                    {(point.isCompressedStart || point.isCompressedEnd) && (
                      <span className="ml-1 text-yellow-600">
                        {point.isCompressedStart ? '(gap start)' : '(gap end)'}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
            
            {/* Compression indicators for fixed mode */}
            {timelineMode === 'fixed' && timelineData?.compressionPoints.map((cp, i) => (
              <div
                key={`compression-${i}`}
                className="absolute top-0 h-full flex items-center justify-center"
                style={{
                  left: `${cp.startPosition * zoomLevel}px`,
                  width: `${(cp.endPosition - cp.startPosition) * zoomLevel}px`,
                  background: 'repeating-linear-gradient(45deg, rgba(250, 204, 21, 0.1), rgba(250, 204, 21, 0.1) 5px, rgba(234, 179, 8, 0.2) 5px, rgba(234, 179, 8, 0.2) 10px)',
                  zIndex: 1
                }}
              >
                <div 
                  className="text-[10px] text-yellow-600 font-medium bg-white/80 px-1 py-0.5 rounded shadow-sm"
                  style={{ transform: 'rotate(-45deg)' }}
                >
                  Compressed gap
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
            const funnelTasks = timelineData?.processedTasks[funnel] || [];
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
              width: `${timelineData?.totalWidth * zoomLevel}px` || '100%',
              minWidth: '100%'
            }}
          >
            {/* Vertical grid lines */}
            {timelineData?.timePoints.map((point, i) => (
              <div
                key={`grid-line-${i}`}
                className={`absolute top-0 bottom-0 ${
                  point.isCompressedStart ? 'border-l-2 border-yellow-400 border-dashed' :
                  point.isCompressedEnd ? 'border-l-2 border-yellow-400 border-dashed' :
                  point.compressed ? 'border-l border-gray-200 border-dashed' : 'border-l border-gray-200'
                }`}
                style={{
                  left: `${point.position * zoomLevel}px`,
                  height: '100%',
                  zIndex: 1
                }}
              />
            ))}
            
            {/* Compression background areas for fixed mode */}
            {timelineMode === 'fixed' && timelineData?.compressionPoints.map((cp, i) => (
              <div
                key={`compression-bg-${i}`}
                className="absolute top-0 bottom-0"
                style={{
                  left: `${cp.startPosition * zoomLevel}px`,
                  width: `${(cp.endPosition - cp.startPosition) * zoomLevel}px`,
                  height: '100%',
                  background: 'repeating-linear-gradient(45deg, rgba(250, 204, 21, 0.1), rgba(250, 204, 21, 0.1) 5px, rgba(234, 179, 8, 0.2) 5px, rgba(234, 179, 8, 0.2) 10px)',
                  zIndex: 0
                }}
              />
            ))}

            {/* Funnel timelines */}
            <div className="relative">
              {funnels.map((funnel, funnelIdx) => {
                const funnelTasks = timelineData?.processedTasks[funnel] || [];
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