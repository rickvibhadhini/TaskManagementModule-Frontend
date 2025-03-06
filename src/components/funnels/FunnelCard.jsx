
import React, { useState } from 'react';
import TaskGroup from './TaskGroup';

function FunnelCard({ funnel, isExpanded, onToggle }) {
  const [expandedTasks, setExpandedTasks] = useState({});
  
  const toggleTask = (taskId) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Funnel Header */}
      <div 
        className="px-4 py-3 bg-gray-50 flex items-center justify-between cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center space-x-2">
          <span className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
            ▶
          </span>
          <h3 className="font-medium text-gray-900">{funnel.name}</h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">{funnel.progress}</span>
          <span className={`px-2 py-1 rounded-full text-xs ${
            funnel.status === 'completed' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {funnel.status === 'completed' ? 'Completed' : 'In Progress'}
          </span>
        </div>
      </div>
      
      {/* Task Groups */}
      {isExpanded && (
        <div className="divide-y divide-gray-200">
          {funnel.tasks.map(task => (
            <TaskGroup 
              key={task.id}
              task={task}
              isExpanded={expandedTasks[task.id]}
              onToggle={() => toggleTask(task.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default FunnelCard;