import { format } from 'date-fns';

export const funnelColors = {
  SOURCING: '#3498DB',    // Blue
  CREDIT: '#8E44AD',      // Purple
  CONVERSION: '#8B4513',  // Brown
  FULFILLMENT: '#20B2AA', // Teal
  DISBURSAL: '#556B2F',   // Olive green
  RISK: '#2c3e50',        // Dark almost black
  RTO: '#FF69B4',  //Pink
  OTHERS: '#95a5a6',      // Grey
};

// Define status colors 
export const statusColors = {
  NEW: '#FFCC00',         // Yellow
  'TO DO': '#ef4444',     // Red
  TODO: '#ef4444',        // Red (alternative naming)
  IN_PROGRESS: '#f97316', // Orange
  COMPLETED: '#16a34a',   // Green
  PENDING: '#f59e0b',     // Amber
  FAILED: '#FF1493',      // dark ppink
  SENDBACK:'#8B4513',//BROWN
  INITIATED: '#3B82F6',   // Blue
  SENDBACK: '#FF6B6B',    // Bright red for sendback status
};

export const processDataForChart = (funnelGroups) => {
  let allTasks = [];
  const uniqueFunnels = [];
  let minTime = null;
  let maxTime = null;

  // Create a global taskMap to ensure unique task IDs across all funnels
  const taskMap = {};

  // First pass: collect all status changes for each task
  funnelGroups.forEach((group) => {
    const funnelName = group.funnelName;

    if (!uniqueFunnels.includes(funnelName)) {
      uniqueFunnels.push(funnelName);
    }

    group.tasks.forEach(task => {
      const taskTime = new Date(task.createdAt || task.updatedAt);

      if (minTime === null || maxTime === null) {
        minTime = taskTime;
        maxTime = taskTime;
      } else {
        if (taskTime < minTime) minTime = taskTime;
        if (taskTime > maxTime) maxTime = taskTime;
      }
      
      // Generate task key - special handling for sendback tasks
      let taskKey;
      if (task.taskId === "sendback") {
        const targetPart = task.targetTaskId || 'unknown';
        const sourceStagePart = task.sourceLoanStage || 'unknown';
        const sourceModulePart = task.sourceSubModule || 'unknown';
        taskKey = `${task.funnel}:${task.taskId}_${targetPart}_${sourceStagePart}_${sourceModulePart}`;
      } else {
        taskKey = `${task.funnel}:${task.taskId}`;
      }
      
      // Initialize or update task entry
      if (!taskMap[taskKey]) {
        taskMap[taskKey] = {
          id: task.taskId === "sendback" ?
            `${task.taskId}_${task.targetTaskId || 'unknown'}_${task.sourceLoanStage || 'unknown'}_${task.sourceSubModule || 'unknown'}` :
            task.taskId,
          originalTaskId: task.taskId,
          funnel: task.funnel,
          statusChanges: [{
            status: task.status,
            time: taskTime,
            targetTaskId: task.targetTaskId, // Store with each status change
            sourceLoanStage: task.sourceLoanStage,
            sourceSubModule: task.sourceSubModule
          }],
          actorId: task.actorId,
          funnelColor: funnelColors[task.funnel] || '#95A5A6',
          targetTaskId: task.targetTaskId,  // Keep this for backward compatibility
          sourceLoanStage: task.sourceLoanStage,
          sourceSubModule: task.sourceSubModule,
          metadata: task.metadata || {}
        };
      } else {
        // Add this status change with its specific targetTaskId
        taskMap[taskKey].statusChanges.push({
          status: task.status,
          time: taskTime,
          targetTaskId: task.targetTaskId, // Store with each status change
          sourceLoanStage: task.sourceLoanStage,
          sourceSubModule: task.sourceSubModule
        });
        
        // Keep updating these for backward compatibility
        if (task.targetTaskId && !taskMap[taskKey].targetTaskId) {
          taskMap[taskKey].targetTaskId = task.targetTaskId;
        }
        
        if (task.sourceLoanStage && !taskMap[taskKey].sourceLoanStage) {
          taskMap[taskKey].sourceLoanStage = task.sourceLoanStage;
        }
        
        if (task.sourceSubModule && !taskMap[taskKey].sourceSubModule) {
          taskMap[taskKey].sourceSubModule = task.sourceSubModule;
        }
      }
    });
  });
  
  // Filter out tasks that only have NEW status
  Object.keys(taskMap).forEach(key => {
    const task = taskMap[key];

    // Check if all status changes are NEW
    const onlyNewStatus = task.statusChanges.every(change => 
      change.status === 'NEW'
    );

    // Remove tasks with only NEW status
    if (onlyNewStatus) {
      delete taskMap[key];
    }
  });

  // Second pass: process status changes into segments
  Object.values(taskMap).forEach(task => {
    // Sort status changes chronologically
    task.statusChanges.sort((a, b) => a.time - b.time);

    // Function to normalize status (handle TO DO vs TODO inconsistency)
    const normalizeStatus = (status) => {
      return status === 'TO DO' ? 'TODO' : status;
    };

    // Create statuses array for tooltip display (keep all statuses for the tooltip)
    task.statuses = task.statusChanges.map(change => ({
      status: change.status,
      time: change.time,
      targetTaskId: change.targetTaskId, // Include specific targetTaskId with each status
      sourceLoanStage: change.sourceLoanStage,
      sourceSubModule: change.sourceSubModule,
      color: statusColors[change.status] || '#6B7280'
    }));

    // Set final status
    task.finalStatus = task.statuses[task.statuses.length - 1];

    // Filter out NEW status for segment creation
    const filteredStatusChanges = task.statusChanges.filter(change => 
      normalizeStatus(change.status) !== 'NEW'
    );
    
    // If no non-NEW statuses, create no segments
    if (filteredStatusChanges.length === 0) {
      task.segments = [];
      task.instances = [];
      task.hasCycles = false;
      return;
    }

    // Process segments based on workflow cycles
    const segments = [];
    const instances = [];

    // Identify cycle boundaries using the filtered status changes
    const cycleBoundaries = [];
    let previousStatus = null;
    let seenStatuses = [];

    for (let i = 0; i < filteredStatusChanges.length; i++) {
      const currentStatus = normalizeStatus(filteredStatusChanges[i].status);

      // Start a new cycle at the beginning
      if (i === 0) {
        cycleBoundaries.push(i);
        seenStatuses.push(currentStatus);
        previousStatus = currentStatus;
        continue;
      }
      // Handle the TODO state logic
      if (currentStatus === 'TODO') {
        // For any subsequent TODO after another state, create a new cycle
        if (previousStatus !== 'TODO') {
          cycleBoundaries.push(i);
        }
      }
      // Update tracking variables
      seenStatuses.push(currentStatus);
      previousStatus = currentStatus;
    }

    // Add the end of the status changes as the final boundary
    cycleBoundaries.push(filteredStatusChanges.length);

    // Create segments and instances based on cycle boundaries
    for (let i = 0; i < cycleBoundaries.length - 1; i++) {
      const startIdx = cycleBoundaries[i];
      const endIdx = cycleBoundaries[i + 1] - 1;

      if (startIdx > endIdx) continue; // Skip empty cycles

      const cycleSegments = [];

      // Create a segment covering this cycle
      const cycleStart = filteredStatusChanges[startIdx].time;
      
      // Find the end time - by default it's the last status in this cycle
      let cycleEnd = filteredStatusChanges[endIdx].time;
      
      // Find the COMPLETED status in this cycle if it exists
      const statusesInCycle = filteredStatusChanges.slice(startIdx, endIdx + 1);
      const completedStatus = statusesInCycle.find(change => 
        normalizeStatus(change.status) === 'COMPLETED'
      );
      
      if (completedStatus) {
        // Use the COMPLETED status time as the end time
        cycleEnd = completedStatus.time;
      }

      // Store the initial and final status for this cycle
      const initialStatus = normalizeStatus(filteredStatusChanges[startIdx].status);
      
      // Determine final status - either COMPLETED or the last status in the cycle
      let finalStatus;
      if (completedStatus) {
        finalStatus = 'COMPLETED';
      } else {
        finalStatus = normalizeStatus(filteredStatusChanges[endIdx].status);
      }

      const segment = {
        startTime: cycleStart,
        endTime: cycleEnd,
        status: finalStatus,
        initialStatus: initialStatus,
        cycleIndex: i
      };

      cycleSegments.push(segment);
      segments.push(segment);

      // Add this cycle as an instance
      if (cycleSegments.length > 0) {
        instances.push(cycleSegments);
      }
    }
    // Add segments and instances to task
    task.segments = segments;
    task.instances = instances;
    task.hasCycles = instances.length > 1;
  });

  // Filter out tasks with empty segments or SKIPPED status
  allTasks = Object.values(taskMap).filter(task => 
    task.segments.length > 0 && 
    task.finalStatus && 
    task.finalStatus.status !== 'SKIPPED'
  );

  // Add buffer to time range
  if (minTime && maxTime) {
    const timeRange = maxTime - minTime;
    const smallBuffer = timeRange * 0.01;
    maxTime = new Date(maxTime.getTime() + smallBuffer);
  }
  // Process tasks into funnel groups
  const processedTasks = {};
  allTasks.forEach(task => {
    if (!processedTasks[task.funnel]) {
      processedTasks[task.funnel] = [];
    }
    processedTasks[task.funnel].push(task);
  });

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
    processedTasks: allTasks, 
    uniqueFunnels, 
    timeRange: { start: minTime, end: maxTime } 
  };
};