

import React from 'react';
import TaskGroup from './TaskGroup';
import { formatDuration, getStatusColor } from '../../utils/formatters';

function FunnelCard({ funnel, isExpanded, toggleFunnel, isLatestTask, isSendback, isBlue }) {
  // Extract sendback-related information with proper null checking
  const firstTask = funnel?.tasks?.[0];
  
  const sourceLoanStage = firstTask?.sourceLoanStage;
  const sourceSubModule = firstTask?.sourceSubModule;
  const targetTaskId = firstTask?.targetTaskId;

  // Determine background colors...
  let headerBgColor = isBlue ? 'bg-blue-50' : 'bg-white';
  if (isLatestTask) {
    headerBgColor = 'bg-yellow-50';
  } else if (isSendback) {
    headerBgColor = 'bg-pink-50';
  }

  let statusColor = 'bg-gray-100 text-gray-800';
  if (funnel.status === 'completed') {
    statusColor = 'bg-green-100 text-green-800';
  } else if (funnel.status === 'in-progress') {
    statusColor = 'bg-blue-100 text-blue-800';
  } else if (funnel.status === 'sendback' || isSendback) {
    statusColor = 'bg-red-100 text-red-800';
  } else if (isLatestTask) {
    statusColor = 'bg-yellow-100 text-yellow-800';
  }

  return (
    <div className={`rounded-lg shadow overflow-hidden ${isBlue ? 'border border-blue-200' : ''}`}>
      <div className={`px-4 py-5 sm:px-6 ${headerBgColor}`}>
        {/* Header with status badge and name */}
        <div className="flex items-center space-x-3 mb-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
            {isLatestTask ? 'Latest' : isSendback ? 'Sendback' : funnel.status}
          </span>
          <span className="text-lg font-medium text-gray-900">{funnel.name}</span>
        </div>

        {/* Source and Target Information Row */}
        {isSendback && (
          <div className="flex justify-between items-start text-sm text-gray-600">
            {/* Left side - Source information */}
            <div className="space-y-1">
              <div>
                <span className="font-medium">Source Stage: </span>
                <span className="text-gray-800">{sourceLoanStage || 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium">Source Module: </span>
                <span className="text-gray-800">{sourceSubModule || 'N/A'}</span>
              </div>
            </div>

            {/* Right side - Target information */}
            <div className="text-right">
              <div>
                <span className="font-medium">Target Task: </span>
                <span className="text-gray-800">{targetTaskId || 'N/A'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Duration - Only show for non-sendback tasks */}
        {!isSendback && funnel.funnelDuration !== undefined && (
          <div className="text-sm text-gray-500 mt-1">
            <span className="font-medium">Duration: </span>
            {formatDuration(funnel.funnelDuration)}
          </div>
        )}

        {/* Expand/Collapse button */}
        <div 
          className="cursor-pointer flex items-center justify-end mt-2"
          onClick={toggleFunnel}
        >
          <span className="text-sm text-blue-600">
            {isExpanded ? 'Hide Details' : 'Show Details'}
          </span>
          <svg 
            className={`h-5 w-5 ml-1 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 py-5 sm:px-6 border-t border-gray-200 bg-white">
          <TaskGroup tasks={funnel.tasks} isSendback={isSendback} />
        </div>
      )}
    </div>
  );
}

export default FunnelCard;