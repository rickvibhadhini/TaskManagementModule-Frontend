
import React from 'react';
import StatusTimeline from './StatusTimeline';
import { getStatusColor } from '../../utils/formatters';

function TaskGroup({ task, isExpanded, onToggle }) {
  const formattedCreatedAt = new Date(task.createdAt).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
  
  return (
    <div className="bg-white">
      {/* Task Header */}
      <div 
        className="px-6 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50"
        onClick={onToggle}
      >
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
              ▶
            </span>
            <h4 className="font-medium text-gray-800">{task.name}</h4>
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
              getStatusColor(task.currentStatus)
            }`}>
              {task.currentStatus}
            </span>
          </div>
          <div className="mt-1 text-sm text-gray-500">
            Created: {formattedCreatedAt} | Handled by: {task.handledBy}
          </div>
        </div>
      </div>
      
      {/* Status Timeline */}
      {isExpanded && (
        <div className="px-10 py-3 bg-gray-50">
          <StatusTimeline statusHistory={task.statusHistory} />
        </div>
      )}
    </div>
  );
}

export default TaskGroup;