// utils/apiTransformers.js
export const transformApiData = (data) => {
  const result = [];
  
  // Add latest task state as a special "funnel" at the top
  if (data.latestTaskState) {
    const latestTask = data.latestTaskState;
    result.push({
      id: 'latest-task',
      name: 'Latest Task',
      status: 'special',
      progress: '',
      funnelDuration: 0,
      tasks: [{
        id: latestTask.taskId,
        name: formatTaskName(latestTask.taskId),
        currentStatus: latestTask.status,
        handledBy: latestTask.handledBy,
        duration: latestTask.duration,
        sendbacks: latestTask.sendbacks,
        visited: latestTask.visited,
        statusHistory: [
          {
            status: latestTask.status,
            updatedAt: latestTask.updatedAt
          }
        ],
        createdAt: latestTask.createdAt
      }]
    });
  }
  
  // Process regular funnels
  if (data.tasksGroupedByFunnel) {
    Object.entries(data.tasksGroupedByFunnel).forEach(([funnelName, funnelData]) => {
      // Skip the sendbackTasks key if it exists in tasksGroupedByFunnel
      if (funnelName === 'sendbackTasks' || funnelName === 'latestTaskState') {
        return;
      }
      
      const tasks = funnelData.tasks.map(task => ({
        id: task.taskId,
        name: formatTaskName(task.taskId),
        currentStatus: task.statusHistory && task.statusHistory.length > 0 
          ? task.statusHistory[task.statusHistory.length - 1].status 
          : 'UNKNOWN',
        handledBy: task.handledBy,
        duration: task.duration,
        sendbacks: task.sendbacks,
        visited: task.visited,
        statusHistory: task.statusHistory || [],
        createdAt: task.createdAt
      }));
      
      const completedTasks = tasks.filter(task => task.currentStatus === 'COMPLETED').length;
      
      result.push({
        id: funnelName,
        name: funnelName,
        status: completedTasks === tasks.length && tasks.length > 0 ? 'completed' : 'in-progress',
        progress: `${completedTasks}/${tasks.length}`,
        funnelDuration: funnelData.funnelDuration || 0,
        tasks
      });
    });
  }
// Process sendback tasks
if (data.sendbackTasks) {
  Object.entries(data.sendbackTasks).forEach(([targetId, tasks]) => {
    const transformedTasks = tasks.map(task => ({
      id: `${task.taskId}-${task.createdAt}`,
      name: formatTaskName(task.taskId),
      currentStatus: task.statusHistory && task.statusHistory.length > 0 
        ? task.statusHistory[task.statusHistory.length - 1].status 
        : 'UNKNOWN',
      handledBy: task.handledBy,
      duration: task.duration,
      sendbacks: task.sendbacks,
      visited: task.visited,
      statusHistory: task.statusHistory || [],
      createdAt: task.createdAt,
      targetTaskId: task.targetTaskId,
      // Add these two fields from the API response
      sourceLoanStage: task.sourceLoanStage,
      sourceSubModule: task.sourceSubModule
    }));
    
    const completedTasks = transformedTasks.filter(task => task.currentStatus === 'COMPLETED').length;
    
    result.push({
      id: `sendback-${targetId}`,
      name: targetId === 'UNKNOWN_REQUEST' ? 'Unknown Sendbacks' : `Sendbacks for ${formatTaskName(targetId)}`,
      status: 'sendback',
      progress: `${completedTasks}/${transformedTasks.length}`,
      funnelDuration: 0,
      tasks: transformedTasks
    });
  });
}

return result;
};
// Helper function to format task names
const formatTaskName = (taskId) => {
  if (!taskId) return 'Unknown Task';
  
  // Convert snake_case to Title Case
  return taskId
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};