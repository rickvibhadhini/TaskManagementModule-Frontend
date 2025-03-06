
import { formatTaskName } from './formatters';

export function transformApiData(apiData) {
  // Create an array of funnels from all categories in the response object
  return Object.entries(apiData).map(([funnelName, tasks]) => {
    // Group tasks by taskId
    const taskGroups = {};
    
    tasks.forEach(task => {
      if (!taskGroups[task.taskId]) {
        taskGroups[task.taskId] = {
          id: task.taskId,
          name: formatTaskName(task.taskId),
          handledBy: task.handledBy || 'N/A',
          createdAt: task.createdAt,
          order: task.order,
          currentStatus: getCurrentStatus(task.statusHistory),
          statusHistory: task.statusHistory || []
        };
      }
    });
    
    // Convert task groups object to array and sort by order
    const sortedTasks = Object.values(taskGroups).sort((a, b) => a.order - b.order);
    
    // Calculate completion stats
    const completedTasks = sortedTasks.filter(task => 
      task.currentStatus === 'COMPLETED'
    ).length;
    
    return {
      id: `funnel-${funnelName.toLowerCase()}`,
      name: funnelName,
      status: completedTasks === sortedTasks.length ? 'completed' : 'in-progress',
      progress: `${completedTasks}/${sortedTasks.length}`,
      tasks: sortedTasks
    };
  });
}

// Helper function to get current status from status history
export function getCurrentStatus(statusHistory) {
  if (!statusHistory || statusHistory.length === 0) return 'UNKNOWN';
  return statusHistory[statusHistory.length - 1].status;
}
