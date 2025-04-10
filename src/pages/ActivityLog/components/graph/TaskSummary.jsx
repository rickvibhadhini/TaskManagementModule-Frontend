import React, { useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { format } from 'date-fns';
import { funnelColors, statusColors } from '../../utils/Ganntutils';

const TaskSummary = ({ data, filteredTasks }) => {
  const [selectedMetric, setSelectedMetric] = useState('status');
  const metricTypes = ['status', 'funnel', 'time']; // Renamed from metrics
  
  if (!data || !data.funnelGroups) return null;
  
  // Aggregate data for charts
  const aggregateData = () => {
    // For status chart
    const statusData = {};
    filteredTasks.forEach(task => {
      const finalStatus = task.finalStatus?.status || 'UNKNOWN';
      statusData[finalStatus] = (statusData[finalStatus] || 0) + 1;
    });
    
    // For funnel chart
    const funnelData = {};
    filteredTasks.forEach(task => {
      funnelData[task.funnel] = (funnelData[task.funnel] || 0) + 1;
    });
    
    // For time chart (tasks per hour)
    const timeData = {};
    filteredTasks.forEach(task => {
      const firstSegment = task.segments[0];
      if (firstSegment) {
        const hour = format(firstSegment.startTime, 'HH:00');
        timeData[hour] = (timeData[hour] || 0) + 1;
      }
    });
    
    return { statusData, funnelData, timeData };
  };
  
  const { statusData, funnelData, timeData } = aggregateData();
  
  // Calculate performance metrics
  const calculatePerformanceMetrics = () => {
    // Average time to completion
    const completedTasks = filteredTasks.filter(t => 
      t.finalStatus && t.finalStatus.status === 'COMPLETED'
    );
    
    let avgCompletionTime = 0;
    if (completedTasks.length > 0) {
      const totalTime = completedTasks.reduce((sum, task) => {
        const firstSegment = task.segments[0];
        const lastSegment = task.segments[task.segments.length - 1];
        return sum + (lastSegment.endTime - firstSegment.startTime);
      }, 0);
      avgCompletionTime = totalTime / completedTasks.length;
    }
    
    // Find the slowest status transition
    let slowestTransition = { status: 'None', time: 0 };
    filteredTasks.forEach(task => {
      task.segments.forEach(segment => {
        const duration = segment.endTime - segment.startTime;
        if (duration > slowestTransition.time) {
          slowestTransition = { status: segment.status, time: duration };
        }
      });
    });
    
    return {
      avgCompletionTime,
      slowestTransition,
      completionRate: filteredTasks.length > 0 
        ? (completedTasks.length / filteredTasks.length * 100).toFixed(1) 
        : 0
    };
  };
  
  const performanceMetrics = calculatePerformanceMetrics(); // Renamed from metrics
  
  // Format time in a human-readable way
  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds} seconds`;
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };
  
  // Prepare chart data
  const prepareChartData = (dataType) => {
    let labels, dataValues, backgroundColors;
    
    if (dataType === 'status') {
      labels = Object.keys(statusData);
      dataValues = Object.values(statusData);
      backgroundColors = labels.map(status => statusColors[status] || '#6B7280');
    } else if (dataType === 'funnel') {
      labels = Object.keys(funnelData);
      dataValues = Object.values(funnelData);
      backgroundColors = labels.map(funnel => funnelColors[funnel] || '#95a5a6');
    } else if (dataType === 'time') {
      // Sort time labels chronologically
      labels = Object.keys(timeData).sort();
      dataValues = labels.map(hour => timeData[hour]);
      backgroundColors = Array(labels.length).fill('#3B82F6');
    }
    
    return {
      labels,
      datasets: [
        {
          data: dataValues,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map(color => color),
          borderWidth: 1,
        },
      ],
    };
  };
  
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Task Analytics</h3>
      
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <h4 className="text-gray-500 text-sm mb-2">Avg. Completion Time</h4>
          <p className="text-2xl font-bold">{formatTime(performanceMetrics.avgCompletionTime)}</p>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <h4 className="text-gray-500 text-sm mb-2">Completion Rate</h4>
          <p className="text-2xl font-bold">{performanceMetrics.completionRate}%</p>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <h4 className="text-gray-500 text-sm mb-2">Slowest Status</h4>
          <p className="text-2xl font-bold flex items-center">
            <span 
              className="inline-block w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: statusColors[performanceMetrics.slowestTransition.status] || '#6B7280' }}
            ></span>
            {performanceMetrics.slowestTransition.status}
          </p>
          <p className="text-sm text-gray-500">{formatTime(performanceMetrics.slowestTransition.time)}</p>
        </div>
      </div>
      
      {/* Chart Selection */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
        <div className="flex justify-between mb-4">
          <h4 className="font-medium">Task Distribution</h4>
          <div className="flex space-x-2">
            <button 
              className={`px-3 py-1 text-sm rounded-md ${
                selectedMetric === 'status' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
              onClick={() => setSelectedMetric('status')}
            >
              By Status
            </button>
            <button 
              className={`px-3 py-1 text-sm rounded-md ${
                selectedMetric === 'funnel' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
              onClick={() => setSelectedMetric('funnel')}
            >
              By Funnel
            </button>
            <button 
              className={`px-3 py-1 text-sm rounded-md ${
                selectedMetric === 'time' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
              onClick={() => setSelectedMetric('time')}
            >
              By Time
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Chart */}
          <div className="h-64">
            {selectedMetric === 'time' ? (
              <Bar 
                data={prepareChartData('time')} 
                options={{ 
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } }
                }} 
              />
            ) : (
              <Pie 
                data={prepareChartData(selectedMetric)} 
                options={{ 
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'right' } }
                }} 
              />
            )}
          </div>
          
          {/* Stats */}
          <div>
            <h5 className="font-medium mb-2 capitalize">{selectedMetric} Distribution</h5>
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {selectedMetric === 'status' && Object.entries(statusData).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <span className="flex items-center">
                    <span 
                      className="inline-block w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: statusColors[status] || '#6B7280' }}
                    ></span>
                    {status}
                  </span>
                  <span className="font-medium">{count} tasks</span>
                </div>
              ))}
              
              {selectedMetric === 'funnel' && Object.entries(funnelData).map(([funnel, count]) => (
                <div key={funnel} className="flex justify-between items-center">
                  <span className="flex items-center">
                    <span 
                      className="inline-block w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: funnelColors[funnel] || '#95a5a6' }}
                    ></span>
                    {funnel}
                  </span>
                  <span className="font-medium">{count} tasks</span>
                </div>
              ))}
              
              {selectedMetric === 'time' && Object.entries(timeData)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([hour, count]) => (
                <div key={hour} className="flex justify-between items-center">
                  <span>{hour}</span>
                  <span className="font-medium">{count} tasks</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Tasks Table */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h4 className="font-medium mb-4">Task Details</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Funnel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Started
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTasks.slice(0, 10).map((task, idx) => {
                const firstSegment = task.segments[0];
                const lastSegment = task.segments[task.segments.length - 1];
                const duration = lastSegment.endTime - firstSegment.startTime;
                
                return (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {task.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="flex items-center">
                        <span 
                          className="inline-block w-2 h-2 rounded-full mr-2"
                          style={{ backgroundColor: funnelColors[task.funnel] || '#95a5a6' }}
                        ></span>
                        {task.funnel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="flex items-center">
                        <span 
                          className="inline-block w-2 h-2 rounded-full mr-2"
                          style={{ backgroundColor: statusColors[task.finalStatus?.status] || '#6B7280' }}
                        ></span>
                        {task.finalStatus?.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(firstSegment.startTime, 'HH:mm:ss')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTime(duration)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredTasks.length > 10 && (
          <p className="text-sm text-gray-500 mt-2">
            Showing 10 of {filteredTasks.length} tasks
          </p>
        )}
      </div>
    </div>
  );
};

export default TaskSummary;