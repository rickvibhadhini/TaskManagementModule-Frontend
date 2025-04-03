import React, { forwardRef } from 'react';
import { funnelColors } from '../../../../utils/Ganntutils';

const TaskSidebar = forwardRef(({ 
  funnels, 
  processedTasks, 
  collapsedFunnels, 
  toggleFunnel, 
  handleTaskClick, 
  handleTaskMouseEnter, 
  handleTaskMouseLeave,
  rowHeight,
  funnelHeaderHeight
}, ref) => {
  // Calculate completion percentage
  const calculateCompletionPercentage = (tasks) => {
    if (tasks.length === 0) return 0;
    
    const completedTasks = tasks.filter(task => 
      task.finalStatus && task.finalStatus.status === 'COMPLETED'
    ).length;
    
    return Math.round((completedTasks / tasks.length) * 100);
  };

  // Format task display name
  const getTaskDisplayName = (task) => {
    // Check if this is a sendback task
    const isSendback = task.originalTaskId === "sendback";

    if (isSendback) {
      let displayText = "sendback";
  
      // Add target task information if available
      if (task.targetTaskId) {
        displayText += ` → ${task.targetTaskId}`;
      }
  
      // Enhanced source information with both stage and submodule
      if (task.sourceLoanStage || task.sourceSubModule) {
        displayText += ` (${task.sourceLoanStage || ''}`;
        
        if (task.sourceSubModule) {
          // Add comma only if both are present
          if (task.sourceLoanStage) displayText += ', ';
          displayText += task.sourceSubModule;
        }
        
        displayText += ')';
      }
  
      return displayText;
    }

    // For regular tasks
    return task.id;
  };

  return (
    <div 
      className="w-48 flex-shrink-0 border-r border-gray-300 overflow-y-auto"
      ref={ref}
    >
      {funnels.map((funnel, funnelIdx) => {
        // Get tasks (already sorted in parent component)
        const funnelTasks = processedTasks[funnel] || [];
        const isCollapsed = collapsedFunnels[funnel];
    
        return (
          <div key={funnelIdx}>
            {/* Funnel header with stats */}
            <div 
              className="border-b border-gray-200 bg-gray-50 flex items-center justify-between cursor-pointer"
              onClick={() => toggleFunnel(funnel)}
              style={{ height: funnelHeaderHeight }}
            >
              {/* Left side - Funnel name and collapse indicator */}
              <div className="flex items-center ml-3">
                <svg 
                  className={`w-4 h-4 transform transition-transform mr-2 ${isCollapsed ? '' : 'rotate-90'}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: funnelColors[funnel] || '#95a5a6' }}
                ></div>
                <span className="text-sm text-gray-700">{funnel}</span>
              </div>

              {/* Right side - Stats */}
              <div className="flex items-center mr-3">
                <span className="text-xs text-gray-500 mr-1">Tasks:</span>
                <span className="text-xs font-medium bg-gray-200 rounded-full px-2 py-0.5 mr-2">
                  {funnelTasks.length}
                </span>
                <span className="text-xs text-gray-500 mr-1">Success:</span>
                <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${
                  funnelTasks.length === 0 ? 'bg-gray-200 text-gray-700' :
                  calculateCompletionPercentage(funnelTasks) >= 70 ? 'bg-green-100 text-green-800' : 
                  calculateCompletionPercentage(funnelTasks) >= 40 ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  {calculateCompletionPercentage(funnelTasks)}%
                </span>
              </div>
            </div>

            {/* Task names */}
            {!isCollapsed && funnelTasks.map((task, idx) => (
              <div 
                key={`${task.id}-${idx}`} 
                className="border-b border-gray-100"
                style={{ height: rowHeight }}
              >
                <div className="h-full flex items-center px-3">
                  <span
                    className="text-sm truncate cursor-pointer hover:text-blue-600"
                    onClick={(e) => handleTaskClick(e, task, task.instances[0][0], 0)}
                    onMouseEnter={(e) => handleTaskMouseEnter(e, task, task.instances[0][0], 0)}
                    onMouseLeave={handleTaskMouseLeave}
                    title={getTaskDisplayName(task)}
                  >
                    {getTaskDisplayName(task)}
                    {task.hasCycles && (
                      <span className="ml-1 text-xs text-gray-500">
                        ({task.instances.length} cycles)
                      </span>
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
});

TaskSidebar.displayName = 'TaskSidebar';

export default TaskSidebar;