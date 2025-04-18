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
    case 'NEW':
      return 'bg-blue-400';     
    case 'TODO':
      return 'bg-indigo-500';   
    case 'IN_PROGRESS':
      return 'bg-amber-500';    
    case 'COMPLETED':
      return 'bg-emerald-500'; 
    case 'SKIPPED':
      return 'bg-slate-400';    
    default:
      return 'bg-gray-400';     
  }
}

export const formatDuration = (milliseconds) => {
  if (milliseconds === undefined || milliseconds === null || milliseconds === 0) {
    return '0 sec';
  }

  const seconds = Math.floor(milliseconds / 1000);
  
  if (seconds < 60) {
    return `${seconds} sec`;
  }
  
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 
      ? `${minutes} min ${remainingSeconds} sec` 
      : `${minutes} min`;
  }
  
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    const remainingMinutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    return remainingSeconds > 0 
      ? `${hours} hr ${remainingMinutes} min ${remainingSeconds} sec` 
      : `${hours} hr ${remainingMinutes} min`;
  }
  
  const days = Math.floor(seconds / 86400);
  const remainingHours = Math.floor((seconds % 86400) / 3600);
  const remainingMinutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  let result = `${days} day${days !== 1 ? 's' : ''}`;
  
  if (remainingHours > 0) {
    result += ` ${remainingHours} hr`;
  }
  
  if (remainingMinutes > 0) {
    result += ` ${remainingMinutes} min`;
  }
  
  if (remainingSeconds > 0) {
    result += ` ${remainingSeconds} sec`;
  }
  
  return result;
};