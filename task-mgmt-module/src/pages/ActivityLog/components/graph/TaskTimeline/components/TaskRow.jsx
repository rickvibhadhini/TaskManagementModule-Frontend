import React, { useMemo } from 'react';
import TaskSegment from './TaskSegment';
import { funnelColors } from '../../../../utils/Ganntutils';

const TaskRow = ({ 
  task, 
  funnel, 
  zoomLevel, 
  compactView,
  handleTaskClick,
  handleTaskMouseEnter,
  handleTaskMouseLeave,
  rowHeight
}) => {
  const funnelColor = funnelColors[funnel] || '#95a5a6';

  // Calculate task statistics (memoized)
  const taskStats = useMemo(() => {
    // Flatten all segments from all instances
    const allSegments = task.instances.flat();
    
    let fastestSegment = null;
    let slowestSegment = null;

    allSegments.forEach(segment => {
      const duration = segment.endTime - segment.startTime;
  
      if (!fastestSegment || duration < (fastestSegment.endTime - fastestSegment.startTime)) {
        fastestSegment = segment;
      }
  
      if (!slowestSegment || duration > (slowestSegment.endTime - slowestSegment.startTime)) {
        slowestSegment = segment;
      }
    });

    return {
      fastestSegment,
      slowestSegment,
      totalDuration: allSegments.reduce((total, segment) => {
        return total + (segment.endTime - segment.startTime);
      }, 0)
    };
  }, [task.instances]);

  // Helper function to get segment position
  const getSegmentPosition = (segment) => {
    return {
      left: segment.startPosition,
      width: segment.endPosition - segment.startPosition
    };
  };

  return (
    <div
      className={`relative border-b border-gray-100 task-row-${funnel}-${task.id}`}
      style={{ height: rowHeight }}
    >
      <div className="relative h-full">
        {/* Draw each instance on a single task row */}
        {task.instances.map((instanceSegments, instanceIdx) => {
          // Sort segments by start time
          const sortedSegments = [...instanceSegments].sort((a, b) => 
            a.startPosition - b.startPosition
          );
          
          // Draw dashed connectors between segments in an instance
          const connectors = sortedSegments.length > 1 ? sortedSegments.slice(0, -1).map((segment, segIdx) => {
            const nextSegment = sortedSegments[segIdx + 1];
            const currentPos = getSegmentPosition(segment);
            const nextPos = getSegmentPosition(nextSegment);
        
            const currentLeft = currentPos.left;
            const currentWidth = currentPos.width;
            const nextLeft = nextPos.left;
            
            // Only draw connector if there's a gap
            if (currentLeft + currentWidth < nextLeft) {
              return (
                <div
                  key={`connector-${task.id}-${instanceIdx}-${segIdx}`}
                  className="absolute border-t-2 border-dashed"
                  style={{
                    borderColor: 'rgba(156, 163, 175, 0.5)',
                    left: `${(currentLeft + currentWidth) * zoomLevel}px`,
                    width: `${(nextLeft - currentLeft - currentWidth) * zoomLevel}px`,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 5
                  }}
                />
              );
            }
            return null;
          }) : [];
          
          return (
            <React.Fragment key={`instance-${instanceIdx}`}>
              {connectors}
              
              {sortedSegments.map((segment, segmentIdx) => (
                <TaskSegment
                  key={`instance-${instanceIdx}-segment-${segmentIdx}`}
                  segment={segment}
                  task={task}
                  instanceIdx={instanceIdx}
                  segmentIdx={segmentIdx}
                  funnelColor={funnelColor}
                  zoomLevel={zoomLevel}
                  compactView={compactView}
                  taskStats={taskStats}
                  handleTaskClick={handleTaskClick}
                  handleTaskMouseEnter={handleTaskMouseEnter}
                  handleTaskMouseLeave={handleTaskMouseLeave}
                  className={`instance-${instanceIdx}-segment-${segmentIdx}`}
                />
              ))}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default TaskRow;