import React from 'react';
import { getStatusDotColor } from '../../utils/formatters';
import { formatDuration } from '../../utils/dateUtils';

function StatusTimeline({ statusHistory }) {
  if (!statusHistory || statusHistory.length === 0) {
    return <div className="text-gray-500 text-sm italic">No status history available</div>;
  }

  return (
    <div className="w-full overflow-x-auto py-3">
      <div className="flex items-start gap-y-6 min-w-max mx-auto justify-center">
        {statusHistory.map((status, index) => {
          const isLast = index === statusHistory.length - 1;
          const formattedTime = new Date(status.updatedAt).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
          });

          // Calculate duration if not the last item
          let duration = null;
          if (!isLast) {
            const currentTime = new Date(status.updatedAt).getTime();
            const nextTime = new Date(statusHistory[index + 1].updatedAt).getTime();
            const durationMs = nextTime - currentTime;
            duration = formatDuration(durationMs);
          }

          return (
            <React.Fragment key={index}>
              {/* Status node */}
              <div className="flex flex-col items-center" style={{ width: '100px' }}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${getStatusDotColor(status.status)}`}>
                  <div className="w-3.5 h-3.5 rounded-full bg-white"></div>
                </div>
                <div className="mt-1.5 text-center">
                  <div className="font-medium text-xs text-gray-900">{status.status}</div>
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
                  {duration && (
                    <div className="text-[10px] text-gray-400 mt-1 text-center">
                      {duration}
                    </div>
                  )}
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