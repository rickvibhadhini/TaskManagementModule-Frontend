
import React from 'react';
import { getStatusDotColor } from '../../utils/formatters';
import { formatDuration } from '../../utils/dateUtils';

function StatusTimeline({ statusHistory }) {
  // Calculate time differences between status changes
  const timelineDurations = statusHistory.map((status, index) => {
    if (index === statusHistory.length - 1) {
      return null; // No duration for the last item
    }
    
    const currentTime = new Date(status.updatedAt).getTime();
    const nextTime = new Date(statusHistory[index + 1].updatedAt).getTime();
    const durationMs = nextTime - currentTime;
    
    return formatDuration(durationMs);
  });
  
  return (
    <div className="relative pl-6 space-y-4">
      {/* Vertical line */}
      <div className="absolute top-0 bottom-0 left-2.5 w-0.5 bg-gray-200"></div>
      
      {statusHistory.map((status, index) => {
        const formattedTime = new Date(status.updatedAt).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          hour12: true
        });
        
        return (
          <div key={index} className="relative">
            {/* Status dot */}
            <div className={`absolute -left-6 mt-1.5 w-5 h-5 rounded-full flex items-center justify-center ${
              getStatusDotColor(status.status)
            }`}>
              <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
            </div>
            
            {/* Status content */}
            <div>
              <div className="font-medium text-gray-900">{status.status}</div>
              <div className="text-sm text-gray-500">{formattedTime}</div>
              
              {/* Duration to next status */}
              {timelineDurations[index] && (
                <div className="mt-2 text-xs text-gray-400 italic">
                  {timelineDurations[index]}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default StatusTimeline;