import React from 'react';
import { statusColors } from '../../../../utils/Ganntutils';

const TaskSegment = ({
  segment,
  task,
  instanceIdx,
  segmentIdx,
  funnelColor,
  zoomLevel,
  compactView,
  taskStats,
  handleTaskClick,
  handleTaskMouseEnter,
  handleTaskMouseLeave,
  className
}) => {
  // Format duration
  const formatDuration = (segment) => {
    const durationMs = segment.endTime - segment.startTime;
    const seconds = Math.floor(durationMs / 1000);

    if (seconds < 60) {
      return `${seconds}s`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    }
  };

  // Get segment position
  const getSegmentPosition = (segment) => {
    return {
      left: segment.startPosition,
      width: segment.endPosition - segment.startPosition
    };
  };

  const position = getSegmentPosition(segment);
  const statusColor = statusColors[segment.status] || '#6B7280';
  const width = position.width;
  const isHighlighted = segment === taskStats.slowestSegment || segment === taskStats.fastestSegment;
  
  // Segment styling
  let specialStyle = {};
  if (segment === taskStats.slowestSegment) {
    specialStyle = { 
      boxShadow: '0 0 0 2px rgba(220, 38, 38, 0.5)', 
      zIndex: 15 
    };
  } else if (segment === taskStats.fastestSegment) {
    specialStyle = { 
      boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.5)', 
      zIndex: 15 
    };
  }

  // Segment height based on compact view
  const segmentHeight = compactView ? 12 : 20;

  return (
    <div
      className={`absolute task-segment ${className} flex items-center rounded`}
      style={{
        left: `${position.left * zoomLevel}px`,
        width: `${position.width * zoomLevel}px`,
        height: segmentHeight,
        top: `calc(50% - ${segmentHeight / 2}px)`,
        backgroundColor: funnelColor,
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        zIndex: 10,
        ...specialStyle
      }}
      onClick={(e) => handleTaskClick(e, task, segment, instanceIdx)}
      onMouseEnter={(e) => handleTaskMouseEnter(e, task, segment, instanceIdx)}
      onMouseLeave={handleTaskMouseLeave}
    >
      {/* Display duration if segment is wide enough */}
      {!compactView && width * zoomLevel > 30 && (
        <span className="text-xs text-white truncate px-1.5">
          {formatDuration(segment)}
        </span>
      )}

      {/* Status indicator */}
      <div
        className="absolute right-0 top-0 transform -translate-y-1/2 translate-x-1/2"
        style={{ zIndex: 11 }}
      >
        <div
          className={`rounded-full border-2 border-white shadow-sm ${compactView ? 'w-2.5 h-2.5' : 'w-4 h-4'}`}
          style={{ backgroundColor: statusColor }}
          title={segment.status}
        ></div>
      </div>
  
      {/* Task indicators */}
      {!compactView && isHighlighted && width * zoomLevel > 30 && (
        <div className="absolute top-0 left-0 transform -translate-y-full -translate-x-1/2">
          <span className={`text-xs px-1 py-0.5 rounded ${
            segment === taskStats.slowestSegment ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
          }`}>
            {segment === taskStats.slowestSegment ? 'Slowest' : 'Fastest'}
          </span>
        </div>
      )}
      
      {/* Instance indicator for repeated instances */}
      {task.hasCycles && instanceIdx > 0 && segmentIdx === 0 && (
        <div className="absolute top-0 left-0 transform -translate-y-full">
          <span className="text-xs px-1 py-0.5 rounded bg-purple-100 text-purple-800">
            #{instanceIdx + 1}
          </span>
        </div>
      )}
    </div>
  );
};

export default TaskSegment;