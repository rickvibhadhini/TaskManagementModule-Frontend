import React, { useState, useEffect } from 'react';
import TaskTimeline from './TaskTimeline.jsx';
import FunnelSummary from './FunnelSummary.jsx';
import FilterPanel from './FilterPanel.jsx';
import { processDataForChart, funnelColors, statusColors } from '../../utils/Ganntutils.js';

const GanttChart = ({ data }) => {
  const [tasks, setTasks] = useState([]);
  const [funnels, setFunnels] = useState([]);
  const [timeRange, setTimeRange] = useState({ start: null, end: null });
  const [activeTab, setActiveTab] = useState('timeline');
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    dateRange: null,
    funnels: []
  });
  const [timeScale, setTimeScale] = useState(60 * 60 * 1000); // Default: 1 hour
  // Compact view is always on (no toggle)
  const compactView = true;

  useEffect(() => {
    if (!data || !data.funnelGroupResponses) return;

    // Process data for the chart
    const { processedTasks, uniqueFunnels, timeRange } = processDataForChart(data.funnelGroupResponses);
    setTasks(processedTasks);
    setFunnels(uniqueFunnels);
    setTimeRange(timeRange);
  }, [data]);

  // Get all unique statuses for the legend and filters
  const allStatuses = [...new Set(tasks.flatMap(task => 
    task.statuses.map(status => status.status)
  ))];

  // Filter tasks based on current filters
  const filteredTasks = tasks.filter(task => {
    // Status filter
    if (filters.status && !task.statuses.some(s => s.status === filters.status)) {
      return false;
    }

    // Search filter
    if (filters.search && !task.id.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }

    // Funnel filter
    if (filters.funnels.length > 0 && !filters.funnels.includes(task.funnel)) {
      return false;
    }

    // Date range filter
    if (filters.dateRange) {
      const { start, end } = filters.dateRange;
      const taskStart = task.segments[0]?.startTime;
      const taskEnd = task.segments[task.segments.length - 1]?.endTime;
  
      if (taskStart > end || taskEnd < start) {
        return false;
      }
    }

    return true;
  });

  // Group tasks by funnel
  const tasksByFunnel = {};
  filteredTasks.forEach(task => {
    if (!tasksByFunnel[task.funnel]) {
      tasksByFunnel[task.funnel] = [];
    }
    tasksByFunnel[task.funnel].push(task);
  });

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Task Workflow Timeline</h2>
    
        <select 
          className="form-select text-sm border-gray-300 rounded-md"
          value={timeScale}
          onChange={(e) => setTimeScale(Number(e.target.value))}
        >
          <option value={60 * 60 * 1000}>Hour Scale</option>
          <option value={30 * 60 * 1000}>30 Min Scale</option>
          <option value={10 * 60 * 1000}>10 Min Scale</option>
          <option value={60 * 1000}>Minute Scale</option>
        </select>
      </div>
  
      {/* Tabs - only timeline and summary */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {['timeline', 'summary'].map((tab) => (
            <button
              key={tab}
              className={`${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm capitalize`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
  
      {/* Filter Panel */}
      <FilterPanel 
        allStatuses={allStatuses} 
        funnels={funnels} 
        onFilterChange={handleFilterChange}
      />
  
      {/* Status legend */}
      {activeTab === 'timeline' && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Status Legend</h3>
          <div className="flex flex-wrap gap-4">
            {allStatuses.map((status, idx) => (
              <div 
                key={idx} 
                className={`flex items-center px-3 py-1 rounded-full ${
                  filters.status === status ? 'bg-blue-100 border border-blue-300' : 'bg-gray-100'
                }`}
                onClick={() => handleFilterChange({ status: filters.status === status ? '' : status })}
                style={{ cursor: 'pointer' }}
              >
                <div 
                  className="w-4 h-4 rounded-full mr-2" 
                  style={{ backgroundColor: statusColors[status] || '#6B7280' }}
                ></div>
                <span className="font-medium">{status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
  
      {/* Content based on active tab */}
      {activeTab === 'timeline' && (
        <>
          {/* Task Timeline Component */}
          <TaskTimeline 
            funnels={funnels}
            tasksByFunnel={tasksByFunnel}
            timeRange={timeRange}
            timeScale={timeScale}
            compactView={compactView}
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </>
      )}
  
      {activeTab === 'summary' && (
        <>
          {/* Funnel Summary Component */}
          <FunnelSummary 
            funnels={funnels}
            tasks={filteredTasks}
            allTasks={tasks}
          />
        </>
      )}
    </div>
  );
};

export default GanttChart;