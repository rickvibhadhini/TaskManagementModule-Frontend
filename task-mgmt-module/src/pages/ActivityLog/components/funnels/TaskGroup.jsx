import React, { useState } from 'react';
import StatusTimeline from './StatusTimeline';
import { getStatusDotColor, getStatusColor, formatDuration } from '../../utils/formatters';
import { FaCheckCircle } from 'react-icons/fa';
import Tooltip from './Tooltip';

function TaskGroup({ tasks, isSendback, sendbackMap = {}, expandedTasks = {}, setExpandedTasks, navigateToActorDashboard }) {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipTaskId, setTooltipTaskId] = useState(null);

  const toggleTaskTimeline = (taskId) => {
    if (setExpandedTasks) {
      setExpandedTasks(prev => ({
        ...prev,
        [taskId]: !prev[taskId]
      }));
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    // Primary sort by order field if available
    if (a?.order !== undefined && b?.order !== undefined) {
      return a.order - b.order;
    }
    
    // Fall back to createdAt
    if (a?.createdAt && b?.createdAt) {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
    if (a?.createdAt) return 1;
    if (b?.createdAt) return -1;
    return 0;
  });

  const sendbackStatusHistory = isSendback ? 
    sortedTasks.flatMap(task => 
      task.statusHistory && task.statusHistory.length > 0 
        ? task.statusHistory.map(status => ({
            ...status,
            handledBy: task.handledBy,
            taskId: task.id
          }))
        : [{
            status: task.currentStatus || 'UNKNOWN',
            updatedAt: task.updatedAt || task.createdAt || new Date().toISOString(),
            handledBy: task.handledBy,
            taskId: task.id
          }]
    ).sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt))
    : [];

  const showTooltip = (taskId, content) => {
    setTooltipVisible(true);
    setTooltipContent(content);
    setTooltipTaskId(taskId);
  };
  
  const hideTooltip = () => {
    setTooltipVisible(false);
    setTooltipContent('');
    setTooltipTaskId(null);
  };

  return (
    <div className="space-y-3">
      {isSendback ? (
        <div className="bg-pink-50 p-3 rounded-md">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <div className="flex items-center">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded mr-2">
                  Sendback
                </span>
                <span className="font-medium">Sendback History</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        sortedTasks.map((task, index) => (
          <div id={`task-${task?.id}`} key={task?.id || index} className="bg-gray-50 p-3 rounded-md relative">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                {/* Task name displayed in ALL CAPS */}
                <div className="font-medium uppercase">
                  {task?.name || 'Unknown Task'}
                </div>
                
                {/* Handled by information - now using actorId for click navigation */}
                <div className="text-sm text-gray-500 mt-1">
                  <span className="font-medium">Handled by: </span>
                  <span 
                    className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                    onClick={() => navigateToActorDashboard(task?.actorId)}
                  >
                    {task?.handledBy || 'N/A'}
                  </span>
                </div>
              </div>
              <div className="flex-1 flex justify-end">
                <div className="text-right">
                  <div className="text-sm mb-1">
                    <span className="font-medium">Status: </span>
                    <span className={getStatusColor(task?.currentStatus || 'UNKNOWN')}>
                      {task?.currentStatus || 'UNKNOWN'}
                    </span>
                  </div>
                  
                  {/* Dynamic sendback indicator based on sendbackMap */}
                  {task.id && sendbackMap[task.id] && (
                    <div 
                      className="relative flex items-center justify-end"
                      onMouseEnter={() => {
                        const sendbacks = Object.values(sendbackMap[task.id]);
                        const sendbackCount = sendbacks.length;
                        
                        // Create tooltip content showing all sendbacks
                        const tooltipText = sendbacks.map((info, index) => 
                          `Sendback ${sendbackCount > 1 ? (index + 1) + ': ' : ''}\nSource Loan Stage: ${info.sourceLoanStage || 'N/A'}\nSource Sub Module: ${info.sourceSubModule || 'N/A'}\nTime: ${new Date(info.updatedAt).toLocaleString()}`
                        ).join('\n\n');
                        
                        showTooltip(task.id, tooltipText);
                      }}
                      onMouseLeave={hideTooltip}
                    >
                      <span className="flex items-center text-gray-800 text-sm font-semibold">
                        <FaCheckCircle className="text-red-500 mr-1" />
                        Sendback Received 
                        {Object.keys(sendbackMap[task.id]).length > 1 ? 
                          ` (${Object.keys(sendbackMap[task.id]).length})` : ''}
                      </span>
                      {tooltipVisible && tooltipTaskId === task.id && (
                        <Tooltip content={tooltipContent} visible={true} />
                      )}
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-500 flex justify-end mb-1">
                    {task?.duration !== undefined && (
                      <span className="mr-4">
                        <span className="font-medium">Duration: </span>{formatDuration(task.duration)}
                      </span>
                    )}
                    {task?.sendbacks !== undefined && (
                      <span className="mr-4">
                        <span className="font-medium">Sendbacks: </span>{task.sendbacks}
                      </span>
                    )}
                    {task?.visited !== undefined && (
                      <span span className="mr-4">
                          <span className="font-medium">Retries: </span> {task.visited > 0 ? task.visited - 1 : task.visited}
                      </span>
                    )}
                  </div>
                  <div 
                    className="text-xs text-blue-600 flex items-center justify-end mt-1 cursor-pointer"
                    onClick={() => toggleTaskTimeline(task?.id || index)}
                  >
                    {expandedTasks[task?.id || index] ? 'Hide Timeline' : 'Show Timeline'}
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-4 w-4 ml-1 transition-transform ${expandedTasks[task?.id || index] ? 'rotate-180' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            {expandedTasks[task?.id || index] && task?.statusHistory && task.statusHistory.length > 0 && (
              <div className="mt-4 border-t border-gray-200 pt-3">
                <StatusTimeline statusHistory={task.statusHistory} />
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default TaskGroup;