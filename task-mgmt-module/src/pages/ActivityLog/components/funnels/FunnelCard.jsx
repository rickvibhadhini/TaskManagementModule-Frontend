import React, { useState, useRef, useEffect } from 'react';
import StatusTimeline from './StatusTimeline';
import { getStatusColor, formatDuration } from '../../utils/formatters';
import TaskGroup from './TaskGroup';
import { createPortal } from 'react-dom';

// SendbackCard Component
const SendbackCard = ({ funnel, isExpanded, toggleFunnel, navigateToActorDashboard }) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const tooltipRef = useRef(null);
  const triggerRef = useRef(null);
  
  const firstTask = funnel?.tasks?.[0];
  const sourceLoanStage = firstTask?.sourceLoanStage;
  const sourceSubModule = firstTask?.sourceSubModule;
  const targetTaskId = firstTask?.targetTaskId;
  
  const getTruncatedId = (id) => {
    if (!id) return '';
    return id.slice(-6);
  };
  
  const getRequestId = () => {
    const match = funnel.name.match(/Sendbacks for (.+)$/);
    return match ? match[1] : '';
  };
  
  const requestId = getRequestId();
  const truncatedId = getTruncatedId(requestId);
  
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

  const sendbackStatusHistory = funnel.tasks?.flatMap(task => 
    task.statusHistory?.map(status => ({
      ...status,
      handledBy: task.handledBy,
      taskId: task.id
    })) || []
  ).sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt)) || [];

  useEffect(() => {
    if (tooltipVisible && tooltipRef.current && triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      tooltipRef.current.style.top = `${triggerRect.top - tooltipRect.height - 10}px`;
      tooltipRef.current.style.left = `${triggerRect.left - (tooltipRect.width / 2) + (triggerRect.width / 2)}px`;
    }
  }, [tooltipVisible]);

  return (
    <div className="rounded-lg shadow overflow-hidden max-w-4xl mx-auto">
      <div className="px-4 py-5 sm:px-5 bg-pink-50">
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

        <div className="flex justify-between items-start text-sm text-gray-600">
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
              {/* Make handlers clickable with their actorIds */}
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

      {isExpanded && sendbackStatusHistory.length > 0 && (
        <div className="px-4 py-5 sm:px-5 border-t border-pink-200 bg-white">
          <StatusTimeline statusHistory={sendbackStatusHistory} />
        </div>
      )}
      
      {tooltipVisible && createPortal(
        <div 
          ref={tooltipRef}
          className="fixed z-50 bg-white border border-gray-300 rounded shadow-lg p-3 text-sm pointer-events-none"
          style={{
            maxWidth: '300px',
            minWidth: '200px',
            transition: 'none'
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
  setExpandedTasks,
  navigateToActorDashboard
}) => {
  const headerBgColor = isLatestTask ? 'bg-yellow-50' : isBlue ? 'bg-blue-50' : 'bg-white';
  const statusColor = isLatestTask ? 'bg-yellow-100 text-yellow-800' : 
                     funnel.status === 'completed' ? 'bg-green-100 text-green-800' : 
                     funnel.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 
                     'bg-gray-100 text-gray-800';

  return (
    <div id={`funnel-${funnel.id}`} className={`rounded-lg shadow overflow-hidden max-w-4xl mx-auto ${isBlue ? 'border border-blue-200' : ''}`}>
      <div className={`px-4 py-5 sm:px-5 ${headerBgColor}`}>
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

      {isExpanded && (
        <div className="px-4 py-5 sm:px-5 border-t border-gray-200 bg-white">
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

export default FunnelCard;