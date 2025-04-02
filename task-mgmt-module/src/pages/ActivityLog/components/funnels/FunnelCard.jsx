import React, { useState, useRef, useEffect } from 'react';
import StatusTimeline from './StatusTimeline';
import { getStatusColor, formatDuration } from '../../utils/formatters';
import TaskGroup from './TaskGroup';
import { createPortal } from 'react-dom';

// SendbackCard Component
const SendbackCard = ({ funnel, isExpanded, toggleFunnel, navigateToActorDashboard }) => {
  const firstTask = funnel?.tasks?.[0];
  const sourceLoanStage = firstTask?.sourceLoanStage || 'N/A';
  const sourceSubModule = firstTask?.sourceSubModule || 'N/A';
  const reason = funnel.sendbackReason || 'Unknown';
  const targetTaskId = firstTask?.targetTaskId || 'N/A';
  
  // Format reason for display
  const formattedReason = reason
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  // Get the most recent status
  const mostRecentStatus = funnel.tasks?.flatMap(task => 
    task.statusHistory || []
  )?.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))?.[0]?.status || 'UNKNOWN';

  // Group handlers with their corresponding actorIds
  const handlersWithActorIds = funnel.tasks?.reduce((acc, task) => {
    if (task.handledBy && !acc.some(h => h.email === task.handledBy)) {
      acc.push({
        email: task.handledBy,
        actorId: task.actorId
      });
    }
    return acc;
  }, []) || [];

  // Combine all status histories for timeline
  const sendbackStatusHistory = funnel.tasks?.flatMap(task => 
    task.statusHistory?.map(status => ({
      ...status,
      handledBy: task.handledBy,
      taskId: task.id
    })) || []
  ).sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt)) || [];

  return (
    <div className="rounded-lg shadow overflow-hidden">
      <div className="px-4 py-5 sm:px-6 bg-pink-50">
        {/* Header with sendback badge and reason */}
        <div className="flex items-center space-x-3 mb-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Sendback
          </span>
          <span className="text-lg font-medium text-gray-900">
            {formattedReason}
          </span>
        </div>

        {/* Info with right-aligned status */}
        <div className="flex justify-between mb-2">
          <div className="space-y-1">
            <div>
              <span className="font-medium">Target Task Id: </span>
              <span className="text-gray-800">{targetTaskId}</span>
            </div>
            <div>
              <span className="font-medium">Source Stage: </span>
              <span className="text-gray-800">{sourceLoanStage}</span>
            </div>
            <div>
              <span className="font-medium">Source Module: </span>
              <span className="text-gray-800">{sourceSubModule}</span>
            </div>
          </div>
          
          <div className="text-right space-y-1">
            <div>
              <span className="font-medium">Status: </span>
              <span className={getStatusColor(mostRecentStatus)}>
                {mostRecentStatus}
              </span>
            </div>
            <div>
              <span className="font-medium">Handled by: </span>
              {handlersWithActorIds.map((handler, index) => (
                <React.Fragment key={index}>
                  {index > 0 && ', '}
                  <span 
                    className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                    onClick={() => navigateToActorDashboard(handler.actorId)}
                  >
                    {handler.email}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Hide/Show Details button */}
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

      {/* Sendback History with timeline when expanded */}
      {isExpanded && (
        <div className="px-4 py-5 sm:px-6 border-t border-pink-200 bg-white">
          <div className="mb-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Sendback
            </span>
            <span className="ml-2 text-gray-900 font-medium">Sendback Timeline</span>
          </div>
          {sendbackStatusHistory.length > 0 ? (
            <StatusTimeline statusHistory={sendbackStatusHistory} />
          ) : (
            <div className="text-gray-500 text-sm italic">No status history available</div>
          )}
        </div>
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
  setExpandedTasks,
  navigateToActorDashboard
}) => {
  const headerBgColor = isLatestTask ? 'bg-yellow-50' : isBlue ? 'bg-blue-50' : 'bg-white';
  const statusColor = isLatestTask ? 'bg-yellow-100 text-yellow-800' : 
                     funnel.status === 'completed' ? 'bg-green-100 text-green-800' : 
                     funnel.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 
                     'bg-gray-100 text-gray-800';

  // Group handlers with their corresponding actorIds
  const handlersWithActorIds = funnel.tasks?.reduce((acc, task) => {
    if (task.handledBy && !acc.some(h => h.email === task.handledBy)) {
      acc.push({
        email: task.handledBy,
        actorId: task.actorId
      });
    }
    return acc;
  }, []) || [];

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
            navigateToActorDashboard={navigateToActorDashboard}
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
  setExpandedTasks,
  navigateToActorDashboard 
}) => {
  if (isSendback) {
    return <SendbackCard 
      funnel={funnel} 
      isExpanded={isExpanded} 
      toggleFunnel={toggleFunnel} 
      navigateToActorDashboard={navigateToActorDashboard}
    />;
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
      navigateToActorDashboard={navigateToActorDashboard}
    />
  );
};

export default FunnelCard; // new added code