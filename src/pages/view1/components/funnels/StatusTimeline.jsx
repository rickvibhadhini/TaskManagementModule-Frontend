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

  // Determine how many items per row (adjust as needed)
  const itemsPerRow = 5;

  // Group status history into rows
  const rows = [];
  for (let i = 0; i < statusHistory.length; i += itemsPerRow) {
    rows.push(statusHistory.slice(i, i + itemsPerRow));
  }

  return (
    <div className="relative">
      {rows.map((row, rowIndex) => {
        const isLastRow = rowIndex === rows.length - 1;
        // Always display items left to right chronologically
        const isRightToLeft = false;

        return (
          <div key={rowIndex} className="relative mb-6">
            {/* Horizontal line */}
            <div className="absolute top-2 left-0 right-0 h-0.5 bg-gray-200"></div>

            {/* Horizontal line arrow at the end */}
            <div
              className="absolute top-[7px] right-0 w-0 h-0 
                        border-t-[2px] border-t-transparent 
                        border-l-[4px] border-l-gray-200 
                        border-b-[2px] border-b-transparent"
            ></div>

            {/* Status items */}
            <div className="flex flex-row justify-between relative">
              {row.map((status, index) => {
                const originalIndex = rowIndex * itemsPerRow + index;

                const formattedTime = new Date(status.updatedAt).toLocaleString(
                  'en-US',
                  {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true,
                  }
                );

                return (
                  <div
                    key={originalIndex}
                    className="flex flex-col items-center px-2"
                    style={{ width: `${100 / itemsPerRow}%` }}
                  >
                    {/* Status dot */}
                    <div
                      className={`z-10 w-4 h-4 rounded-full flex items-center justify-center ${
                        getStatusDotColor(status.status)
                      }`}
                    >
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>

                    {/* Status content */}
                    <div className="mt-1 text-center">
                      <div className="font-medium text-sm text-gray-900">
                        {status.status}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formattedTime}
                      </div>

                      {/* Duration to next status */}
                      {timelineDurations[originalIndex] && (
                        <div className="mt-0.5 text-xs text-gray-400 italic">
                          {timelineDurations[originalIndex]}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default StatusTimeline;