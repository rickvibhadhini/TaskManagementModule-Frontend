import React from 'react';
import FunnelCard from './FunnelCard';
import { formatDuration, getStatusColor } from '../../utils/formatters';

function FunnelView({ 
  funnelData, 
  expandedFunnels, 
  toggleFunnel, 
  sendbackMap, 
  navigateToTask,
  expandedTasks,
  setExpandedTasks
}) {
  // Separate the data into three categories
  const latestTask = funnelData.find(funnel => funnel.id === 'latest-task');
  const regularFunnels = funnelData.filter(funnel => 
    funnel.id !== 'latest-task' && !funnel.id.startsWith('sendback-')
  );
  const sendbackFunnels = funnelData.filter(funnel => 
    funnel.id.startsWith('sendback-')
  );

  // Extract the latest task details if available
  const latestTaskDetails = latestTask?.tasks[0];
  
  // Find which funnel contains the latest task (if any)
  const findTaskInFunnels = () => {
    if (!latestTaskDetails?.id) return null;
    
    for (const funnel of regularFunnels) {
      const matchingTask = funnel.tasks.find(task => task.id === latestTaskDetails.id);
      if (matchingTask) {
        return { funnelId: funnel.id, taskId: matchingTask.id };
      }
    }
    return null;
  };
  
  const handleLatestTaskClick = () => {
    const location = findTaskInFunnels();
    if (location) {
      navigateToTask(location.funnelId, location.taskId);
    }
  };

  // Group sendback funnels by reason
  const sendbacksByReason = {};
  sendbackFunnels.forEach(funnel => {
    const reason = funnel.sendbackReason || 'Unknown';
    if (!sendbacksByReason[reason]) {
      sendbacksByReason[reason] = [];
    }
    sendbacksByReason[reason].push(funnel);
  });

  return (
    <div className="space-y-4">
      {/* Redesigned Latest Task Section - Compact and Centered with Handled By */}
      {latestTaskDetails && (
        <div className="mb-6 flex justify-center">
          <div 
            className="bg-white shadow-md rounded-lg border-l-4 border-yellow-400 hover:shadow-lg transition-shadow duration-200 cursor-pointer max-w-md w-full"
            onClick={handleLatestTaskClick}
            title="Click to find this task in its funnel"
          >
            <div className="px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-1 rounded">Latest Task</span>
                <span className={getStatusColor(latestTaskDetails.currentStatus || 'UNKNOWN')}>
                  {latestTaskDetails.currentStatus || 'UNKNOWN'}
                </span>
              </div>
              
              {/* Task name in ALL CAPS */}
              <div className="font-medium text-gray-900 uppercase">{latestTaskDetails.name || 'Unknown Task'}</div>
              
              <div className="flex justify-between items-center mt-2 text-sm">
                {/* Added Handled By */}
                <div className="text-gray-500">
                  <span className="font-medium">Handled by:</span> {latestTaskDetails.handledBy || 'N/A'}
                </div>
                
                {latestTaskDetails.duration !== undefined && (
                  <div className="text-gray-500">
                    {formatDuration(latestTaskDetails.duration)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Regular Funnels Section */}
      {regularFunnels.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Funnels</h3>
          <div className="space-y-4">
            {regularFunnels.map(funnel => (
              <FunnelCard
                key={funnel.id}
                funnel={funnel}
                isExpanded={expandedFunnels[funnel.id] || false}
                toggleFunnel={() => toggleFunnel(funnel.id)}
                isBlue={true}
                sendbackMap={sendbackMap}
                expandedTasks={expandedTasks}
                setExpandedTasks={setExpandedTasks}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sendback Tasks Section */}
      {sendbackFunnels.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sendback Tasks</h3>
          <div className="space-y-4">
            {sendbackFunnels.map(funnel => (
              <FunnelCard
                key={funnel.id}
                funnel={funnel}
                isExpanded={expandedFunnels[funnel.id] || false}
                toggleFunnel={() => toggleFunnel(funnel.id)}
                isSendback={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* No data message */}
      {funnelData.length === 0 && (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-500">No funnel data available.</p>
        </div>
      )}
    </div>
  );
}

export default FunnelView;