import React from 'react';
import FunnelCard from './FunnelCard';
import { formatDuration,getStatusColor } from '../../utils/formatters';

 // Make sure this import exists

function FunnelView({ funnelData, expandedFunnels, toggleFunnel }) {
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

  return (
    <div className="space-y-4">
      {/* Latest Task Section - Not a dropdown */}
      {latestTaskDetails && (
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Latest Task</h3>
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:justify-between">
              <div className="mb-2 sm:mb-0">
                <div className="font-medium">{latestTaskDetails.name || 'Unknown Task'}</div>
                <div className="text-sm text-gray-500">ID: {latestTaskDetails.id || 'N/A'}</div>
              </div>
              <div className="flex flex-col sm:items-end">
                <div className="text-sm">
                  <span className="font-medium">Status:</span>{' '}
                  <span className={getStatusColor(latestTaskDetails.currentStatus || 'UNKNOWN')}>
                    {latestTaskDetails.currentStatus || 'UNKNOWN'}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  <span className="font-medium">Handled by:</span> {latestTaskDetails.handledBy || 'N/A'}
                </div>
                {(latestTaskDetails.duration !== undefined || latestTaskDetails.sendbacks !== undefined) && (
                  <div className="text-sm text-gray-500">
                    {latestTaskDetails.duration !== undefined && (
                      <span className="mr-3">
                        <span className="font-medium">Duration:</span> {formatDuration(latestTaskDetails.duration)}
                      </span>
                    )}
                    {latestTaskDetails.sendbacks !== undefined && (
                      <span>
                        <span className="font-medium">Sendbacks:</span> {latestTaskDetails.sendbacks}
                      </span>
                    )}
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