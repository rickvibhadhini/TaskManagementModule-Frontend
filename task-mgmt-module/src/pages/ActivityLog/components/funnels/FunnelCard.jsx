import React, { useState, useRef, useEffect } from 'react';
import StatusTimeline from './StatusTimeline';
import { getStatusColor, formatDuration } from '../../utils/formatters';
import TaskGroup from './TaskGroup';
import { createPortal } from 'react-dom';

// SendbackCard Component
const SendbackCard = ({ funnel, isExpanded, toggleFunnel }) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const tooltipRef = useRef(null);
  const triggerRef = useRef(null);
  
  const firstTask = funnel?.tasks?.[0];
  const sourceLoanStage = firstTask?.sourceLoanStage;
  const sourceSubModule = firstTask?.sourceSubModule;
  const targetTaskId = firstTask?.targetTaskId;
  
  // Function to get the last 6 characters of a string
  const getTruncatedId = (id) => {
    if (!id) return '';
    return id.slice(-6);
  };
  
  // Function to extract request ID from funnel name
  const getRequestId = () => {
    // Assuming the funnel name is in format "Sendbacks for {request_id}"
    const match = funnel.name.match(/Sendbacks for (.+)$/);
    return match ? match[1] : '';
  };
  
  const requestId = getRequestId();
  const truncatedId = getTruncatedId(requestId);
  
  // Get the most recent status from status history
  const mostRecentStatus = funnel.tasks?.flatMap(task => 
    task.statusHistory || []
  )?.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))?.[0]?.status || 'UNKNOWN';

  // Get unique handlers
  const handlers = [...new Set(funnel.tasks?.map(task => task.handledBy) || [])].filter(Boolean).join(', ') || 'N/A';

  // Combine all status histories for timeline
  const sendbackStatusHistory = funnel.tasks?.flatMap(task => 
    task.statusHistory?.map(status => ({
      ...status,
      handledBy: task.handledBy,
      taskId: task.id
    })) || []
  ).sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt)) || [];

  // Position the tooltip when it becomes visible
  useEffect(() => {
    if (tooltipVisible && tooltipRef.current && triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      // Position tooltip above the trigger element
      tooltipRef.current.style.top = `${triggerRect.top - tooltipRect.height - 10}px`;
      tooltipRef.current.style.left = `${triggerRect.left - (tooltipRect.width / 2) + (triggerRect.width / 2)}px`;
    }
  }, [tooltipVisible]);

  return (
    <div className="rounded-lg shadow overflow-hidden">
      <div className="px-4 py-5 sm:px-6 bg-pink-50">
        {/* Header with status badge and name */}
        <div className="flex items-center space-x-3 mb-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Sendback
          </span>
          <span className="text-lg font-medium text-gray-900">
            Sendback request Id: {' '}
            <span 
              ref={triggerRef}
              className="cursor-help relative"
              onMouseEnter={() => setTooltipVisible(true)}
              onMouseLeave={() => setTooltipVisible(false)}
            >
              {truncatedId}
            </span>
          </span>
        </div>

        {/* Source and Target Information Row */}
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

          {/* Right side - Target and Status information */}
          <div className="text-right space-y-1">
            <div>
              <span className="font-medium">Target Task: </span>
              <span className="text-gray-800">{targetTaskId || 'N/A'}</span>
            </div>
            <div>
              <span className="font-medium">Status: </span>
              <span className={getStatusColor(mostRecentStatus)}>
                {mostRecentStatus}
              </span>
            </div>
            <div>
              <span className="font-medium">Handled by: </span>
              <span className="text-gray-800">{handlers}</span>
            </div>
          </div>
        </div>

        {/* Show Timeline button */}
        <div 
          className="cursor-pointer flex items-center justify-end mt-2"
          onClick={toggleFunnel}
        >
          <span className="text-sm text-blue-600">
            {isExpanded ? 'Hide Timeline' : 'Show Timeline'}
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

      {/* Timeline directly in SendbackCard */}
      {isExpanded && sendbackStatusHistory.length > 0 && (
        <div className="px-4 py-5 sm:px-6 border-t border-pink-200 bg-white">
          <StatusTimeline statusHistory={sendbackStatusHistory} />
        </div>
      )}
      
      {/* Portal for tooltip to avoid layout issues */}
      {tooltipVisible && createPortal(
        <div 
          ref={tooltipRef}
          className="fixed z-50 bg-white border border-gray-300 rounded shadow-lg p-3 text-sm pointer-events-none"
          style={{
            maxWidth: '300px',
            minWidth: '200px',
            transition: 'none' // Disable transitions to prevent jitter
          }}
        >
          <div className="font-medium">Full Request ID:</div>
          <div className="break-all">{requestId}</div>
        </div>,
        document.body
      )}
    </div>
  );
};

// RegularFunnelCard Component
const RegularFunnelCard = ({ 
  funnel, 
  isExpanded, 
  toggleFunnel, 
  isLatestTask, 
  isBlue, 
  sendbackMap,
  expandedTasks,
  setExpandedTasks
}) => {
  const headerBgColor = isLatestTask ? 'bg-yellow-50' : isBlue ? 'bg-blue-50' : 'bg-white';
  const statusColor = isLatestTask ? 'bg-yellow-100 text-yellow-800' : 
                     funnel.status === 'completed' ? 'bg-green-100 text-green-800' : 
                     funnel.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 
                     'bg-gray-100 text-gray-800';

  return (
    <div id={`funnel-${funnel.id}`} className={`rounded-lg shadow overflow-hidden ${isBlue ? 'border border-blue-200' : ''}`}>
      <div className={`px-4 py-5 sm:px-6 ${headerBgColor}`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
              {isLatestTask ? 'Latest' : funnel.status}
            </span>
            <span className="text-lg font-medium text-gray-900">{funnel.name}</span>
          </div>
          
          {funnel.funnelDuration !== undefined && (
            <div className="text-sm text-gray-500">
              <span className="font-medium">Duration: </span>
              {formatDuration(funnel.funnelDuration)}
            </div>
          )}
        </div>

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
          <TaskGroup 
            tasks={funnel.tasks} 
            isSendback={false} 
            sendbackMap={sendbackMap}
            expandedTasks={expandedTasks}
            setExpandedTasks={setExpandedTasks}
          />
        </div>
      )}
    </div>
  );
};

// Main FunnelCard Component
const FunnelCard = ({ 
  funnel, 
  isExpanded, 
  toggleFunnel, 
  isLatestTask, 
  isSendback, 
  isBlue, 
  sendbackMap,
  expandedTasks,
  setExpandedTasks 
}) => {
  if (isSendback) {
    return <SendbackCard funnel={funnel} isExpanded={isExpanded} toggleFunnel={toggleFunnel} />;
  }
  
  return (
    <RegularFunnelCard 
      funnel={funnel} 
      isExpanded={isExpanded} 
      toggleFunnel={toggleFunnel}
      isLatestTask={isLatestTask}
      isBlue={isBlue}
      sendbackMap={sendbackMap}
      expandedTasks={expandedTasks}
      setExpandedTasks={setExpandedTasks}
    />
  );
};

export default FunnelCard;