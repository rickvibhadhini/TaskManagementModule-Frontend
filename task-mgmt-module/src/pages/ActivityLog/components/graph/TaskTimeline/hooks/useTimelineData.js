import { useMemo } from 'react';

const useTimelineData = (tasksByFunnel, TIMELINE_PADDING) => {
  const discreteTimelineData = useMemo(() => {
    // Collect all task events (start/end times)
    const allEvents = [];
    
    // Process all tasks to get their timestamps
    Object.values(tasksByFunnel || {}).flat().forEach(task => {
      if (!task || !task.segments) return;
      
      task.segments.forEach(segment => {
        if (!segment.startTime || !segment.endTime) return;
        
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
    
    Object.entries(tasksByFunnel || {}).forEach(([funnel, tasks]) => {
      processedTasks[funnel] = [];
      
      // Group tasks by ID
      const taskGroupsByID = {};
      tasks.forEach(task => {
        if (!task.id) return;
        
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
          if (!task.segments) return;
          
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
        
        // Skip if no segments
        if (allSegments.length === 0) return;
        
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
    
    return {
      timeMap,
      processedTasks,
      totalWidth,
      timePoints
    };
  }, [tasksByFunnel, TIMELINE_PADDING]);

  return { discreteTimelineData };
};

export default useTimelineData;