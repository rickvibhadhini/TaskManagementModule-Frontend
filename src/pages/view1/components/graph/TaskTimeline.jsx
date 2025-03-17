import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { funnelColors, statusColors } from '../../utils/Ganntutils';
import TaskTooltip from './TaskTooltip';

const TaskTimeline = ({ funnels, tasksByFunnel, timeRange }) => {
  const [hoveredTask, setHoveredTask] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isPinned, setIsPinned] = useState(false);

  const getSegmentPosition = (segment, timeRange) => {
    if (!timeRange.start || !timeRange.end) return { left: 0, width: 0 };

    const totalDuration = timeRange.end - timeRange.start;
    const segmentStart = segment.startTime - timeRange.start;
    const segmentDuration = segment.endTime - segment.startTime;

    const left = (segmentStart / totalDuration) * 100;
    const width = (segmentDuration / totalDuration) * 100;

    return { left: `${left}%`, width: `${Math.max(width, 0.5)}%` };
  };

  const handleTaskClick = (e, task, segment) => {
    e.stopPropagation(); // Prevent event bubbling
    if (hoveredTask && hoveredTask.id === task.id && hoveredTask.funnel === task.funnel && isPinned) {
      // If the same task is clicked and it's pinned, close the tooltip
      setHoveredTask(null);
      setIsPinned(false);
    } else {
      // Otherwise, show the tooltip and pin it
      setHoveredTask({ ...task, currentSegment: segment });
      setTooltipPosition({ x: e.clientX, y: e.clientY });
      setIsPinned(true);
    }
  };

  const handleTaskMouseEnter = (e, task, segment) => {
    if (!isPinned) {
      setHoveredTask({ ...task, currentSegment: segment });
      setTooltipPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleTaskMouseLeave = () => {
    if (!isPinned) {
      setHoveredTask(null);
    }
  };

  const handleTooltipClose = () => {
    setHoveredTask(null);
    setIsPinned(false);
  };

  return (
    <div className="flex" style={{ borderTop: '1px solid #e5e7eb' }}>
      {/* Left sidebar for task names */}
      <div className="w-48 flex-shrink-0 border-r border-gray-200">
        {/* Empty row to align with time axis header */}
        <div className="h-10 bg-gray-50 border-b border-gray-200"></div>
        
        {funnels.map((funnel, funnelIdx) => {
          const funnelTasks = tasksByFunnel[funnel] || [];
          return (
            <div key={funnelIdx}>
              <div className="py-2 px-3 font-medium bg-gray-50 border-b border-gray-200 flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: funnelColors[funnel] || '#95a5a6' }}
                ></div>
                <span className="text-gray-700">{funnel}</span>
              </div>

              {funnelTasks.map((task, idx) => (
                <div key={idx} className="border-b border-gray-100">
                  <div className="h-10 flex items-center px-3">
                    <span
                      className="text-sm truncate cursor-pointer"
                      onClick={(e) => handleTaskClick(e, task, task.segments[0])}
                      onMouseEnter={(e) => handleTaskMouseEnter(e, task, task.segments[0])}
                      onMouseLeave={handleTaskMouseLeave}
                    >
                      {task.id}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Main timeline graph */}
      <div className="flex-1 overflow-x-auto relative">
        {/* Vertical grid lines */}
        {timeRange.start && timeRange.end && Array.from({ length: 11 }).map((_, i) => {
          const position = `${(i / 10) * 100}%`;

          return (
            <div
              key={`grid-line-${i}`}
              className="absolute top-0 bottom-0 border-l border-gray-300"
              style={{
                left: position,
                height: '100%',
                zIndex: 1
              }}
            ></div>
          );
        })}

        {/* Time axis header */}
        <div className="border-b border-gray-200 py-2 relative h-10 bg-gray-50">
          {timeRange.start && timeRange.end && Array.from({ length: 11 }).map((_, i) => {
            const position = `${(i / 10) * 100}%`;
            const tickTime = new Date(timeRange.start.getTime() + ((timeRange.end - timeRange.start) * (i / 10)));

            return (
              <div
                key={i}
                className="absolute top-0 h-full flex items-center justify-center"
                style={{ left: position, width: '10%' }}
              >
                <div className="text-xs text-gray-500">
                  {format(tickTime, 'HH:mm:ss')}
                </div>
              </div>
            );
          })}
        </div>

        {/* Funnel timelines */}
        <div className="relative">
          {funnels.map((funnel, funnelIdx) => {
            const funnelTasks = tasksByFunnel[funnel] || [];
            const funnelColor = funnelColors[funnel] || '#95a5a6';

            return (
              <div key={funnelIdx} className="relative">
                {/* Funnel header - just an empty space with border */}
                <div className="h-10 border-b border-gray-200"></div>

                {/* Task rows */}
                {funnelTasks.map((task, idx) => {
                  // Sort segments by start time for connector lines
                  const sortedSegments = [...task.segments].sort((a, b) => a.startTime - b.startTime);
                  
                  return (
                    <div
                      key={idx}
                      className="relative border-b border-gray-100"
                      id={`task-row-${funnel}-${idx}`}
                    >
                      <div className="h-10 relative">
                        {/* Connector lines */}
                        {sortedSegments.length > 1 && sortedSegments.slice(0, -1).map((segment, segIdx) => {
                          const nextSegment = sortedSegments[segIdx + 1];
                          const currentPos = getSegmentPosition(segment, timeRange);
                          const nextPos = getSegmentPosition(nextSegment, timeRange);
                          
                          const currentLeft = parseFloat(currentPos.left);
                          const currentWidth = parseFloat(currentPos.width);
                          const nextLeft = parseFloat(nextPos.left);
                          
                          return (
                            <div
                              key={`connector-${task.id}-${segIdx}`}
                              className="absolute border-t-2 border-dashed border-gray-400"
                              style={{
                                left: `calc(${currentLeft}% + ${currentWidth}%)`,
                                width: `calc(${nextLeft}% - ${currentLeft}% - ${currentWidth}%)`,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                zIndex: 5
                              }}
                            />
                          );
                        })}
                        
                        {/* Task segments */}
                        {task.segments.map((segment, segmentIdx) => {
                          const position = getSegmentPosition(segment, timeRange);
                          const statusColor = statusColors[segment.status] || '#6B7280';

                          return (
                            <div
                              key={segmentIdx}
                              className="absolute task-segment"
                              style={{
                                left: position.left,
                                width: position.width,
                                zIndex: 10,
                                top: '50%',
                                transform: 'translateY(-50%)',
                              }}
                              data-task-id={`${funnel}-${task.id}-${segmentIdx}`}
                              onClick={(e) => handleTaskClick(e, task, segment)}
                              onMouseEnter={(e) => handleTaskMouseEnter(e, task, segment)}
                              onMouseLeave={handleTaskMouseLeave}
                            >
                              <div
                                className="h-2 rounded w-full"
                                style={{ backgroundColor: funnelColor }}
                              ></div>

                              <div
                                className="absolute right-0 w-3 h-3 rounded-full border-2 border-white shadow-sm transform translate-x-1.5 top-1/2 -translate-y-1/2"
                                style={{ backgroundColor: statusColor }}
                              ></div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* Tooltip Component */}
          <TaskTooltip
            hoveredTask={hoveredTask}
            tooltipPosition={tooltipPosition}
            onClose={handleTooltipClose}
          />
        </div>
      </div>
    </div>
  );
};

export default TaskTimeline;