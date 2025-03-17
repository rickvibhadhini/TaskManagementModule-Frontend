import React, { useState } from 'react';
import StatusTimeline from './StatusTimeline';
import { getStatusDotColor, getStatusColor, formatDuration } from '../../utils/formatters';

function TaskGroup({ tasks, isSendback }) {
  // State to track which tasks have expanded timelines
  const [expandedTasks, setExpandedTasks] = useState({});

  // Toggle timeline visibility for a task
  const toggleTaskTimeline = (taskId) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  // Sort tasks by createdAt date if available
  const sortedTasks = [...tasks].sort((a, b) => {
    // Check if both tasks have createdAt property
    if (a?.createdAt && b?.createdAt) {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
    // If only one has createdAt, prioritize the one without
    if (a?.createdAt) return 1;
    if (b?.createdAt) return -1;
    // If neither has createdAt, maintain original order
    return 0;
  });

  // For sendback view, combine all status histories from all tasks
  const sendbackStatusHistory = isSendback ? 
    // Flatten all status histories from all tasks
    sortedTasks.flatMap(task => 
      // If task has statusHistory, use it
      task.statusHistory && task.statusHistory.length > 0 
        ? task.statusHistory.map(status => ({
            ...status,
            handledBy: task.handledBy,
            taskId: task.id
          }))
        // Otherwise create a single status entry from the task
        : [{
            status: task.currentStatus || 'UNKNOWN',
            updatedAt: task.updatedAt || task.createdAt || new Date().toISOString(),
            handledBy: task.handledBy,
            taskId: task.id
          }]
    )
    // Sort by updatedAt date
    .sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt))
    : [];

  return (
    <div className="space-y-3">
      {isSendback ? (
        // Single Sendback Card with Timeline
        <div className="bg-pink-50 p-3 rounded-md">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <div className="flex items-center">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded mr-2">
                  Sendback
                </span>
                <span className="font-medium">Sendback History</span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {sortedTasks.length} sendback tasks
              </div>
            </div>
            
            <div className="flex-1 flex justify-end">
              <div className="text-right">
                <div className="text-sm mb-1">
                  <span className="font-medium">Statuses: </span>
                  <span className="text-gray-600">
                    {[...new Set(sortedTasks.map(t => t.currentStatus))].join(', ')}
                  </span>
                </div>
                <div className="text-sm text-gray-500 mb-1">
                  <span className="font-medium">Handled by: </span>
                  {[...new Set(sortedTasks.map(t => t.handledBy))].join(', ') || 'N/A'}
                </div>
                <div className="text-sm text-gray-500 mb-1">
                  <span className="font-medium">Total Duration: </span>
                  {formatDuration(sortedTasks.reduce((sum, t) => sum + (t.duration || 0), 0))}
                </div>
                
                {/* Show Timeline button on the outer card */}
                <div 
                  className="text-xs text-blue-600 flex items-center justify-end mt-1 cursor-pointer"
                  onClick={() => toggleTaskTimeline('sendback-timeline')}
                >
                  {expandedTasks['sendback-timeline'] ? 'Hide Timeline' : 'Show Timeline'}
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-4 w-4 ml-1 transition-transform ${expandedTasks['sendback-timeline'] ? 'rotate-180' : ''}`} 
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
          
          {/* Timeline for all sendback tasks using your existing StatusTimeline component */}
          {expandedTasks['sendback-timeline'] && sendbackStatusHistory.length > 0 && (
            <div className="mt-4 border-t border-pink-200 pt-3">
              <StatusTimeline statusHistory={sendbackStatusHistory} />
            </div>
          )}
        </div>
      ) : (
        // Regular Tasks - List View
        sortedTasks.map((task, index) => (
          <div key={task?.id || index} className="bg-gray-50 p-3 rounded-md">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <div className="font-medium">{task?.name || 'Unknown Task'}</div>
                <div className="text-sm text-gray-500">ID: {task?.id || 'N/A'}</div>
              </div>
              
              <div className="flex-1 flex justify-end">
                <div className="text-right">
                  <div className="text-sm mb-1">
                    <span className="font-medium">Status: </span>
                    <span className={getStatusColor(task?.currentStatus || 'UNKNOWN')}>
                      {task?.currentStatus || 'UNKNOWN'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mb-1">
                    <span className="font-medium">Handled by: </span>{task?.handledBy || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-500 flex justify-end mb-1">
                    {task?.duration !== undefined && (
                      <span className="mr-4">
                        <span className="font-medium">Duration: </span>{formatDuration(task.duration)}
                      </span>
                    )}
                    {task?.sendbacks !== undefined && (
                      <span>
                        <span className="font-medium">Sendbacks: </span>{task.sendbacks}
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
            
            {/* Status Timeline for Regular Task */}
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