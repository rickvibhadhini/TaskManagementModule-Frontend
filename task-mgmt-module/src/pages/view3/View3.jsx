import React, { useState, useMemo, useRef } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const View3 = () => {
  const [selectedFunnel, setSelectedFunnel] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [channel, setChannel] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const tableRef = useRef(null);

  // Scroll to table view
  const scrollToTable = () => {
    tableRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch data from backend
  const fetchData = async (channelValue) => {
    if (!channelValue) return;
  
    setLoading(true);
    setError(null);
  
    try {
      const response = await axios.get(`http://localhost:8081/SLAMonitoring/time/${channelValue}`);
      setData(response.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle channel input submission
  const handleChannelSubmit = (e) => {
    e.preventDefault();
    fetchData(channel);
  };

  // Convert time strings to minutes for visualization
  const convertTimeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
  
    const parts = timeStr.split(' ');
    let totalMinutes = 0;
  
    for (let i = 0; i < parts.length; i += 2) {
      const value = parseFloat(parts[i]);
      const unit = parts[i + 1] || '';
    
      if (unit.startsWith('hrs')) totalMinutes += value * 60;
      else if (unit.startsWith('min')) totalMinutes += value;
      else if (unit.startsWith('sec')) totalMinutes += value / 60;
    }
  
    return totalMinutes;
  };

  // Get total TAT in minutes
  const getTATMinutes = useMemo(() => {
    if (!data || !data.averageTAT) return 100; // Default value if not available
    return convertTimeToMinutes(data.averageTAT);
  }, [data]);

  // Define colors for each funnel
  const funnelColors = {
    sourcing: "#4ade80", // Green
    credit: "#3b82f6",   // Blue
    conversion: "#f97316", // Orange
    fulfillment: "#8b5cf6" // Purple
  };

  // Define funnel order
  const funnelOrder = ["sourcing", "credit", "conversion", "fulfillment"];

  // Format the funnel data for the bar chart with specific order
  const getFunnelChartData = useMemo(() => {
    if (!data || !data.funnels) return [];
  
    return funnelOrder.map(funnel => ({
      name: funnel.charAt(0).toUpperCase() + funnel.slice(1),
      minutes: convertTimeToMinutes(data.funnels[funnel].timeTaken),
      displayTime: data.funnels[funnel].timeTaken,
      color: funnelColors[funnel]
    }));
  }, [data]);

  // Create task data organized by funnel
  const getTasksByFunnel = useMemo(() => {
    if (!data || !data.funnels) return {};
    
    const totalTAT = getTATMinutes;
    const tasksByFunnel = {};
  
    Object.entries(data.funnels).forEach(([funnel, funnelData]) => {
      tasksByFunnel[funnel] = [];
    
      Object.entries(funnelData.tasks).forEach(([taskId, taskData]) => {
        const taskNum = taskId.split('_')[1].replace('task', '');
        const taskNumber = parseInt(taskNum, 10);
        const minutes = convertTimeToMinutes(taskData.timeTaken);
        const percentOfTAT = (minutes / totalTAT) * 100;
      
        // Determine performance level based on percentage of TAT
        let performanceLevel = "good"; // Green - Good (below 60% of TAT)
        if (percentOfTAT >= 90) {
          performanceLevel = "critical"; // Red - Critical (>=90% of TAT)
        } else if (percentOfTAT >= 60) {
          performanceLevel = "warning"; // Yellow - Warning (60-90% of TAT)
        }
      
        tasksByFunnel[funnel].push({
          taskId,
          taskNumber,
          time: taskData.timeTaken,
          minutes,
          percentOfTAT,
          sendbacks: taskData.noOfSendbacks,
          performanceLevel
        });
      });
    
      // Sort tasks by task number within each funnel
      tasksByFunnel[funnel].sort((a, b) => a.taskNumber - b.taskNumber);
    });
  
    return tasksByFunnel;
  }, [data, getTATMinutes]);

  // Prepare line chart data based on selected funnel
  const getLineChartData = useMemo(() => {
    if (!data || !data.funnels) return [];
  
    if (selectedFunnel === 'all') {
      // For 'all', create a combined view with all funnels
      return Object.entries(getTasksByFunnel).flatMap(([funnel, tasks]) => 
        tasks.map(task => ({
          name: `${funnel.charAt(0).toUpperCase() + funnel.slice(1)} Task ${task.taskNumber}`,
          minutes: task.minutes,
          percentOfTAT: task.percentOfTAT,
          sendbacks: task.sendbacks,
          displayTime: task.time,
          performanceLevel: task.performanceLevel,
          funnel
        }))
      );
    } else {
      // For specific funnel, show only that funnel's tasks
      return getTasksByFunnel[selectedFunnel]?.map(task => ({
        name: `Task ${task.taskNumber}`,
        minutes: task.minutes,
        percentOfTAT: task.percentOfTAT,
        sendbacks: task.sendbacks,
        displayTime: task.time,
        performanceLevel: task.performanceLevel,
        funnel: selectedFunnel
      })) || [];
    }
  }, [getTasksByFunnel, selectedFunnel]);

  // Prepare table data
  const getTableData = useMemo(() => {
    if (!data || !data.funnels) return [];
    
    const totalTAT = getTATMinutes;
    const tableData = [];
  
    Object.entries(data.funnels).forEach(([funnel, funnelData]) => {
      Object.entries(funnelData.tasks).forEach(([taskId, taskData]) => {
        const taskNumPart = taskId.split('_')[1];
        const minutes = convertTimeToMinutes(taskData.timeTaken);
        const percentOfTAT = (minutes / totalTAT) * 100;
      
        // Determine performance level based on percentage of TAT
        let performanceLevel = "good"; // Green - Good (below 60% of TAT)
        if (percentOfTAT >= 90) {
          performanceLevel = "critical"; // Red - Critical (>=90% of TAT)
        } else if (percentOfTAT >= 60) {
          performanceLevel = "warning"; // Yellow - Warning (60-90% of TAT)
        }
      
        tableData.push({
          taskId,
          funnel,
          displayName: `${funnel.charAt(0).toUpperCase() + funnel.slice(1)} ${taskNumPart.charAt(0).toUpperCase() + taskNumPart.slice(1)}`,
          time: taskData.timeTaken,
          minutes,
          percentOfTAT,
          sendbacks: taskData.noOfSendbacks,
          performanceLevel
        });
      });
    });
  
    return tableData;
  }, [data, getTATMinutes]);

  // Filter table data based on selected funnel
  const getFilteredTableData = useMemo(() => {
    const tableData = getTableData;
    return selectedFunnel === 'all' 
      ? tableData 
      : tableData.filter(item => item.funnel === selectedFunnel);
  }, [getTableData, selectedFunnel]);

  // Custom tooltip for the bar chart
  const FunnelTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-md">
          <p className="font-semibold text-lg">{payload[0].payload.name}</p>
          <p className="text-gray-700">Average time: {payload[0].payload.displayTime}</p>
          <p className="text-blue-600 font-medium">{payload[0].value.toFixed(1)} minutes</p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for the line chart
  const TaskTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-md">
          <p className="font-semibold text-lg">{data.name}</p>
          <p className="text-gray-700">Time: {data.displayTime}</p>
          <p className="text-gray-700">% of TAT: {data.percentOfTAT.toFixed(1)}%</p>
          <p className="text-gray-700">Sendbacks: {data.sendbacks}</p>
          <p className="font-medium" style={{ 
            color: data.performanceLevel === 'critical' ? '#ef4444' : 
                  data.performanceLevel === 'warning' ? '#f59e0b' : '#22c55e' 
          }}>
            Status: {data.performanceLevel.charAt(0).toUpperCase() + data.performanceLevel.slice(1)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom dot for the line chart
  const CustomizedDot = (props) => {
    const { cx, cy, payload } = props;
  
    let fillColor = "#22c55e"; // Green for good
  
    if (payload.performanceLevel === 'critical') {
      fillColor = "#ef4444"; // Red for critical
    } else if (payload.performanceLevel === 'warning') {
      fillColor = "#f59e0b"; // Yellow for warning
    }
  
    return (
      <svg x={cx - 8} y={cy - 8} width={16} height={16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx={8} cy={8} r={8} fill={fillColor} />
      </svg>
    );
  };

  // Handle bar click to filter by funnel
  const handleBarClick = (data) => {
    if (data && data.activePayload && data.activePayload.length) {
      const funnelName = data.activePayload[0].payload.name.toLowerCase();
      setSelectedFunnel(funnelName);
    }
  };

  // Handle task click in line chart to show details
  const handleTaskClick = (data) => {
    if (data && data.activePayload && data.activePayload.length) {
      setSelectedTask(data.activePayload[0].payload);
      setShowDetailModal(true);
    }
  };

  // Task Detail Modal
  const TaskDetailModal = () => {
    if (!selectedTask) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">{selectedTask.name}</h3>
            <button 
              onClick={() => setShowDetailModal(false)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Average Time</p>
              <p className="text-xl font-bold">{selectedTask.displayTime}</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">% of Total TAT</p>
              <p className="text-xl font-bold">{selectedTask.percentOfTAT?.toFixed(1)}%</p>
            </div>
          
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Sendbacks</p>
              <div className="flex items-center">
                <p className="text-xl font-bold">{selectedTask.sendbacks}</p>
                {selectedTask.sendbacks > 2 && (
                  <span className="ml-2 px-2 py-1 bg-amber-100 text-amber-600 text-xs font-medium rounded-full">
                    High
                  </span>
                )}
              </div>
            </div>
          
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Status</p>
              <p className={`text-xl font-bold ${
                selectedTask.performanceLevel === 'critical' ? 'text-red-600' : 
                selectedTask.performanceLevel === 'warning' ? 'text-amber-600' : 
                'text-green-600'
              }`}>
                {selectedTask.performanceLevel.charAt(0).toUpperCase() + selectedTask.performanceLevel.slice(1)}
              </p>
            </div>
          
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Funnel</p>
              <div className="flex items-center">
                <div className="w-3 h-3 mr-2 rounded-full" style={{ backgroundColor: funnelColors[selectedTask.funnel] }}></div>
                <p className="text-xl font-bold capitalize">{selectedTask.funnel}</p>
              </div>
            </div>
          </div>
        
          <button 
            onClick={() => setShowDetailModal(false)}
            className="mt-6 w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  // Clock Component
  const Clock = ({ size = 24, className = "" }) => {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
    );
  };

  // AlertCircle Component
  const AlertCircle = ({ size = 24, className = "" }) => {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    );
  };

  // Table icon component
  const TableIcon = ({ size = 24, className = "" }) => {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="3" y1="9" x2="21" y2="9"></line>
        <line x1="3" y1="15" x2="21" y2="15"></line>
        <line x1="9" y1="3" x2="9" y2="21"></line>
        <line x1="15" y1="3" x2="15" y2="21"></line>
      </svg>
    );
  };

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden bg-slate-50">
      {showDetailModal && <TaskDetailModal />}
    
      <header className="bg-white p-4 shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2 md:mb-0">SLA Monitoring Dashboard</h1>

        
        
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <form onSubmit={handleChannelSubmit} className="flex items-center">
              <input
                type="text"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                placeholder="Enter channel"
                className="px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-black rounded-r-md hover:bg-blue-600 transition-colors"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load Data'}
              </button>
            </form>
          
            {data && (
              <div className="flex items-center p-3 bg-blue-50 rounded-md">
                <Clock className="mr-2 text-blue-500" size={20} />
                <span className="font-medium">Total Average Turnaround Time:</span>
                <span className="ml-2 font-bold text-blue-700">{data.averageTAT}</span>
              </div>
            )}
          </div>
        </div>
      
        {error && (
          <div className="mt-2 p-2 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {data && (
          <button
            onClick={scrollToTable}
            className="ml-4 flex items-center px-3 py-2 bg-blue-500 text-black rounded-md hover:bg-blue-600 transition-colors"
            title="View tabular data"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="3" y1="15" x2="21" y2="15"></line>
              <line x1="9" y1="3" x2="9" y2="21"></line>
              <line x1="15" y1="3" x2="15" y2="21"></line>
            </svg>
            View Table
          </button>
        )}

      </header>
    
      {!data ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-xl font-semibold mb-4">Welcome to SLA Monitoring Dashboard</h2>
            <p className="text-gray-600 mb-6">Enter a channel in the input field above to load SLA monitoring data.</p>
            <div className="p-8 bg-gray-100 rounded-lg">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-4 text-sm text-gray-500">Data visualization will appear here</p>
            </div>
          </div>
        </div>
      ) : (
        <main className="flex-1 overflow-auto p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Funnel Time Chart */}
          <div className="bg-white p-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Average Time Per Funnel</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={getFunnelChartData} 
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  onClick={handleBarClick}
                  className="cursor-pointer"
                >
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                  <Tooltip content={<FunnelTooltip />} />
                  <Legend />
                  <Bar 
                    dataKey="minutes" 
                    name="Average Time (minutes)"
                    radius={[4, 4, 0, 0]}
                    animationDuration={1500}
                  >
                    {getFunnelChartData.map((entry, index) => (
                      <rect key={`rect-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          
            <div className="mt-4 flex justify-center space-x-4">
              {funnelOrder.map(funnel => (
                <div key={funnel} 
                     className="flex items-center cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-md transition-colors"
                     onClick={() => setSelectedFunnel(funnel)}>
                  <div className="w-4 h-4 mr-2 rounded" style={{ backgroundColor: funnelColors[funnel] }}></div>
                  <span className="text-sm capitalize">{funnel}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Task Sequence Line Graph */}
          <div className="bg-white p-4 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
              <h2 className="text-xl font-semibold mb-2 sm:mb-0">Task Sequence Timeline</h2>
              <div className="flex flex-wrap justify-center space-x-2">
                <button 
                  onClick={() => setSelectedFunnel('all')} 
                  className={`px-3 py-1 rounded transition-colors ${selectedFunnel === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  All
                </button>
                {funnelOrder.map(funnel => (
                  <button 
                    key={funnel}
                    onClick={() => setSelectedFunnel(funnel)} 
                    className={`px-3 py-1 rounded capitalize transition-colors ${selectedFunnel === funnel ? 'text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                    style={{ 
                      backgroundColor: selectedFunnel === funnel ? funnelColors[funnel] : undefined,
                    }}
                  >
                    {funnel}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={getLineChartData} 
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  onClick={handleTaskClick}
                  className="cursor-pointer"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis 
                    label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }}
                    domain={[0, Math.max(getTATMinutes * 1.2, ...getLineChartData.map(item => item.minutes))]}
                  />
                  <Tooltip content={<TaskTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="minutes" 
                    name="Time (minutes)"
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={<CustomizedDot />}
                    activeDot={{ r: 8 }}
                    isAnimationActive={true}
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          
            <div className="mt-4 flex flex-wrap justify-between">
              <div className="flex flex-wrap justify-center space-x-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 mr-1 rounded-full" style={{ backgroundColor: "#22c55e" }}></div>
                  <span className="text-sm">Good (&lt;60% of TAT)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 mr-1 rounded-full" style={{ backgroundColor: "#f59e0b" }}></div>
                  <span className="text-sm">Warning (60-90% of TAT)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 mr-1 rounded-full" style={{ backgroundColor: "#ef4444" }}></div>
                  <span className="text-sm">Critical (&gt;90% of TAT)</span>
                </div>
              </div>
              
              <button
                onClick={scrollToTable}
                className="mt-2 sm:mt-0 flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                <TableIcon size={18} className="mr-2" />
                View Table
              </button>
            </div>
          </div>

          {/* Task Metrics Table */}
          <div ref={tableRef} className="bg-white p-4 rounded-lg shadow-md col-span-1 lg:col-span-2 transition-all duration-300 hover:shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
              <h2 className="text-xl font-semibold mb-2 sm:mb-0">Task Metrics</h2>
              <div className="flex flex-wrap justify-center space-x-2">
                <button 
                  onClick={() => setSelectedFunnel('all')} 
                  className={`px-3 py-1 rounded transition-colors ${selectedFunnel === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  All
                </button>
                {funnelOrder.map(funnel => (
                  <button 
                    key={funnel}
                    onClick={() => setSelectedFunnel(funnel)} 
                    className={`px-3 py-1 rounded capitalize transition-colors ${selectedFunnel === funnel ? 'text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                    style={{ 
                      backgroundColor: selectedFunnel === funnel ? funnelColors[funnel] : undefined,
                    }}
                  >
                    {funnel}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% of TAT</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Sendbacks</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getFilteredTableData.map((task) => (
                    <tr key={task.taskId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: funnelColors[task.funnel] }}></div>
                          {task.displayName}
                        </div>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">{task.time}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">{task.percentOfTAT.toFixed(1)}%</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          {task.sendbacks > 2 ? (
                            <AlertCircle className="mr-1 text-amber-500" size={16} />
                          ) : null}
                          {task.sendbacks}
                        </div>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.performanceLevel === 'critical' ? 'bg-red-100 text-red-600' : 
                          task.performanceLevel === 'warning' ? 'bg-amber-100 text-amber-600' : 
                          'bg-green-100 text-green-600'
                        }`}>
                          {task.performanceLevel.charAt(0).toUpperCase() + task.performanceLevel.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm">
                        <button 
                          onClick={() => {
                            setSelectedTask({
                              ...task,
                              name: task.displayName,
                              displayTime: task.time,
                            });
                            setShowDetailModal(true);
                          }}
                          className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      )}
    </div>
  );
};

export default View3;