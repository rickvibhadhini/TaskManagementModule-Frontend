import React from 'react';
import { getStatusDotColor } from '../../utils/formatters';
import { formatDuration } from '../../utils/formatters';
function StatusTimeline({ statusHistory }) {
  if (!statusHistory || statusHistory.length === 0) {
    return <div className="text-gray-500 text-sm italic">No status history available</div>;
  }
  // Merge consecutive statuses of the same type
  const mergedStatusHistory = statusHistory.reduce((merged, currentStatus, index) => {
    // Always include the first status
    if (index === 0) {
      merged.push(currentStatus);
      return merged;
    }
    const lastMergedStatus = merged[merged.length - 1];
    // Check if current status is the same as the last merged status
    if (currentStatus.status === lastMergedStatus.status) {
      // For "completed" status, use the last timestamp
      if (currentStatus.status === "completed") {
        merged[merged.length - 1] = {
          ...lastMergedStatus,
          updatedAt: currentStatus.updatedAt // Use the latest timestamp for completed status
        };
      }
      // For other statuses (todo, in_progress), keep the first timestamp (do nothing)
    } else {
      // If different status, add to merged array
      merged.push(currentStatus);
    }
    return merged;
  }, []);
  return (
    <div className="w-full overflow-x-auto py-3">
      <div className="flex items-start gap-y-6 min-w-max mx-auto justify-center">
        {mergedStatusHistory.map((status, index) => {
          const isLast = index === mergedStatusHistory.length - 1;
          // Format the timestamp using the same pattern as in the image
          const date = new Date(status.updatedAt);
          const formattedTime = `${date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric'
          })}, ${date.toLocaleString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
          })}`;
          return (
            <React.Fragment key={index}>
              {/* Status node */}
              <div className="flex flex-col items-center" style={{ width: '100px' }}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${getStatusDotColor(status.status)}`}>
                  <div className="w-3.5 h-3.5 rounded-full bg-white"></div>
                </div>
                <div className="mt-1.5 text-center">
                  <div className="font-medium text-xs text-gray-900">{status.status.replace(/_/g, ' ')}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{formattedTime}</div>
                </div>
              </div>
              {/* Arrow and duration */}
              {!isLast && (
                <div className="flex flex-col items-center" style={{ width: '60px' }}>
                  <div className="flex items-center h-7">
                    <div className="w-12 h-0.5 bg-gray-300"></div>
                    <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] border-l-gray-300 border-b-[4px] border-b-transparent">
                    </div>
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1 text-center">
                    {(() => {
                      // Get the duration in milliseconds
                      const currentTime = new Date(status.updatedAt).getTime();
                      const nextTime = new Date(mergedStatusHistory[index + 1].updatedAt).getTime();
                      const durationMs = nextTime - currentTime;
                      // Use the formatDuration function
                      return formatDuration(durationMs);
                    })()}
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
export default StatusTimeline;