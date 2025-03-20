import React from 'react';
import { funnelColors, statusColors } from '../../utils/Ganntutils';

const FunnelSummary = ({ funnels, tasks, allTasks }) => {
  // Format time in a human-readable way
  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };
  
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Funnel Performance Summary</h3>
      
      {/* Overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 shadow-sm border border-blue-200">
          <h4 className="text-blue-800 font-medium mb-2">Total Tasks</h4>
          <p className="text-3xl font-bold text-blue-700">{allTasks.length}</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 shadow-sm border border-green-200">
          <h4 className="text-green-800 font-medium mb-2">Completed Tasks</h4>
          <p className="text-3xl font-bold text-green-700">
            {allTasks.filter(t => t.finalStatus && t.finalStatus.status === 'COMPLETED').length}
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 shadow-sm border border-purple-200">
          <h4 className="text-purple-800 font-medium mb-2">Active Funnels</h4>
          <p className="text-3xl font-bold text-purple-700">{funnels.length}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {funnels.map((funnel, index) => {
          const funnelTasks = tasks.filter(t => t.funnel === funnel);
          const statuses = [...new Set(funnelTasks.flatMap(t => t.statuses.map(s => s.status)))];
          const funnelColor = funnelColors[funnel] || '#95a5a6';
          
          // Calculate completion percentage
          const completedTasks = funnelTasks.filter(t => 
            t.finalStatus && t.finalStatus.status === 'COMPLETED'
          ).length;
          const completionPercentage = funnelTasks.length > 0 
            ? Math.round((completedTasks / funnelTasks.length) * 100) 
            : 0;
          
          return (
            <div key={index} className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-semibold text-lg flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: funnelColor }}
                  ></div>
                  <span className="text-gray-700">{funnel}</span>
                </h3>
              </div>
              
              {/* Body */}
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <span className="text-xs text-gray-500 block">Total Tasks</span>
                    <span className="text-lg font-semibold">{funnelTasks.length}</span>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded">
                    <span className="text-xs text-gray-500 block">Completed</span>
                    <span className="text-lg font-semibold">{completedTasks}</span>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="mt-3 mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Completion Rate</span>
                    <span className="font-medium">{completionPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="h-2.5 rounded-full" 
                      style={{ 
                        width: `${completionPercentage}%`,
                        backgroundColor: statusColors['COMPLETED'] || '#16a34a'
                      }}
                    ></div>
                  </div>
                </div>
                
                {/* Status breakdown */}
                <h4 className="font-medium text-sm mb-2 text-gray-700">Status Breakdown</h4>
                <div className="space-y-2">
                  {statuses.map(status => {
                    const tasksWithStatus = funnelTasks.filter(t => 
                      t.statuses.some(s => s.status === status)
                    ).length;
                    const percentage = Math.round((tasksWithStatus / funnelTasks.length) * 100) || 0;
                    
                    return (
                      <div key={status}>
                        <div className="flex justify-between items-center text-sm mb-1">
                          <span className="flex items-center">
                            <span 
                              className="inline-block w-2 h-2 rounded-full mr-2"
                              style={{ backgroundColor: statusColors[status] || '#6B7280' }}
                            ></span>
                            {status}
                          </span>
                          <span className="font-medium">{tasksWithStatus}</span>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="h-1.5 rounded-full" 
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: statusColors[status] || '#6B7280' 
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FunnelSummary;