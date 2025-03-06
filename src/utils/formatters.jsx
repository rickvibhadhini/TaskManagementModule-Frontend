
export function formatTaskName(taskId) {
  if (!taskId) return 'Unknown Task';
  
  return taskId
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function getStatusColor(status) {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-100 text-green-800';
    case 'NEW':
      return 'bg-blue-100 text-blue-800';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'FAILED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getStatusDotColor(status) {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-500';
    case 'NEW':
      return 'bg-blue-500';
    case 'PENDING':
      return 'bg-yellow-500';
    case 'FAILED':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
}
