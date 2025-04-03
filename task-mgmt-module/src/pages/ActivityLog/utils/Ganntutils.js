import { format } from 'date-fns';

// Define funnel colors with the specific scheme requested
export const funnelColors = {
  SOURCING: '#3498db',    // Blue
  CREDIT: '#8e44ad',      // Purple
  CONVERSION: '#8B4513',  // Brown
  FULFILLMENT: '#20b2aa', // Teal
  DISBURSAL: '#556B2F',   // Olive green
  RISK: '#2c3e50',        // Dark almost black
  RTO: '#FF69B4',         // Pink
  OTHERS: '#95a5a6',      // Grey
};

// Define status colors with the specific scheme requested
export const statusColors = {
  NEW: '#FFCC00',         // Yellow
  'TO DO': '#ef4444',     // Red
  TODO: '#ef4444',        // Red (alternative naming)
  IN_PROGRESS: '#f97316', // Orange
  COMPLETED: '#16a34a',   // Green
  PENDING: '#f59e0b',     // Amber
  FAILED: '#ef4444',      // Red
  INITIATED: '#3B82F6',   // Blue
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
            time: taskTime 
          }],
          actorId: task.actorId,
          funnelColor: funnelColors[task.funnel] || '#95a5a6',
          targetTaskId: task.targetTaskId,
          sourceLoanStage: task.sourceLoanStage,
          sourceSubModule: task.sourceSubModule,
          metadata: task.metadata || {}
        };
      } else {
        // Add this status change
        taskMap[taskKey].statusChanges.push({ 
          status: task.status, 
          time: taskTime 
        });
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
    
    // Create statuses array for tooltip display
    task.statuses = task.statusChanges.map(change => ({
      status: change.status,
      time: change.time,
      color: statusColors[change.status] || '#6B7280'
    }));
    
    // Set final status
    task.finalStatus = task.statuses[task.statuses.length - 1];
    
    // Process segments based on workflow cycles
    const segments = [];
    const instances = [];
    
    // Function to normalize status (handle TO DO vs TODO inconsistency)
    const normalizeStatus = (status) => {
      return status === 'TO DO' ? 'TODO' : status;
    };
    
    // Track whether we've seen a TODO transition previously
    let seenTodoTransition = false;
    
    // Identify cycle boundaries
    const cycleBoundaries = [];
    let previousStatus = null;
    let seenStatuses = [];
    
    for (let i = 0; i < task.statusChanges.length; i++) {
      const currentStatus = normalizeStatus(task.statusChanges[i].status);
      
      // Start a new cycle at the beginning
      if (i === 0) {
        cycleBoundaries.push(i);
        seenStatuses.push(currentStatus);
        previousStatus = currentStatus;
        continue;
      }
      
      // Handle the TODO state logic
      if (currentStatus === 'TODO') {
        // For the first TODO in the initial sequence, don't create a new cycle
        if (previousStatus === 'NEW' && !seenTodoTransition) {
          // This is the first TODO after NEW, no new cycle
          seenTodoTransition = true;
        } else if (previousStatus !== 'TODO') {
          // For any subsequent TODO after another state (not immediately after NEW),
          // create a new cycle
          cycleBoundaries.push(i);
        }
      }
      
      // Update tracking variables
      seenStatuses.push(currentStatus);
      previousStatus = currentStatus;
    }
    
    // Add the end of the status changes as the final boundary
    cycleBoundaries.push(task.statusChanges.length);
    
    // Create segments and instances based on cycle boundaries
    for (let i = 0; i < cycleBoundaries.length - 1; i++) {
      const startIdx = cycleBoundaries[i];
      const endIdx = cycleBoundaries[i + 1] - 1;
      
      if (startIdx > endIdx) continue; // Skip empty cycles
      
      const cycleSegments = [];
      
      // Create a segment covering this cycle
      const cycleStart = task.statusChanges[startIdx].time;
      const cycleEnd = task.statusChanges[endIdx].time;
      
      // Store the initial and final status for this cycle
      const initialStatus = normalizeStatus(task.statusChanges[startIdx].status);
      const finalStatus = normalizeStatus(task.statusChanges[endIdx].status);
      
      const segment = {
        startTime: cycleStart,
        endTime: cycleEnd,
        status: finalStatus, // Use the final status for the segment
        initialStatus: initialStatus, // Keep track of initial status too
        cycleIndex: i // Keep track of which cycle this belongs to
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
  
  allTasks = Object.values(taskMap);
  
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
  
  // Sort tasks within each funnel by earliest TODO or IN_PROGRESS status
 // Sort tasks within each funnel by earliest TODO or IN_PROGRESS status
Object.keys(processedTasks).forEach(funnel => {
  if (processedTasks[funnel] && processedTasks[funnel].length > 0) {
    processedTasks[funnel].sort((taskA, taskB) => {
      // Find earliest TODO or IN_PROGRESS for each task
      const getEarliestStatusTime = (task) => {
        // Normalize status to handle TO DO vs TODO inconsistency
        const normalizedChanges = task.statusChanges.map(change => ({
          ...change,
          status: change.status === 'TO DO' ? 'TODO' : change.status
        }));
        
        // Find the first TODO and first IN_PROGRESS
        const todoChange = normalizedChanges.find(change => change.status === 'TODO');
        const inProgressChange = normalizedChanges.find(change => change.status === 'IN_PROGRESS');
        
        // Return the earliest of TODO or IN_PROGRESS, or the first status if neither exists
        if (todoChange && inProgressChange) {
          return todoChange.time < inProgressChange.time ? todoChange.time : inProgressChange.time;
        } else if (todoChange) {
          return todoChange.time;
        } else if (inProgressChange) {
          return inProgressChange.time;
        } else {
          return task.statusChanges[0]?.time || new Date();
        }
      };
      
      // Compare the earliest status times
      const timeA = getEarliestStatusTime(taskA);
      const timeB = getEarliestStatusTime(taskB);
      
      return timeA - timeB; // Earliest tasks at top
    });
  }
});
  
  return { 
    processedTasks: allTasks, 
    uniqueFunnels, 
    timeRange: { start: minTime, end: maxTime } 
  };
};