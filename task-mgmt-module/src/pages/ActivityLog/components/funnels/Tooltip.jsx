import React, { useMemo } from 'react';
import { format } from 'date-fns';

const TaskTooltip = ({ hoveredTask, tooltipPosition, onClose }) => {
  // Calculate correct start/end times for the tooltip display
  const taskTimes = useMemo(() => {
    if (!hoveredTask || !hoveredTask.segments || !Array.isArray(hoveredTask.segments)) {
      return { startTime: null, endTime: null };
    }

    // Find first TODO or IN_PROGRESS segment
    const firstTodoSegment = hoveredTask.segments.find(seg => seg && seg.status === 'TODO');
    const firstInProgressSegment = hoveredTask.segments.find(seg => seg && seg.status === 'IN_PROGRESS');
    
    // Use the earliest available time from TODO or IN_PROGRESS
    let startSegment = null;
    if (firstTodoSegment && firstInProgressSegment) {
      startSegment = firstTodoSegment.startTime <= firstInProgressSegment.startTime ? 
                     firstTodoSegment : firstInProgressSegment;
    } else {
      startSegment = firstTodoSegment || firstInProgressSegment;
    }
    
    // Find the last COMPLETED segment
    const lastCompletedSegment = [...hoveredTask.segments]
      .reverse()
      .find(seg => seg && seg.status === 'COMPLETED');

    return {
      startTime: startSegment ? startSegment.startTime : null,
      endTime: lastCompletedSegment ? lastCompletedSegment.endTime : null
    };
  }, [hoveredTask]);

  // Format date for readable display
  const formatTime = (date) => {
    if (!date) return 'N/A';
    try {
      return format(date, 'yyyy-MM-dd HH:mm:ss.SSS');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Calculate position to ensure tooltip stays in viewport
  const tooltipStyle = {
    left: `${tooltipPosition.x}px`,
    top: `${tooltipPosition.y - 10}px`,
    maxWidth: '400px',
    transform: 'translate(-50%, -100%)'
  };

  if (!hoveredTask) return null;

  return (
    <div 
      className="fixed z-50 bg-white border border-gray-200 shadow-xl rounded-md p-4 text-sm"
      style={tooltipStyle}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-800 text-base">
          {hoveredTask.id}
        </h3>
        <button 
          className="text-gray-400 hover:text-gray-600" 
          onClick={onClose}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        <div className="text-gray-500">Funnel</div>
        <div className="font-medium text-gray-700">{hoveredTask.funnel || 'N/A'}</div>

        <div className="text-gray-500">Status</div>
        <div className="font-medium text-gray-700">
          {hoveredTask.finalStatus?.status || hoveredTask.currentSegment?.status || 'N/A'}
        </div>

        <div className="text-gray-500">Start Time</div>
        <div className="font-medium text-gray-700">
          {formatTime(taskTimes.startTime)}
        </div>

        <div className="text-gray-500">End Time</div>
        <div className="font-medium text-gray-700">
          {formatTime(taskTimes.endTime)}
        </div>

        {hoveredTask.originalTaskId === 'sendback' && (
          <>
            <div className="text-gray-500">Target Task</div>
            <div className="font-medium text-gray-700">{hoveredTask.targetTaskId || 'N/A'}</div>
            
            <div className="text-gray-500">Source Stage</div>
            <div className="font-medium text-gray-700">{hoveredTask.sourceLoanStage || 'N/A'}</div>
          </>
        )}

        {hoveredTask.hasCycles && (
          <>
            <div className="text-gray-500">Cycle</div>
            <div className="font-medium text-gray-700">
              {(hoveredTask.instanceIndex || 0) + 1} of {hoveredTask.instances?.length || 0}
            </div>
          </>
        )}
      </div>

      <div className="absolute w-4 h-4 rotate-45 bg-white border-b border-r border-gray-200" 
           style={{ bottom: '-8px', left: '50%', marginLeft: '-4px' }}>
      </div>
    </div>
  );
};

export default TaskTooltip;