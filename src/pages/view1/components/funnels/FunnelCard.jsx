  import React from 'react';
import TaskGroup from './TaskGroup';

function FunnelCard({ funnel, isExpanded, toggleFunnel, isLatestTask, isSendback, isBlue }) {
  // Determine the status color
  let statusColor = 'bg-gray-100 text-gray-800'; // Default
  
  if (funnel.status === 'completed') {
    statusColor = 'bg-green-100 text-green-800';
  } else if (funnel.status === 'in-progress') {
    statusColor = 'bg-blue-100 text-blue-800';
  } else if (funnel.status === 'sendback' || isSendback) {
    statusColor = 'bg-red-100 text-red-800';
  } else if (isLatestTask) {
    statusColor = 'bg-yellow-100 text-yellow-800';
  }

  // Determine background color for the card header
  let headerBgColor = isBlue ? 'bg-blue-50' : 'bg-white';
  if (isLatestTask) {
    headerBgColor = 'bg-yellow-50';
  } else if (isSendback) {
    headerBgColor = 'bg-red-50';
  }

  // Extract targetTaskId from the first task if this is a sendback funnel
  const targetTaskId = isSendback && funnel.tasks && funnel.tasks.length > 0 
    ? funnel.tasks[0].targetTaskId 
    : null;

  return (
    <div className={`rounded-lg shadow overflow-hidden ${isBlue ? 'border border-blue-200' : ''}`}>
      <div 
        className={`px-4 py-5 sm:px-6 flex flex-col cursor-pointer ${headerBgColor}`}
        onClick={toggleFunnel}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
              {isLatestTask ? 'Latest' : isSendback ? 'Sendback' : funnel.status}
            </span>
            <div>
              <span className="text-lg font-medium text-gray-900">{funnel.name}</span>
              {/* Always show funnel duration if it exists, regardless of value */}
              {funnel.funnelDuration !== undefined && (
                <span className="ml-2 text-sm text-gray-500">
                  ({formatDuration(funnel.funnelDuration)})
                </span>
              )}
            </div>
            {!isLatestTask && !isSendback && (
              <span className="text-sm text-gray-500">{funnel.progress}</span>
            )}
          </div>
          <div className="flex items-center">
            <svg 
              className={`h-5 w-5 text-gray-500 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        
        {/* Display targetTaskId for sendback cards */}
        {isSendback && (
          <div className="mt-2 text-sm text-gray-700">
            <span className="font-medium">Target Task ID:</span> {targetTaskId || 'Unknown'}
          </div>
        )}
      </div>
      
      {isExpanded && (
        <div className="px-4 py-5 sm:px-6 border-t border-gray-200 bg-white">
          <TaskGroup tasks={funnel.tasks} isSendback={isSendback} />
        </div>
      )}
    </div>
  );
}

// Helper function to format duration
function formatDuration(seconds) {
  if (seconds === undefined || seconds === null || seconds === 0) {
    return '0 sec';
  }
  
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
  
  const hours = Math.floor(seconds / 3600);
  const remainingMinutes = Math.floor((seconds % 3600) / 60);
  return remainingMinutes > 0 
    ? `${hours} hr ${remainingMinutes} min` 
    : `${hours} hr`;
}

export default FunnelCard;