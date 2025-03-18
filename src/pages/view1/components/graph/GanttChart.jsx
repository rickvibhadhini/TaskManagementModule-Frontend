import React, { useState, useEffect } from 'react';
import TaskTimeline from './TaskTimeline.jsx';
import FunnelSummary from './FunnelSummary.jsx';
import { processDataForChart, funnelColors, statusColors } from '../../utils/Ganntutils.js';

// const timeScales = [
//   { label: 'Per Hour', value: 60 * 60 * 1000 }, // milliseconds
//   { label: 'Per Minute', value: 60 * 1000 },
//   { label: 'Every 30 Minutes', value: 30 * 60 * 1000 },
// ];

const GanttChart = ({ data }) => {
  const [tasks, setTasks] = useState([]);
  const [funnels, setFunnels] = useState([]);
  const [timeRange, setTimeRange] = useState({ start: null, end: null });
  //const [selectedScale, setSelectedScale] = useState(timeScales[0].value);

  useEffect(() => {
    if (!data || !data.funnelGroupResponses) return;

    // Process data for the chart
    const { processedTasks, uniqueFunnels, timeRange } = processDataForChart(data.funnelGroupResponses);
    setTasks(processedTasks);
    setFunnels(uniqueFunnels);
    setTimeRange(timeRange);
  }, [data]);

  // Get all unique statuses for the legend
  const allStatuses = [...new Set(tasks.flatMap(task => 
    task.statuses.map(status => status.status)
  ))];

  // Group tasks by funnel
  const tasksByFunnel = {};
  tasks.forEach(task => {
    if (!tasksByFunnel[task.funnel]) {
      tasksByFunnel[task.funnel] = [];
    }
    tasksByFunnel[task.funnel].push(task);
  });

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">Task Workflow Timeline</h2>
      
      {/* Time Scale Selector
      <div className="mb-4">
        <label className="mr-2">Select Time Scale:</label>
        <select 
          value={selectedScale} 
          onChange={(e) => setSelectedScale(Number(e.target.value))}
        >
          {timeScales.map(scale => (
            <option key={scale.value} value={scale.value}>
              {scale.label}
            </option>
          ))}
        </select>
      </div> */}
      
      {/* Status legend */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Status Legend</h3>
        <div className="flex flex-wrap gap-4">
          {allStatuses.map((status, idx) => (
            <div key={idx} className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
              <div 
                className="w-4 h-4 rounded-full mr-2" 
                style={{ backgroundColor: statusColors[status] || '#6B7280' }}
              ></div>
              <span className="font-medium">{status}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Funnel legend */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Funnels</h3>
        <div className="flex flex-wrap gap-4">
          {funnels.map((funnel, idx) => (
            <div key={idx} className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
              <div 
                className="w-4 h-4 rounded-full mr-2" 
                style={{ backgroundColor: funnelColors[funnel] || '#95a5a6' }}
              ></div>
              <span className="font-medium">{funnel}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Task Timeline Component */}
      <TaskTimeline 
        funnels={funnels}
        tasksByFunnel={tasksByFunnel}
        timeRange={timeRange}
        //selectedScale={selectedScale}
      />
      
      {/* Funnel Summary Component */}
      <FunnelSummary 
        funnels={funnels}
        tasks={tasks}
      />
    </div>
  );
};

export default GanttChart;